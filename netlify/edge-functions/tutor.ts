// Congix English — потоковый чат с ИИ-репетитором. Ключи провайдеров живут в lib/llm.ts
// (переменные окружения Netlify) и никогда не уезжают в браузер.

import {
  callLLM,
  configuredProviders,
  failureResponse,
  jsonError,
  NO_KEY_HINT,
  normalizeLevel,
  toPlainTextStream,
  type ChatMessage,
} from "./lib/llm.ts";

// Ограничения запроса: длинная история и простыни текста режутся до отправки.
const MAX_MESSAGES = 24;
const MAX_CHARS = 2000;
const MAX_TOKENS = 700;

const SCENARIOS: Record<string, string> = {
  aeroport: "at an airport: check-in, boarding pass, gate, delayed flight",
  bozor: "at a bazaar: asking prices, bargaining, weights, paying",
  kafe: "in a cafe: ordering food and drinks, asking for the bill",
  universitet: "at a university: classes, schedule, teachers, exams",
  ish: "a job interview: experience, skills, questions to the employer",
  shifokor: "at a doctor: symptoms, pain, medicine, appointment",
  yol: "on public transport: asking the way, stops, fare, being late",
  tanishuv: "meeting someone new: name, city, work, hobbies",
};

// Разговорный режим: ИИ отвечает по-английски и ведёт диалог, но каждую ошибку
// сначала чинит и объясняет по-узбекски. Формат исправления фиксирован —
// фронт по этим строкам подсвечивает блок.
function talkPrompt(level: string, scenario: string): string {
  const setting = SCENARIOS[scenario] || SCENARIOS.tanishuv;
  return [
    "You are an English conversation partner for an Uzbek learner.",
    `The learner's CEFR level is ${level}. Keep your English at that level: simple words, short sentences.`,
    `Scenario: you are ${setting}. Stay inside this situation.`,
    "",
    "Rules:",
    "- Reply in English, 1-3 short sentences, then always ask one question back so the conversation continues.",
    "- If the learner's message has an English mistake, start your reply with exactly two lines:",
    "  \u270D\uFE0F <the corrected sentence in English>",
    "  \u2139\uFE0F <one short line in Uzbek saying what was wrong>",
    "  and only then continue the conversation in English.",
    "- If the message has no mistakes, do not add those lines at all.",
    "- Uzbek is allowed ONLY in the \u2139\uFE0F line. Everything else is English.",
    "- Never lecture, never write a list. This is a live conversation.",
  ].join("\n");
}

function systemPrompt(level: string): string {
  return [
    "You are Congix Ustoz, a friendly English tutor for Uzbek speakers.",
    `The learner's CEFR level is ${level}. Match your English to that level.`,
    "",
    "Rules:",
    "- Your entire answer is in Uzbek (Latin script). English appears only inside the words,",
    "  phrases and example sentences being taught. Never explain in English, not even one line.",
    "- Be short: 2-6 sentences, or a compact list. No walls of text.",
    "- Always give at least one natural example sentence in English with its Uzbek translation.",
    "- When the learner writes English with mistakes, correct it: show the fixed sentence, then one line on why.",
    "- Never invent Uzbek words you are unsure about; if unsure, say it plainly.",
    "- Stay on English learning. If asked about something else, answer in one line and steer back.",
    "- No markdown headings, no tables. Plain sentences, '-' for lists, **bold** only for the target word.",
  ].join("\n");
}

function sanitize(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m): m is ChatMessage =>
      !!m && typeof m === "object" &&
      typeof (m as ChatMessage).role === "string" &&
      typeof (m as ChatMessage).content === "string")
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))
    .filter((m) => m.content.trim().length > 0)
    .slice(-MAX_MESSAGES);
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type" },
    });
  }
  if (request.method !== "POST") return jsonError(405, "Faqat POST");

  let body: { messages?: unknown; level?: unknown; mode?: unknown; scenario?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Noto'g'ri JSON");
  }

  const messages = sanitize(body.messages);
  if (messages.length === 0) return jsonError(400, "Bo'sh so'rov");
  if (configuredProviders().length === 0) return jsonError(503, "AI kaliti sozlanmagan", NO_KEY_HINT);

  const level = normalizeLevel(body.level);
  const talk = body.mode === "suhbat";
  const scenario = typeof body.scenario === "string" ? body.scenario : "tanishuv";
  const prompt = talk ? talkPrompt(level, scenario) : systemPrompt(level);

  const result = await callLLM({
    messages: [{ role: "system", content: prompt }, ...messages],
    // В разговоре нужны короткие живые реплики, длинный ответ ломает ритм диалога.
    maxTokens: talk ? 320 : MAX_TOKENS,
    temperature: talk ? 0.8 : 0.6,
    stream: true,
  });

  if (result.fatal) return result.fatal;
  if (!result.response?.body) return failureResponse(result.failures);

  return new Response(toPlainTextStream(result.response.body), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-congix-provider": result.provider ?? "",
    },
  });
}

export const config = { path: "/api/tutor" };
