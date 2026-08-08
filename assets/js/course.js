// Congix English — курс: программа, блоки и разбор темы.
//
// До этого экрана уроки существовали только как файлы в data/lessons: правило,
// таблица, типичные ошибки и слова были написаны, но открыть их в приложении
// было негде. Здесь они и показываются.
//
// Порядок такой: syllabus.json задаёт программу (уровни → блоки → уроки), а сам
// разбор темы лежит в отдельном файле на урок и подгружается только когда его
// открывают. Тянуть все тридцать файлов сразу незачем.

const COURSE_PROGRESS_KEY = 'congix_course_progress';

let SYLLABUS = null;
let courseLevel = 'A1';
let currentLesson = null;

function courseProgress() {
  try { return JSON.parse(localStorage.getItem(COURSE_PROGRESS_KEY) || '{}'); }
  catch (e) { return {}; }
}

function courseProgressSave(data) {
  try { localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(data)); } catch (e) {}
}

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Загрузка программы ──────────────────────────────────────────────

async function courseInit() {
  if (SYLLABUS) { renderCourse(); return; }

  const wrap = document.getElementById('course-body');
  wrap.innerHTML = '<div class="course-empty">' + t('Yuklanmoqda...') + '</div>';

  try {
    const res = await fetch('./data/syllabus.json');
    if (!res.ok) throw new Error(res.status);
    SYLLABUS = await res.json();
  } catch (e) {
    wrap.innerHTML = '<div class="course-empty">' + t('Dastur yuklanmadi') + '</div>';
    return;
  }

  // Уровень, на котором человек остановился, помнится между заходами —
  // иначе каждый раз приходится заново искать своё место.
  const saved = courseProgress().__level;
  if (saved && SYLLABUS.levels[saved]) courseLevel = saved;
  renderCourse();
}

function setCourseLevel(level) {
  courseLevel = level;
  const p = courseProgress();
  p.__level = level;
  courseProgressSave(p);
  renderCourse();
}

// ── Список блоков и уроков ──────────────────────────────────────────

function renderCourse() {
  document.getElementById('course-lesson').style.display = 'none';
  document.getElementById('course-list').style.display = '';

  const levels = Object.keys(SYLLABUS.levels);
  const done = courseProgress();

  const tabs = levels.map((lvl) =>
    `<button class="course-tab ${lvl === courseLevel ? 'active' : ''}"
             onclick="setCourseLevel('${esc(lvl)}')">${esc(SYLLABUS.levels[lvl].title)}</button>`
  ).join('');

  const level = SYLLABUS.levels[courseLevel];
  const all = level.blocks.reduce((n, b) => n + b.lessons.length, 0);
  const passed = level.blocks.reduce(
    (n, b) => n + b.lessons.filter((l) => done[l.id]).length, 0);

  const blocks = level.blocks.map((block, bi) => {
    const items = block.lessons.map((lesson, li) => {
      const ok = !!done[lesson.id];
      return `<button class="course-lesson-row ${ok ? 'done' : ''}"
                      onclick="openLesson('${esc(lesson.id)}')">
        <span class="cl-num">${bi + 1}.${li + 1}</span>
        <span class="cl-text">
          <span class="cl-can">${esc(lesson.can_do)}</span>
          <span class="cl-gram">${esc(lesson.grammar)}</span>
        </span>
        <span class="cl-mark">${ok ? '✓' : ''}</span>
      </button>`;
    }).join('');

    return `<div class="course-block">
      <div class="cb-head">
        <div class="cb-title">${esc(block.title)}</div>
        <div class="cb-sub">${esc(block.situation || '')}</div>
      </div>
      <div class="cb-lessons">${items}</div>
    </div>`;
  }).join('');

  document.getElementById('course-body').innerHTML = `
    <div class="course-tabs">${tabs}</div>
    <div class="course-head">
      <div class="ch-title">${esc(level.title)} — ${esc(level.subtitle || '')}</div>
      <div class="ch-desc">${esc(level.description || '')}</div>
      <div class="ch-bar"><i style="width:${all ? Math.round(passed / all * 100) : 0}%"></i></div>
      <div class="ch-count">${passed} / ${all} ${t('dars')}</div>
    </div>
    ${blocks}`;
}

// ── Разбор темы ─────────────────────────────────────────────────────

