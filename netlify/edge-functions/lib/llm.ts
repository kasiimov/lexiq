// Общий слой для всех edge-функций Congix English: список провайдеров, вызов модели и
// разбор ответа. Ключи читаются только здесь, из переменных окружения сайта.
//
// Файл лежит в подпапке lib/ — Netlify регистрирует как функции только файлы
// верхнего уровня netlify/edge-functions, поэтому это просто модуль.

export interface Provider {
  name: string;
  url: string;
  keyEnv: string;
  model: string;
  // Дополнительные поля тела запроса, специфичные для провайдера.
  extra?: Record<string, unknown>;
}

// Gemini идёт первым: из бесплатных моделей он заметно лучше держит узбекский
// (Llama ломает падежи и сбивается на турецкий). Groq остаётся резервом —
// он быстрее, и на нём три ключа для обхода rate-limit.
//
// Порядок моделей Gemini — не про качество, а про квоту. На бесплатном тарифе
// лимит считается ОТДЕЛЬНО ПО КАЖДОЙ МОДЕЛИ (quotaId
// GenerateRequestsPerDayPerProjectPerModel-FreeTier), и у gemini-2.5-flash это
// всего 20 запросов в сутки — как основная модель он умирает на третьем уроке.
// Поэтому первым идёт flash-lite с заметно большей суточной квотой, а flash
// остаётся следующей ступенью: свои 20 запросов он отдаст, когда lite споткнётся.
// Один и тот же ключ обслуживает обе — отдельный ключ для этого не нужен.
//
// reasoning_effort: "none" обязателен. Gemini 2.5 по умолчанию «думает»,
// и thinking-токены расходуют тот же max_tokens — при 700 ответ обрывался на
// первом предложении с finish_reason: "length".
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export const PROVIDERS: Provider[] = [
  {
    name: "gemini-lite",
    url: GEMINI_URL,
    keyEnv: "GEMINI_API_KEY",
    model: "gemini-2.5-flash-lite",
    extra: { reasoning_effort: "none" },
  },
  {
    name: "gemini-flash",
    url: GEMINI_URL,
    keyEnv: "GEMINI_API_KEY",
    model: "gemini-2.5-flash",
    extra: { reasoning_effort: "none" },
  },
  // На Groq берём gpt-oss-120b, а не llama-3.3-70b: на том же промпте Llama
  // выдавала прямо неверные вопросы («'Hello' ma'nosi → Good morning») и ломала
  // JSON неэкранированными кавычками. gpt-oss держит и формат, и смысл.
  // Llama остаётся последней ступенью — лучше слабый ответ, чем никакого.
  { name: "groq",  url: GROQ_URL, keyEnv: "GROQ_API_KEY",   model: "openai/gpt-oss-120b" },
  { name: "groq2", url: GROQ_URL, keyEnv: "GROQ_API_KEY_2", model: "openai/gpt-oss-120b" },
  { name: "groq3", url: GROQ_URL, keyEnv: "GROQ_API_KEY_3", model: "openai/gpt-oss-120b" },
  { name: "groq-llama", url: GROQ_URL, keyEnv: "GROQ_API_KEY", model: "llama-3.3-70b-versatile" },
];

export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const NO_KEY_HINT =
  "Netlify → Site configuration → Environment variables: GEMINI_API_KEY (ixtiyoriy zaxira: GROQ_API_KEY, _2, _3)";

