# Congix English — English Learning Platform for Uzbek Speakers

An interactive web-based English learning application designed for Uzbek speakers, featuring game-based vocabulary practice, spaced repetition (Leitner algorithm) and CEFR-aligned word levels.

**Live:** https://congix-english.netlify.app

## 🎯 Project Overview

Congix English is a free educational platform that makes learning English engaging and effective. It uses proven techniques — spaced repetition and game mechanics — to help learners build vocabulary faster and retain it longer.

**Target audience:** Uzbek speakers (A1–C1)
**Focus:** Vocabulary building with CEFR alignment

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript — no framework, no build step
- **Palette:** Dark Gray `#323232` + Vivid Yellow `#FFDB00`, exposed as CSS variables in `assets/css/*.css`
- **Data:** single JSON dictionary, loaded with `fetch()`
- **Persistence:** browser `localStorage` (progress, edited vocabulary)
- **Admin panel:** separate static page for editing the dictionary
- **Backend:** none — fully client-side
- **Hosting:** Netlify, continuous deploy from `main`

## 📁 Documents

Plans and decisions live in [docs/](docs/): [the course plan](docs/kurs.md) is
the current direction, [the roadmap](docs/roadmap.md) tracks the rest.

## 📁 Project Structure

```
congix-english/
├── index.html            # Landing page — the public site
├── app.html              # The application itself, behind the sign-in screen
├── admin.html            # Admin panel: registered users and their progress
├── admin-words.html      # Admin panel: vocabulary editing
├── 404.html
├── assets/
│   ├── css/
│   │   ├── site.css      # Landing styles
│   │   ├── app.css       # Application styles
│   │   ├── admin.css     # Admin panel styles
│   │   └── admin-users.css  # Users table styles
│   ├── js/
│   │   ├── storage-migrate.js  # Renames pre-Congix localStorage keys
│   │   ├── auth.js       # Sign-in layer: Firebase or guest mode
│   │   ├── app.js        # Application logic
│   │   ├── admin.js      # Vocabulary editor logic
│   │   └── admin-users.js   # Users panel logic
│   ├── favicon.svg
│   └── og-image.png      # Social preview
├── docs/                 # Plans and decisions
├── netlify/
│   └── edge-functions/
│       ├── lib/
│       │   └── llm.ts    # Shared provider list, LLM call, stream and JSON helpers
│       ├── tutor.ts      # Streaming AI chat (/api/tutor)
│       └── generate.ts   # Lesson and quiz generation (/api/generate)
├── manifest.webmanifest
├── netlify.toml          # Redirects, security headers, edge-function routes
├── robots.txt
├── sitemap.xml
├── README.md
└── .gitignore
```

There is no build system: every file in the repository root is published as-is.

## ✨ Key Features

### 🎮 Game Modes
1. **Flashcards** — traditional spaced-repetition cards
2. **Multiple choice** — select the correct meaning
3. **Fill-in-the-blank** — complete sentences
4. **Matching** — match words to definitions
5. **Word typing** — spell words correctly
6. **Speed round** — timed vocabulary challenge

### 📚 Learning System
- **Leitner algorithm** — spaced repetition across boxes
- **CEFR levels** — A1 through C1
- **Topic and part-of-speech tagging** — 40+ topics
- **Example sentences** — every entry carries an English example with its Uzbek translation
- **Progress tracking** — statistics stored locally in the browser

### 👤 User Features
- Learning history and statistics dashboard
- Achievements and milestones
- Custom vocabulary lists
- Offline use after first load

### 🛠️ Admin Features
- Add / edit / delete words
- Bulk import from JSON
- Word properties: level, topic, part of speech, examples, status
- Export back to `vocabulary.json` for committing to the repo

## 📊 Vocabulary

The bundled dictionary was removed on request — the repository no longer ships
`data/vocabulary.json`. The app looks for it at `./data/vocabulary.json`, falls
back to whatever is cached in `localStorage`, and otherwise opens on the
"dictionary not loaded" screen with a manual JSON upload.

Expected shape, if you put a file back:

```json
{
  "meta": { "version": "1.0", "total_words": 0 },
  "words": [
    {
      "id": "a001",
      "en": "a",
      "uz": ["bir"],
      "level": "A1",
      "topic": "grammar",
      "pos": "article",
      "example_en": "I have a book.",
      "example_uz": "Menda bir kitob bor.",
      "status": "ok"
    }
  ]
}
```

Word games, training, the daily challenge and the progress map all read this
list; the AI tutor, lessons and quizzes do not depend on it.

## 👤 Accounts

`index.html` is the landing page; the application lives at `app.html` and opens on a
sign-in screen. Two modes, picked automatically:

- **Firebase** — email/password and Google sign-in, the account works on any device.
  Enabled as soon as `assets/js/firebase-config.js` exists with real keys
  (copy `firebase-config.example.js`, follow the steps written in it). That file is
  gitignored, so project keys never land in the repository.
- **Guest** — the fallback when no config is present. The profile lives in
  `localStorage`, the app is fully usable, and registration controls stay hidden
  instead of failing on click.

Progress, statistics and the Leitner boxes are stored per browser in both modes;
moving them into the account is the next step.

## 🚀 Getting Started

### Run locally

