// LexiQ — генерация учебного материала: мини-урок и тест по теме и уровню.
// В отличие от чата ответ приходит цельным JSON: фронту нужна структура, а не
// поток текста. Форма ответа нормализуется здесь, чтобы клиент никогда не
// разбирал сырой вывод модели.

import {
  callLLM,
  configuredProviders,
  failureResponse,
  jsonError,
  NO_KEY_HINT,
  normalizeLevel,
  parseJsonObject,
} from "./lib/llm.ts";

const MAX_TOPIC_CHARS = 80;
const QUIZ_TOKENS = 1600;
const LESSON_TOKENS = 1400;
const MIN_QUESTIONS = 3;
const GENERATION_ATTEMPTS = 2;
const MAX_QUESTIONS = 8;

function str(value: unknown, limit = 400): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function quizPrompt(level: string, topic: string, count: number): string {
  return [
    "You are LexiQ, an English test generator for Uzbek speakers.",
    `Create exactly ${count} multiple-choice questions at CEFR level ${level} about: ${topic}.`,
    "",
    "Requirements:",
    "- Every question tests ENGLISH. All 4 options are English words, phrases or sentences.",
    "  Never make the options Uzbek — a question where all options are Uzbek is useless.",
    "- Exactly 4 options, only one correct. Wrong options must be plausible, not silly.",
    "- The question stem may be Uzbek (the instruction), but the material being tested is English.",
    "- Mix the question types:",
    "  1) meaning: \"'quickly' so'zining ma'nosi qaysi?\" with English options,",
    "  2) gap fill: an English sentence with _____ and 4 English words to choose from,",
    "  3) grammar: which English sentence is correct.",
    "- 'explanation' is in Uzbek, one or two sentences, says why the correct option is right.",
    "- Do not repeat a question or reuse the same correct answer twice.",
    "- NEVER put a double quote inside a string value. To quote an English word write it",
    "  with single quotes: 'Good morning' — a raw \" breaks the JSON.",
    "",
    "Example of one good question:",
    '{"q":"Bo\'sh joyni to\'ldiring: She _____ to school every day.","options":["go","goes","going","gone"],"correct":1,"explanation":"\'She\' uchun Present Simple\'da fe\'lga -es qo\'shiladi."}',
    "",
    'Answer with JSON only, exactly this shape:',
    '{"questions":[{"q":"...","options":["...","...","...","..."],"correct":0,"explanation":"..."}]}',
    "'correct' is the 0-based index of the right option.",
  ].join("\n");
}

function lessonPrompt(level: string, topic: string): string {
  return [
    "You are LexiQ, an English teacher for Uzbek speakers.",
    `Write a compact lesson at CEFR level ${level} about: ${topic}.`,
    "",
    "Requirements:",
    "- All explanations in Uzbek (Latin script); English only for the material being taught.",
    "- 3 to 5 points. Each point: one short rule plus one natural English example and its Uzbek translation.",
    "- 'intro' is one sentence on what the learner will be able to do after the lesson.",
    "- 'summary' is one sentence with the main thing to remember.",
    "- No markdown, no headings, plain sentences.",
    "- NEVER put a double quote inside a string value; use single quotes instead.",
    "- Every value must be a quoted string. Output valid JSON and nothing else.",
    "",
    "Answer with JSON only, exactly this shape:",
    '{"title":"...","intro":"...","points":[{"rule":"...","example_en":"...","example_uz":"..."}],"summary":"..."}',
  ].join("\n");
}