export function jsonError(status: number, error: string, hint?: string): Response {
  return new Response(JSON.stringify({ error, hint }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

// Когда цепочка кончилась, «AI hozir javob bermayapti; gemini: 429» ученику
// ничего не говорит. Если все провайдеры уперлись в лимит — так и пишем,
// и подсказываем, что лечится это запасным ключом.
export function failureResponse(failures: string[]): Response {
  const allRateLimited = failures.length > 0 && failures.every((f) => f.includes("429"));
  if (allRateLimited) {
    return jsonError(
      429,
      "AI limiti tugadi. Biroz kutib, qayta urinib ko'ring.",
      "Zaxira kalit qo'shilsa, limit tugaganda so'rov avtomatik boshqa provayderga o'tadi: " + failures.join("; "),
    );
  }
  return jsonError(502, "AI hozir javob bermayapti", failures.join("; "));
}

export function configuredProviders(): Provider[] {
  return PROVIDERS.filter((p) => !!Deno.env.get(p.keyEnv));
}

export function normalizeLevel(value: unknown): string {
  return typeof value === "string" && LEVELS.includes(value) ? value : "A1";
}

export interface ChatMessage {
  role: string;
  content: string;
}

interface CallOptions {
  messages: ChatMessage[];
  maxTokens: number;
  temperature?: number;
  stream: boolean;
  json?: boolean;
}

export interface CallResult {
  response?: Response;   // сырой ответ провайдера (для стрима)
  text?: string;         // готовый текст (для не-стрима)
  provider?: string;
  failures: string[];
  fatal?: Response;      // ошибка, которую нет смысла ретраить
}

// 503 у Gemini — это «модель сейчас перегружена», состояние секундное, и
// прилетает оно часто: в замерах примерно каждый третий запрос. С одним
// повтором до ученика всё равно доходило бы ~11% отказов, поэтому пробуем
// трижды с нарастающей паузой — остаётся около процента.
// 429 (кончилась квота) так не лечится, по нему сразу уходим к следующему провайдеру.
const OVERLOAD_STATUSES = new Set([500, 502, 503, 504]);
const MAX_OVERLOAD_RETRIES = 3;
const RETRY_STEP_MS = 800;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Идёт по провайдерам сверху вниз: 429 и 5xx — пробуем следующий ключ,
// остальные ошибки возвращаем сразу, повтор их не исправит.
export async function callLLM(opts: CallOptions): Promise<CallResult> {
  const failures: string[] = [];
  const providers = configuredProviders();

  for (const provider of providers) {
    const body: Record<string, unknown> = {
      model: provider.model,
      stream: opts.stream,
      temperature: opts.temperature ?? 0.6,
      max_tokens: opts.maxTokens,
      messages: opts.messages,
      ...(provider.extra ?? {}),
    };
    if (opts.json) body.response_format = { type: "json_object" };

    let overloadRetries = 0;

    // Внутренний цикл — только ради повторов по перегрузке. Любой другой исход
    // либо возвращает результат, либо ломает цикл и передаёт ход следующему провайдеру.
    while (true) {
      try {
        const upstream = await fetch(provider.url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${Deno.env.get(provider.keyEnv)}`,
          },
          body: JSON.stringify(body),
        });

        if (OVERLOAD_STATUSES.has(upstream.status) && overloadRetries < MAX_OVERLOAD_RETRIES) {
          overloadRetries++;
          await sleep(RETRY_STEP_MS * overloadRetries);
          continue;
        }
        if (upstream.status === 429 || upstream.status >= 500) {
          failures.push(`${provider.name}: ${upstream.status}`);
          break;
        }
        if (!upstream.ok) {
          const detail = (await upstream.text()).slice(0, 300);
          // Groq возвращает 400 json_validate_failed, когда модель сама не смогла
          // собрать валидный JSON. Это не наша ошибка запроса — у другой модели
          // тот же промпт обычно проходит, поэтому передаём ход дальше по цепочке.
          if (detail.includes("json_validate_failed")) {
            failures.push(`${provider.name}: json_validate_failed`);
            break;
          }
          failures.push(`${provider.name}: ${upstream.status}`);
          return { failures, fatal: jsonError(upstream.status, "AI xatosi", detail) };
        }

        if (opts.stream) {
          if (!upstream.body) {
            failures.push(`${provider.name}: bo'sh oqim`);
            break;
          }
          return { response: upstream, provider: provider.name, failures };
        }

        const data = await upstream.json();
        const text = data?.choices?.[0]?.message?.content ?? "";
        if (!String(text).trim()) {
          failures.push(`${provider.name}: bo'sh javob`);
          break;
        }
        return { text: String(text), provider: provider.name, failures };
      } catch (e) {
        failures.push(`${provider.name}: ${(e as Error).message}`);
        break;
      }
    }
  }

  return { failures };
}

// Достаёт текстовые куски из SSE-потока провайдера и отдаёт их клиенту как
// обычный текст — на фронте не нужен парсер SSE, просто читаем поток.
export function toPlainTextStream(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const chunk = JSON.parse(payload);
              const piece = chunk?.choices?.[0]?.delta?.content;
              if (piece) controller.enqueue(encoder.encode(piece));
            } catch {
              // Неполный или служебный кусок — пропускаем, поток продолжается.
            }
          }
        }
      } catch (e) {
        controller.enqueue(encoder.encode("\n\n[uzilish: " + (e as Error).message + "]"));
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });
}

// Модели иногда оборачивают JSON в ```json ... ``` или добавляют болтовню до и
// после — вырезаем самый внешний объект и парсим его.
export function parseJsonObject(raw: string): Record<string, unknown> | null {
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}
