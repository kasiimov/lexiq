# LexiQ — English Learning Platform for Uzbek Speakers

An interactive web-based English learning application designed for Uzbek speakers, featuring game-based vocabulary practice, spaced repetition (Leitner algorithm) and CEFR-aligned word levels.

**Live:** https://lexiq-uz.netlify.app

## 🎯 Project Overview

LexiQ is a free educational platform that makes learning English engaging and effective. It uses proven techniques — spaced repetition and game mechanics — to help learners build vocabulary faster and retain it longer.

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

## 📁 Project Structure

```
lexiq/
├── index.html            # Main learning application (markup only)
├── admin.html            # Admin panel for vocabulary management
├── assets/
│   ├── css/
│   │   ├── app.css       # Styles for index.html
│   │   └── admin.css     # Styles for admin.html
│   └── js/
│       ├── app.js        # Application logic
│       └── admin.js      # Admin panel logic
├── data/
│   └── vocabulary.json   # Vocabulary database (558 words)
├── netlify.toml          # Netlify build/redirect/header config
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

## 📊 Vocabulary Database

`data/vocabulary.json` (169 KB) holds `meta` plus a `words` array of **558 entries**.

Entry format:

```json
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
```

Distribution by CEFR level:

| Level | Words |
|-------|-------|
| A1    | 289   |
| A2    | 37    |
| B1    | 64    |
| B2    | 82    |
| C1    | 86    |

## 🚀 Getting Started

### Run locally

The app fetches `data/vocabulary.json`, so it needs an HTTP server — opening the file over `file://` will block the request:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Admin panel: http://localhost:8000/admin.html

If the dictionary cannot be loaded, the app falls back to a manual JSON upload screen.

### Editing the vocabulary

1. Open `admin.html`
2. Add or edit words
3. Press **"💾 JSON eksport"**
4. Replace `data/vocabulary.json` with the exported file and commit

## 🌐 Deployment

Hosted on Netlify as project `lexiq-uz`, connected to this repository. Every push to `main` triggers an automatic deploy — there is no build command, the repository root is published directly.

`netlify.toml` also keeps two legacy paths alive: `/vocabulary.json` redirects to `/data/vocabulary.json`, and `/ang.html` (the old entry point) redirects to `/`.

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
