// LexiQ — потоковый прокси к LLM. Ключи живут только здесь (переменные окружения
// Netlify) и никогда не уезжают в браузер.
//
// Провайдеры перечислены по порядку: если ключ не задан, а также при rate-limit
// (429) или ошибке сервера (5xx) запрос уходит к следующему. Все эндпоинты
// совместимы с OpenAI Chat Completions, поэтому тело запроса одно на всех.

interface Provider {
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
// reasoning_effort: "none" обязателен. Gemini 2.5 Flash по умолчанию «думает»,
// и thinking-токены расходуют тот же max_tokens — при 700 ответ обрывался на
// первом предложении с finish_reason: "length".
const PROVIDERS: Provider[] = [
  {
    name: "gemini",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    keyEnv: "GEMINI_API_KEY",
    model: "gemini-2.5-flash",
    extra: { reasoning_effort: "none" },
  },
  { name: "groq",  url: "https://api.groq.com/openai/v1/chat/completions", keyEnv: "GROQ_API_KEY",   model: "llama-3.3-70b-versatile" },
  { name: "groq2", url: "https://api.groq.com/openai/v1/chat/completions", keyEnv: "GROQ_API_KEY_2", model: "llama-3.3-70b-versatile" },
  { name: "groq3", url: "https://api.groq.com/openai/v1/chat/completions", keyEnv: "GROQ_API_KEY_3", model: "llama-3.3-70b-versatile" },
];

// Ограничения запроса: длинная история и простыни текста режутся до отправки.
const MAX_MESSAGES = 24;
const MAX_CHARS = 2000;
const MAX_TOKENS = 700;

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

function systemPrompt(level: string): string {
  return [
    "You are LexiQ Ustoz, a friendly English tutor for Uzbek speakers.",
    `The learner's CEFR level is ${level}. Match your English to that level.`,
    "",
    "Rules:",
    "- Explain in Uzbek (Latin script). Keep English only for the words, phrases and examples being taught.",
    "- Be short: 2-6 sentences, or a compact list. No walls of text.",
    "- Always give at least one natural example sentence in English with its Uzbek translation.",
    "- When the learner writes English with mistakes, correct it: show the fixed sentence, then one line on why.",
    "- Never invent Uzbek words you are unsure about; if unsure, say it plainly.",
    "- Stay on English learning. If asked about something else, answer in one line and steer back.",
    "- No markdown headings, no tables. Plain sentences, '-' for lists, **bold** only for the target word.",
  ].join("\n");
}

interface ClientMessage {
  role: string;
  content: string;
}

function sanitize(messages: unknown): ClientMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m): m is ClientMessage =>
      !!m && typeof m === "object" &&
      typeof (m as ClientMessage).role === "string" &&
      typeof (m as ClientMessage).content === "string")
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))
    .filter((m) => m.content.trim().length > 0)
    .slice(-MAX_MESSAGES);
}

function jsonError(status: number, error: string, hint?: string): Response {
  return new Response(JSON.stringify({ error, hint }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

// Достаёт текстовые куски из SSE-потока провайдера и отдаёт их клиенту как
// обычный текст — на фронте не нужен парсер SSE, просто читаем поток.
function toPlainTextStream(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
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

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type" },
    });
  }
  if (request.method !== "POST") return jsonError(405, "Faqat POST");

  let body: { messages?: unknown; level?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Noto'g'ri JSON");
  }

  const messages = sanitize(body.messages);
  if (messages.length === 0) return jsonError(400, "Bo'sh so'rov");

  const level = typeof body.level === "string" && LEVELS.includes(body.level) ? body.level : "A1";

  const payload = {
    model: "",
    stream: true,
    temperature: 0.6,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "system", content: systemPrompt(level) }, ...messages],
  };

  const configured = PROVIDERS.filter((p) => !!Deno.env.get(p.keyEnv));
  if (configured.length === 0) {
    return jsonError(
      503,
      "AI kaliti sozlanmagan",
      "Netlify → Site configuration → Environment variables: GEMINI_API_KEY (ixtiyoriy zaxira: GROQ_API_KEY, _2, _3)",
    );
  }

  const failures: string[] = [];

  for (const provider of configured) {
    try {
      const upstream = await fetch(provider.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${Deno.env.get(provider.keyEnv)}`,
        },
        body: JSON.stringify({ ...payload, ...provider.extra, model: provider.model }),
      });

      // 429 и 5xx — пробуем следующий ключ; остальные ошибки возвращаем как есть.
      if (upstream.status === 429 || upstream.status >= 500) {
        failures.push(`${provider.name}: ${upstream.status}`);
        continue;
      }
      if (!upstream.ok || !upstream.body) {
        const detail = (await upstream.text()).slice(0, 300);
        failures.push(`${provider.name}: ${upstream.status}`);
        return jsonError(upstream.status, "AI xatosi", detail);
      }

      return new Response(toPlainTextStream(upstream.body), {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
          "x-lexiq-provider": provider.name,
        },
      });
    } catch (e) {
      failures.push(`${provider.name}: ${(e as Error).message}`);
    }
  }

  return jsonError(502, "AI hozir javob bermayapti", failures.join("; "));
}

export const config = { path: "/api/tutor" };