interface Question {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

function normalizeQuiz(data: Record<string, unknown>): Question[] {
  const raw = Array.isArray(data.questions) ? data.questions : [];
  const seen = new Set<string>();
  const out: Question[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const q = str((item as Record<string, unknown>).q, 300);
    const optionsRaw = (item as Record<string, unknown>).options;
    const options = Array.isArray(optionsRaw)
      ? optionsRaw.map((o) => str(o, 120)).filter((o) => o.length > 0)
      : [];
    const correctRaw = (item as Record<string, unknown>).correct;
    const correct = typeof correctRaw === "number" ? Math.trunc(correctRaw) : Number.NaN;

    if (!q || options.length !== 4) continue;
    if (!Number.isInteger(correct) || correct < 0 || correct > 3) continue;
    if (new Set(options).size !== 4) continue;      // повторы вариантов делают вопрос нерешаемым
    if (seen.has(q.toLowerCase())) continue;
    seen.add(q.toLowerCase());

    out.push({
      q,
      options,
      correct,
      explanation: str((item as Record<string, unknown>).explanation, 400),
    });
  }
  return out.slice(0, MAX_QUESTIONS);
}

function normalizeLesson(data: Record<string, unknown>) {
  const rawPoints = Array.isArray(data.points) ? data.points : [];
  const points = rawPoints
    .filter((p) => !!p && typeof p === "object")
    .map((p) => ({
      rule: str((p as Record<string, unknown>).rule, 300),
      example_en: str((p as Record<string, unknown>).example_en, 200),
      example_uz: str((p as Record<string, unknown>).example_uz, 200),
    }))
    .filter((p) => p.rule.length > 0)
    .slice(0, 6);

  return {
    title: str(data.title, 120),
    intro: str(data.intro, 300),
    points,
    summary: str(data.summary, 300),
  };
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type" },
    });
  }
  if (request.method !== "POST") return jsonError(405, "Faqat POST");

  let body: { mode?: unknown; level?: unknown; topic?: unknown; count?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Noto'g'ri JSON");
  }

  const mode = body.mode === "lesson" ? "lesson" : "quiz";
  const level = normalizeLevel(body.level);
  const topic = str(body.topic, MAX_TOPIC_CHARS) || "kundalik ingliz tili";
  const countRaw = typeof body.count === "number" ? Math.trunc(body.count) : 5;
  const count = Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, countRaw));

  if (configuredProviders().length === 0) return jsonError(503, "AI kaliti sozlanmagan", NO_KEY_HINT);

  const prompt = mode === "lesson" ? lessonPrompt(level, topic) : quizPrompt(level, topic, count);
  const ask = mode === "lesson" ? `Mavzu: ${topic}` : `Mavzu: ${topic}. ${count} ta savol.`;

  // Модель может вернуть синтаксически битый JSON или материал, не прошедший
  // нормализацию. Это лечится не разбором мусора, а повторной генерацией:
  // вторая попытка почти всегда даёт годный результат.
  let lastProblem = "";

  for (let attempt = 0; attempt < GENERATION_ATTEMPTS; attempt++) {
    const result = await callLLM({
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: ask },
      ],
      maxTokens: mode === "lesson" ? LESSON_TOKENS : QUIZ_TOKENS,
      temperature: 0.3,
      stream: false,
      json: true,
    });

    if (result.fatal) return result.fatal;
    if (!result.text) return failureResponse(result.failures);

    const parsed = parseJsonObject(result.text);
    if (!parsed) {
      lastProblem = "javob JSON emas: " + result.text.slice(0, 150);
      continue;
    }

    if (mode === "lesson") {
      const lesson = normalizeLesson(parsed);
      if (lesson.points.length === 0) {
        lastProblem = "darsda birorta ham punkt yo'q";
        continue;
      }
      return new Response(JSON.stringify({ mode, level, topic, lesson }), {
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
      });
    }

    const questions = normalizeQuiz(parsed);
    if (questions.length < MIN_QUESTIONS) {
      lastProblem = `yaroqli savollar: ${questions.length}`;
      continue;
    }
    return new Response(JSON.stringify({ mode, level, topic, questions }), {
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    });
  }

  return jsonError(502, "Material tayyorlanmadi, qayta urinib ko'ring", lastProblem);
}

export const config = { path: "/api/generate" };