The app fetches `data/vocabulary.json` when present, so it needs an HTTP server — opening the file over `file://` would block the request:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Admin panel: http://localhost:8000/admin.html (users) and
`/admin-words.html` (vocabulary). Both sit behind a login in production —
see the Admin access section below.

If the dictionary cannot be loaded, the app falls back to a manual JSON upload screen.

### Editing the vocabulary

1. Open `admin-words.html`
2. Add or edit words
3. Press **"💾 JSON eksport"**
4. Replace `data/vocabulary.json` with the exported file and commit

## 🤖 AI Tutor

The **AI Ustoz** screen talks to `/api/tutor`, a Netlify edge function that proxies an
OpenAI-compatible chat endpoint and streams the answer back as plain text. The system
prompt makes the model explain in Uzbek, answer at the learner's CEFR level and always
give an example sentence.

Provider keys never reach the browser — they are read from the site's environment
variables. Configure at least one:

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | primary key — holds Uzbek grammar noticeably better than Llama |
| `GROQ_API_KEY` | fallback (Groq, `openai/gpt-oss-120b`), used on 429/5xx |
| `GROQ_API_KEY_2` | optional second fallback |
| `GROQ_API_KEY_3` | optional third fallback |
| `COHERE_API_KEY` | optional — Aya, the only multilingual-trained model in the chain |
| `MISTRAL_API_KEY` | optional fallback |
| `CEREBRAS_API_KEY` | optional fallback |
| `GITHUB_MODELS_TOKEN` | optional fallback — a GitHub PAT, no extra scopes needed |
| `OPENROUTER_API_KEY` | optional fallback |

Every provider below Gemini is a stage in the same chain: a request moves down
only when the one above fails or hits its daily cap. A provider whose key is
missing is skipped, so leaving these unset changes nothing.

These are free tiers — tens to hundreds of requests a day each. They add up and
buy headroom, but they are not a substitute for a paid plan once there is real
traffic.

Providers are tried in that order, so a rate-limited key rolls over to the next one
without the learner noticing.

One Gemini key covers two chain entries, because the free tier counts its quota
**per model** (`GenerateRequestsPerDayPerProjectPerModel-FreeTier`): `gemini-2.5-flash`
allows only 20 requests a day, so `gemini-2.5-flash-lite` goes first and flash serves as
the next step. A 503 ("model is experiencing high demand") is retried once on the same
model after a short pause — it is a momentary spike, not an exhausted quota — while a 429
moves straight on to the next provider.

Set them in Netlify → Site configuration → Environment variables, or locally in a
`.env` file for `netlify dev`. Without a key the endpoint answers `503` with a hint
instead of failing silently.

## 🧠 AI Practice

The **AI mashq** screen calls `/api/generate`, which returns structured JSON rather than
a stream — the front-end needs a shape it can render, not prose.

| Mode | Request | Response |
|------|---------|----------|
| `lesson` | `{mode, level, topic}` | `{title, intro, points[{rule, example_en, example_uz}], summary}` |
| `quiz` | `{mode, level, topic, count}` | `{questions[{q, options[4], correct, explanation}]}` |

The edge function normalizes and validates the model's output before answering: questions
with a wrong option count, a bad `correct` index, duplicate options or duplicate stems are
dropped, so the client never parses raw model output. A quiz with fewer than 3 valid
questions is reported as an error instead of being shown.

After a quiz, every mistake gets a **"Batafsil tushuntirish"** button that opens the AI
tutor with the question, the learner's answer and the correct one already filled in.

## 🔐 Admin access

Both admin pages sit behind a login. The check runs on the server, in the
`admin-gate` edge function, so the password never reaches the browser — only a
signed `HttpOnly` session cookie does, good for 12 hours. Missing environment
variables close the door rather than open it.

| Variable | Purpose |
|----------|---------|
| `ADMIN_EMAIL` | administrator's email |
| `ADMIN_PASSWORD` | password |
| `ADMIN_SESSION_SECRET` | random string that signs the session cookie |
| `FIREBASE_SERVICE_ACCOUNT` | full JSON of a Firebase service-account key — lets the users panel read accounts and progress |

`/admin` lists registered users and their progress, `/admin-words.html` edits the
dictionary, `/admin/logout` ends the session. The users panel reads Firebase
through `/api/admin/users`, which checks the same cookie: without it the endpoint
would be a way around the password.

Firestore rules deliberately stop one learner from reading another's profile, so
the panel never queries the database from the browser — the edge function does it
with the service account.

## 🌐 Deployment

Hosted on Netlify as project `congix-english`, connected to this repository. Every push to `main` triggers an automatic deploy — there is no build command, the repository root is published directly.

`netlify.toml` also keeps one legacy path alive: `/ang.html`, the old entry point, redirects to the app.

## 🔧 Browser Support

- Chrome / Chromium 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 💡 Design Notes

- **Free and open** — no paid content, no ads
- **Uzbek-optimized** — translations and UI copy in Uzbek (Latin)
- **Science-based** — Leitner spaced repetition
- **Offline-first** — progress lives in `localStorage`
- **Zero dependencies** — no npm, no bundler, no backend to operate

---

**Developer:** KasImov
**Location:** Tashkent, Uzbekistan
**Project type:** Educational web app
**License:** Open for educational use
