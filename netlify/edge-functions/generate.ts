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
const WORDS_TOKENS = 2600;
const READING_TOKENS = 2600;
const WRITING_TOKENS = 1800;
const MAX_ESSAY_CHARS = 3000;
const MIN_WORDS = 6;
const MAX_WORDS = 30;

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

// Словарь теперь не лежит файлом, его собирает модель. Требования жёстче,
// чем к тесту: это данные, на которых потом строятся все игры.
// Чтение: текст под уровень плюс словарик и вопросы на понимание.
// Всё одним запросом — иначе вопросы окажутся про другой текст.
const GENRES: Record<string, string> = {
  hikoya: "a short everyday story with a small twist at the end",
  yangilik: "a short news report about a real-sounding everyday event",
  dialog: "a dialogue between two people in a real situation",
  ilmiy: "a short popular-science text explaining one simple fact",
};

// Проверка письма. Оценка — не экзаменационный балл: платформа доводит до
// уровня, а не выставляет отметку. Поэтому шкала 1-5 по понятным критериям
// и словами, а не «band».
function writingPrompt(level: string, task: string): string {
  return [
    `You are LexiQ, an English writing tutor for an Uzbek learner at CEFR level ${level}.`,
    `The learner was asked to write: ${task}`,
    "",
    "Check their text and answer with JSON only:",
    "- 'corrected': their text rewritten correctly, keeping their own ideas and length.",
    "  Do not make it fancier than their level — fix mistakes, do not rewrite the style.",
    "- 'notes': up to 6 items. Each: 'wrong' (their exact phrase), 'right' (fixed phrase),",
    "  'why' (one short line in Uzbek explaining the rule).",
    "- 'scores': integers 1-5 for 'task' (did they answer the task), 'grammar',",
    "  'vocabulary', 'coherence'.",
    "- 'comment': two sentences in Uzbek — what is already good, what to work on next.",
    "- 'level_note': one short line in Uzbek saying which CEFR level this writing looks like.",
    "- NEVER put a double quote inside a string value; use single quotes instead.",
    "",
    'Shape: {"corrected":"...","notes":[{"wrong":"...","right":"...","why":"..."}],' +
      '"scores":{"task":3,"grammar":3,"vocabulary":3,"coherence":3},"comment":"...","level_note":"..."}',
  ].join("\n");
}

function readingPrompt(level: string, genre: string, topic: string): string {
  const kind = GENRES[genre] || GENRES.hikoya;
  const length = level === "A1" || level === "A2" ? "90-130" : level === "B1" ? "130-180" : "180-240";
  return [
    `You are LexiQ, writing reading practice for Uzbek learners of English at CEFR level ${level}.`,
    `Write ${kind} about: ${topic}. Length: ${length} words.`,
    "",
    "Requirements:",
    `- The text must be readable at ${level}: sentence length and vocabulary match that level.`,
    "- 'title' is a short English title.",
    "- 'glossary': 5-8 words from the text that are hardest at this level, each with its Uzbek translation.",
    "- 'questions': 4 comprehension questions about THIS text, each with 4 English options and one correct answer.",
    "  Questions may be asked in Uzbek, options stay English. Answers must be findable in the text.",
    "  'explanation' is in Uzbek and points to the place in the text that proves the answer.",
    "- NEVER put a double quote inside a string value; use single quotes instead.",
    "",
    "Answer with JSON only, exactly this shape:",
    '{"title":"...","text":"...","glossary":[{"en":"...","uz":"..."}],' +
      '"questions":[{"q":"...","options":["...","...","...","..."],"correct":0,"explanation":"..."}]}',
  ].join("\n");
}

