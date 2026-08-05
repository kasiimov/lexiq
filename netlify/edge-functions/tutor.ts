// LexiQ — потоковый чат с ИИ-репетитором. Ключи провайдеров живут в lib/llm.ts
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

  let body: { messages?: unknown; level?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Noto'g'ri JSON");
  }

  const messages = sanitize(body.messages);
  if (messages.length === 0) return jsonError(400, "Bo'sh so'rov");
  if (configuredProviders().length === 0) return jsonError(503, "AI kaliti sozlanmagan", NO_KEY_HINT);

  const level = normalizeLevel(body.level);

  const result = await callLLM({
    messages: [{ role: "system", content: systemPrompt(level) }, ...messages],
    maxTokens: MAX_TOKENS,
    stream: true,
  });

  if (result.fatal) return result.fatal;
  if (!result.response?.body) return failureResponse(result.failures);

  return new Response(toPlainTextStream(result.response.body), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-lexiq-provider": result.provider ?? "",
    },
  });
}

export const config = { path: "/api/tutor" };