async function openLesson(id) {
  const box = document.getElementById('course-lesson');
  document.getElementById('course-list').style.display = 'none';
  box.style.display = '';
  box.innerHTML = '<div class="course-empty">' + t('Yuklanmoqda...') + '</div>';

  let lesson;
  try {
    const res = await fetch('./data/lessons/' + id + '.json');
    if (!res.ok) throw new Error(res.status);
    lesson = await res.json();
  } catch (e) {
    // Урок может быть ещё не написан — в программе он есть, файла нет.
    // Честно говорим об этом, а не показываем пустой экран.
    box.innerHTML = `<button class="back-btn" onclick="renderCourse()">
        <i class="ic" data-i="arrow-left" data-s="15"></i> ${t('Orqaga')}</button>
      <div class="course-empty">${t('Bu dars hali tayyor emas')}</div>`;
    if (window.iconsHydrate) iconsHydrate(box);
    return;
  }

  currentLesson = lesson;
  const done = !!courseProgress()[id];

  const points = lesson.rule.points.map((p, i) => `
    <div class="rule-point">
      <div class="rp-num">${i + 1}</div>
      <div class="rp-body">
        <p class="rp-text">${esc(p.text)}</p>
        ${(p.examples || []).map((e) => `
          <div class="rp-ex">
            <span class="rp-en">${esc(e.en)}</span>
            <span class="rp-uz">${esc(e.uz)}</span>
          </div>`).join('')}
      </div>
    </div>`).join('');

  const table = lesson.rule.table ? `
    <div class="rule-table-wrap">
      <table class="rule-table">
        <thead><tr>${lesson.rule.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${lesson.rule.table.rows.map((r) =>
          `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>` : '';

  // Схема рисуется нами (inline SVG в файле урока), а не берётся из учебника.
  // Для времён и предлогов картинка объясняет быстрее абзаца текста.
  const visual = lesson.visual ? `
    <figure class="lesson-visual">
      ${lesson.visual.svg}
      ${lesson.visual.caption ? `<figcaption>${esc(lesson.visual.caption)}</figcaption>` : ''}
    </figure>` : '';

  // Задания лежат в самом уроке: прочитал правило — тут же решаешь, не уходя
  // на другой экран. Проверка мгновенная, с разбором, почему именно так.
  const exercises = (lesson.exercises || []).length ? `
    <div class="lesson-section">
      <h3 class="ls-title">${t('Mashqlar')}</h3>
      <p class="ls-note">${t('Javobni tanlang — nega shundayligi darhol ko\'rsatiladi')}</p>
      <div class="ex-list">
        ${lesson.exercises.map((ex, i) => `
          <div class="ex-card" id="ex-${i}">
            <p class="ex-q"><b>${i + 1}.</b> ${esc(ex.q)}</p>
            <div class="ex-opts">
              ${(ex.options || []).map((o) => `
                <button class="ex-opt" onclick="answerEx(${i}, this)"
                        data-correct="${o === ex.answer ? '1' : '0'}">${esc(o)}</button>`).join('')}
            </div>
            <p class="ex-why" style="display:none">${esc(ex.why || '')}</p>
          </div>`).join('')}
      </div>
    </div>` : '';

  const errors = (lesson.common_errors || []).map((e) => `
    <div class="err-card">
      <div class="err-line wrong"><span class="err-tag">✗</span> ${esc(e.wrong)}</div>
      <div class="err-line right"><span class="err-tag">✓</span> ${esc(e.right)}</div>
      <p class="err-why">${esc(e.why)}</p>
    </div>`).join('');

  const words = (lesson.words || []).map((w) => `
    <div class="lw-row">
      <div class="lw-main">
        <span class="lw-en">${esc(w.en)}</span>
        ${w.ipa ? `<span class="lw-ipa">${esc(w.ipa)}</span>` : ''}
      </div>
      <div class="lw-uz">${esc(w.uz)}</div>
      ${w.example ? `<div class="lw-ex">${esc(w.example)}</div>` : ''}
    </div>`).join('');

  box.innerHTML = `
    <button class="back-btn" onclick="renderCourse()">
      <i class="ic" data-i="arrow-left" data-s="15"></i> ${t('Orqaga')}</button>

    <div class="lesson-head">
      <div class="lh-level">${esc(lesson.level)} · ${esc(lesson.block)}</div>
      <h2 class="lh-title">${esc(lesson.title)}</h2>
      <p class="lh-can"><b>${t('Nimani o\'rganasiz')}:</b> ${esc(lesson.can_do)}</p>
      ${lesson.why ? `<p class="lh-why">${esc(lesson.why)}</p>` : ''}
    </div>

    <div class="lesson-section">
      <h3 class="ls-title">${esc(lesson.rule.title)}</h3>
      ${visual}
      ${points}
      ${table}
    </div>

    ${exercises}

    ${errors ? `<div class="lesson-section">
      <h3 class="ls-title">${t('Tipik xatolar')}</h3>
      <p class="ls-note">${t('Bu xatolarni o\'zbek tilida so\'zlashuvchilar ko\'p qiladi')}</p>
      ${errors}
    </div>` : ''}

    ${words ? `<div class="lesson-section">
      <h3 class="ls-title">${t('Dars so\'zlari')}</h3>
      <div class="lesson-words">${words}</div>
    </div>` : ''}

    <div class="lesson-actions">
      <button class="big-btn ${done ? 'secondary' : 'primary'}" onclick="toggleLessonDone('${esc(id)}')">
        ${done ? t('O\'rganildi ✓') : t('O\'rgandim')}
      </button>
      <button class="big-btn secondary" onclick="practiceLesson()">
        ${t('Mashq qilish')}
      </button>
    </div>`;

  if (window.iconsHydrate) iconsHydrate(box);
  window.scrollTo(0, 0);
}

function toggleLessonDone(id) {
  const p = courseProgress();
  if (p[id]) delete p[id];
  else p[id] = { at: Date.now() };
  courseProgressSave(p);
  openLesson(id);
}

// Упражнения генерирует ИИ по practice_spec из файла урока — тот самый
// экран, который в приложении уже есть.
function practiceLesson() {
  if (!currentLesson) return;
  window.__lessonSpec = currentLesson;
  show('s-ai');
}

// Проверка ответа на месте. Правильный подсвечивается лаймом, неправильный —
// глиняным, и сразу открывается объяснение: ошибка без разбора ничему не учит.
function answerEx(index, button) {
  const card = document.getElementById('ex-' + index);
  if (!card || card.dataset.answered === '1') return;
  card.dataset.answered = '1';

  card.querySelectorAll('.ex-opt').forEach((b) => {
    b.disabled = true;
    if (b.dataset.correct === '1') b.classList.add('right');
  });
  if (button.dataset.correct !== '1') button.classList.add('wrong');

  const why = card.querySelector('.ex-why');
  if (why) why.style.display = '';
}