function wordsPrompt(level: string, topic: string, count: number, exclude: string[]): string {
  return [
    "You are LexiQ, building a vocabulary list for Uzbek speakers learning English.",
    `Give exactly ${count} useful English words at CEFR level ${level} on the topic: ${topic}.`,
    "",
    "Requirements:",
    "- 'en' is a single English word or a short common phrase, lowercase.",
    "- 'uz' is an array of 1-3 Uzbek translations (Latin script), most common first.",
    "- 'example_en' is one short natural sentence using the word.",
    "- 'example_uz' is the Uzbek translation of that exact sentence.",
    "- 'pos' is one of: noun, verb, adj, adv, prep, pron, conj, phrase.",
    "- Words must be genuinely useful at this level, no rare or archaic ones.",
    "- No duplicates, no two words with the same meaning.",
    // Без этого модель раз за разом выдаёт один и тот же список, и после
    // отсева дублей до ученика доходит одно-два новых слова.
    exclude.length
      ? "- The learner already knows these words, do not use any of them: " + exclude.join(", ")
      : "",
    "- NEVER put a double quote inside a string value; use single quotes instead.",
    "",
    "Answer with JSON only, exactly this shape:",
    '{"words":[{"en":"...","uz":["..."],"pos":"noun","example_en":"...","example_uz":"..."}]}',
  ].join("\n");
}

interface Word {
  id: string;
  en: string;
  uz: string[];
  level: string;
  topic: string;
  pos: string;
  example_en: string;
  example_uz: string;
  status: string;
}

// Приводим ответ модели к той же форме, что была у файла словаря:
// весь остальной код приложения рассчитан именно на неё.
function normalizeWords(data: Record<string, unknown>, level: string, topic: string): Word[] {
  const raw = Array.isArray(data.words) ? data.words : [];
  const seen = new Set<string>();
  const out: Word[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const en = str(rec.en, 60).toLowerCase();
    if (!en || seen.has(en)) continue;

    const uzRaw = rec.uz;
    const uz = Array.isArray(uzRaw)
      ? uzRaw.map((u) => str(u, 60)).filter((u) => u.length > 0).slice(0, 3)
      : [str(uzRaw, 60)].filter((u) => u.length > 0);
    if (uz.length === 0) continue;

    seen.add(en);
    out.push({
      // Идентификатор должен быть устойчивым: по нему хранится прогресс
      // в коробках Лейтнера, поэтому берём само слово, а не случайное число.
      id: "ai-" + en.replace(/[^a-z0-9]+/g, "-"),
      en,
      uz,
      level,
      topic,
      pos: str(rec.pos, 20) || "phrase",
      example_en: str(rec.example_en, 200),
      example_uz: str(rec.example_uz, 200),
      status: "ok",
    });
  }
  return out.slice(0, MAX_WORDS);
}

interface Question {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

function clampScore(v: unknown): number {
  const n = typeof v === "number" ? Math.round(v) : Number.NaN;
  if (!Number.isFinite(n)) return 3;
  return Math.min(5, Math.max(1, n));
}

function normalizeWriting(data: Record<string, unknown>) {
  const notesRaw = Array.isArray(data.notes) ? data.notes : [];
  const notes = notesRaw
    .filter((n) => !!n && typeof n === "object")
    .map((n) => ({
      wrong: str((n as Record<string, unknown>).wrong, 200),
      right: str((n as Record<string, unknown>).right, 200),
      why: str((n as Record<string, unknown>).why, 200),
    }))
    .filter((n) => n.wrong && n.right)
    .slice(0, 6);

  const sc = (data.scores && typeof data.scores === "object" ? data.scores : {}) as Record<string, unknown>;
  return {
    corrected: str(data.corrected, MAX_ESSAY_CHARS),
    notes,
    scores: {
      task: clampScore(sc.task),
      grammar: clampScore(sc.grammar),
      vocabulary: clampScore(sc.vocabulary),
      coherence: clampScore(sc.coherence),
    },
    comment: str(data.comment, 400),
    level_note: str(data.level_note, 160),
  };
}

function normalizeReading(data: Record<string, unknown>) {
  const glossaryRaw = Array.isArray(data.glossary) ? data.glossary : [];
  const glossary = glossaryRaw
    .filter((g) => !!g && typeof g === "object")
    .map((g) => ({
      en: str((g as Record<string, unknown>).en, 60),
      uz: str((g as Record<string, unknown>).uz, 60),
    }))
    .filter((g) => g.en && g.uz)
    .slice(0, 10);

  return {
    title: str(data.title, 120),
    text: str(data.text, 2500),
    glossary,
    questions: normalizeQuiz(data),
  };
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

  let body: { mode?: unknown; level?: unknown; topic?: unknown; count?: unknown; genre?: unknown; text?: unknown; task?: unknown; exclude?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Noto'g'ri JSON");
  }

  const KNOWN = ["lesson", "words", "reading", "writing"];
  const MAX_EXCLUDE = 60;
  const mode = typeof body.mode === "string" && KNOWN.includes(body.mode) ? body.mode : "quiz";
  const level = normalizeLevel(body.level);
  const topic = str(body.topic, MAX_TOPIC_CHARS) || "kundalik ingliz tili";
  const countRaw = typeof body.count === "number" ? Math.trunc(body.count) : (mode === "words" ? 20 : 5);
  const count = mode === "words"
    ? Math.min(MAX_WORDS, Math.max(MIN_WORDS, countRaw))
    : Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, countRaw));

  if (configuredProviders().length === 0) return jsonError(503, "AI kaliti sozlanmagan", NO_KEY_HINT);

  const genre = typeof body.genre === "string" ? body.genre : "hikoya";
  const essay = str(body.text, MAX_ESSAY_CHARS);
  // Список уже известных слов: длинный список раздувает запрос, поэтому
  // берём последние — свежие повторы мешают сильнее старых.
  const exclude = Array.isArray(body.exclude)
    ? body.exclude.map((w) => str(w, 40)).filter(Boolean).slice(-MAX_EXCLUDE)
    : [];
  const task = str(body.task, 200) || "Write about your day";
  if (mode === "writing" && essay.split(/\s+/).filter(Boolean).length < 10) {
    return jsonError(400, "Matn juda qisqa", "kamida 10 ta so'z yozing");
  }
  const prompt = mode === "lesson"
    ? lessonPrompt(level, topic)
    : mode === "words"
      ? wordsPrompt(level, topic, count, exclude)
      : mode === "reading"
        ? readingPrompt(level, genre, topic)
        : mode === "writing"
          ? writingPrompt(level, task)
          : quizPrompt(level, topic, count);
  const ask = mode === "writing"
    ? essay
    : mode === "lesson"
    ? `Mavzu: ${topic}`
    : mode === "words"
      ? `Mavzu: ${topic}. ${count} ta so'z.`
      : `Mavzu: ${topic}. ${count} ta savol.`;

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
      maxTokens: mode === "lesson" ? LESSON_TOKENS
        : mode === "words" ? WORDS_TOKENS
        : mode === "reading" ? READING_TOKENS
        : mode === "writing" ? WRITING_TOKENS
        : QUIZ_TOKENS,
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

    if (mode === "writing") {
      const check = normalizeWriting(parsed);
      if (!check.corrected) {
        lastProblem = "tuzatilgan matn bo'sh";
        continue;
      }
      return new Response(JSON.stringify({ mode, level, task, check }), {
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
      });
    }

    if (mode === "reading") {
      const reading = normalizeReading(parsed);
      // Текст без вопросов — это не упражнение, а просто абзац: гоним заново.
      if (!reading.text || reading.questions.length < 3) {
        lastProblem = `matn ${reading.text.length} belgi, savollar ${reading.questions.length}`;
        continue;
      }
      return new Response(JSON.stringify({ mode, level, topic, genre, reading }), {
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
      });
    }

    if (mode === "words") {
      const words = normalizeWords(parsed, level, topic);
      if (words.length < MIN_WORDS) {
        lastProblem = `yaroqli so'zlar: ${words.length}`;
        continue;
      }
      return new Response(JSON.stringify({ mode, level, topic, words }), {
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
      });
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
