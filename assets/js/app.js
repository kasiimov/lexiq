// ════════════════════════════════════════════════════════════════════
// VOCAB — загружается из vocabulary.json или из загруженного файла
// ════════════════════════════════════════════════════════════════════
let VOCAB = [];

const CEFR_LEVELS = ['A1','A2','B1','B2','C1','C2'];
const CEFR_NAMES = {
  A1:'Beginner', A2:'Elementary', B1:'Intermediate',
  B2:'Upper-Int.', C1:'Advanced', C2:'Mastery'
};
const CEFR_ICONS = { A1:'🌱', A2:'🌿', B1:'🔥', B2:'⚡', C1:'💎', C2:'👑' };
const CEFR_THRESHOLDS = { A1:0, A2:500, B1:1000, B2:1750, C1:2500, C2:3000 };

const TOPIC_NAMES = {
  food:'🍎 Ovqat', family:'👨‍👩‍👧 Oila', body:'💪 Tana',
  home:'🏠 Uy', school:'🏫 Maktab', work:'💼 Ish',
  animals:'🐱 Hayvonlar', nature:'🌳 Tabiat', weather:'☀️ Ob-havo',
  time:'⏰ Vaqt', numbers:'🔢 Raqamlar', colors:'🎨 Ranglar',
  clothing:'👕 Kiyim', transport:'🚗 Transport', technology:'💻 Texnologiya',
  sports:'⚽ Sport', emotions:'😊 Hissiyot', verbs:"⚡ Fe'llar",
  adjectives:'✨ Sifatlar', position:'📍 Joylashuv', grammar:'📝 Grammatika',
  common:'💬 Umumiy', place:'📍 Joy', culture:'🎭 Madaniyat',
  objects:'📦 Buyumlar'
};

// SRS
const SRS_INTERVALS_MIN = [0, 10, 1440, 4320, 10080, 20160, 43200];

function srsLoad() {
  try { return JSON.parse(localStorage.getItem('lx_srs') || '{}'); }
  catch(e) { return {}; }
}
function srsSave(data) {
  try { localStorage.setItem('lx_srs', JSON.stringify(data)); } catch(e) {}
}
function srsGetWord(id) {
  const all = srsLoad();
  return all[id] || { box: 0, nextDue: 0, lastSeen: 0, correctTotal: 0, wrongTotal: 0 };
}
function srsUpdateWord(id, correct) {
  const all = srsLoad();
  const w = all[id] || { box: 0, nextDue: 0, lastSeen: 0, correctTotal: 0, wrongTotal: 0 };
  const now = Date.now();
  w.lastSeen = now;
  if (correct) { w.correctTotal++; w.box = Math.min(6, w.box + 1); }
  else { w.wrongTotal++; w.box = 1; }
  w.nextDue = now + SRS_INTERVALS_MIN[w.box] * 60 * 1000;
  all[id] = w;
  srsSave(all);
  return w;
}
function srsPickWords(pool, count) {
  const now = Date.now();
  const all = srsLoad();
  const scored = pool.map(w => {
    const srs = all[w.id] || { box: 0, nextDue: 0 };
    let score;
    if (srs.box === 0) score = 1000;
    else if (srs.nextDue <= now) {
      const overdueMin = (now - srs.nextDue) / 60000;
      score = 500 + Math.min(overdueMin, 500);
    } else {
      score = Math.max(0, 100 - (srs.nextDue - now) / 3600000);
    }
    return { word: w, score };
  });
  scored.sort((a,b) => b.score - a.score);
  const top = scored.slice(0, Math.min(count * 2, scored.length));
  shuffle(top);
  return top.slice(0, count).map(s => s.word);
}

// STATS
function statsLoad() {
  try { return JSON.parse(localStorage.getItem('lx_stats') || '{}'); }
  catch(e) { return {}; }
}
function statsSave(data) {
  try { localStorage.setItem('lx_stats', JSON.stringify(data)); } catch(e) {}
}
function getStats() {
  return Object.assign({
    totalCorrect: 0, totalWrong: 0, sessionsPlayed: 0,
    streakDays: 0, lastDayPlayed: null,
    dailyGoal: 10, todayLearned: 0, todayDate: null
  }, statsLoad());
}
function todayStr() { return new Date().toISOString().slice(0,10); }
function recordDayActivity() {
  if (typeof syncSoon === 'function') syncSoon();
  const stats = getStats();
  const today = todayStr();
  if (stats.todayDate !== today) { stats.todayDate = today; stats.todayLearned = 0; }
  if (stats.lastDayPlayed !== today) {
    if (stats.lastDayPlayed) {
      const last = new Date(stats.lastDayPlayed);
      const todayD = new Date(today);
      const diffDays = Math.round((todayD - last) / 86400000);
      if (diffDays === 1) stats.streakDays = (stats.streakDays || 0) + 1;
      else if (diffDays > 1) stats.streakDays = 1;
    } else stats.streakDays = 1;
    stats.lastDayPlayed = today;
  }
  statsSave(stats);
}
function getKnownWordsCount() {
  const srs = srsLoad();
  let count = 0;
  for (const id in srs) if (srs[id].box >= 3) count++;
  return count;
}
function getKnownByLevel() {
  const srs = srsLoad();
  const counts = { A1:0, A2:0, B1:0, B2:0, C1:0, C2:0 };
  const totals = { A1:0, A2:0, B1:0, B2:0, C1:0, C2:0 };
  for (const w of VOCAB) {
    if (w.status !== 'ok') continue;
    totals[w.level] = (totals[w.level] || 0) + 1;
    const s = srs[w.id];
    if (s && s.box >= 3) counts[w.level] = (counts[w.level] || 0) + 1;
  }
  return { counts, totals };
}
function getCEFRLevel() {
  const known = getKnownWordsCount();
  let level = 'A1';
  for (const lvl of CEFR_LEVELS) if (known >= CEFR_THRESHOLDS[lvl]) level = lvl;
  return level;
}
// Раньше здесь считался «примерный band IELTS» по числу выученных слов.
// Это обещание, которого платформа не выполняет: балл на экзамене зависит от
// письма, речи и аудирования, а не от размера словаря. Показываем то, что
// действительно измеряем, — путь до следующего уровня CEFR.

// STATE
let direction = 'en-uz';
let levelFilter = 'all';
let topicFilter = 'all';
let gameMode = 'classic';
let trainEnabled = true;
let trainCount = 15;
let sScore=0, sCorrect=0, sWrong=0, sTotal=0, wordNum=1;
let sessionPool = [];
let sessionQueue = [];
let currentWord = null;
let newWordsThisSession = 0;
let checked=false, loading=false;
let timerId=null, timeLeft=60;
let lives=3;
let trainPool=[]; let trainIdx=0; let trainFlipped=false;

// SCREEN MANAGEMENT
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 's-home') updateHomeStats();
  if (id === 's-topics') renderTopics();
  if (id === 's-stats') renderStats();
  if (id === 's-tutor') tutorInit();
  if (id === 's-ai') aiInit();
  if (id === 's-map') renderMap();
  if (id === 's-profile') renderProfile();
  if (id === 's-read') readInit();
  if (id === 's-write') writeInit();
  window.scrollTo(0,0);
}

// ────────────────────────────────────────────────────────────────────
// VOCAB LOADING
// ────────────────────────────────────────────────────────────────────
const VOCAB_STORAGE_KEY = 'lexiq_vocab';

function saveVocab() {
  try { localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(VOCAB)); } catch(e) {}
}

async function loadVocab() {
  // Try localStorage first
  try {
    const cached = localStorage.getItem(VOCAB_STORAGE_KEY);
    if (cached) {
      const arr = JSON.parse(cached);
      if (Array.isArray(arr) && arr.length > 0) {
        VOCAB = arr;
        console.log('Loaded ' + VOCAB.length + ' words from cache');
        return true;
      }
    }
  } catch(e) { console.warn('Cache load fail', e); }

  // Файл словаря может лежать рядом — если его положили вручную.
  try {
    const res = await fetch('./data/vocabulary.json');
    if (res.ok) {
      const data = await res.json();
      VOCAB = data.words || data;
      saveVocab();
      console.log('Loaded ' + VOCAB.length + ' words from vocabulary.json');
      return true;
    }
  } catch(e) { console.info('vocabulary.json yo\'q — so\'zlarni AI tayyorlaydi'); }

  // Файла нет — словарь собирает ИИ. Это основной путь: готового списка
  // в проекте больше не хранится.
  return await vocabGenerateStarter();
}

// ────────────────────────────────────────────────────────────────────
// SO'ZLARNI AI TAYYORLAYDI — генерация словаря вместо файла.
// Слова копятся в localStorage: один раз сгенерировали — дальше играем
// офлайн, а докупать новые можно кнопкой.
// ────────────────────────────────────────────────────────────────────
const STARTER_TOPICS = ['kundalik hayot', 'oila va uy', 'ovqat', 'sayohat'];
const WORDS_PER_BATCH = 20;

async function vocabFetchWords(level, topic, count) {
  const res = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode: 'words', level, topic, count: count || WORDS_PER_BATCH }),
  });
  if (!res.ok) {
    const info = await res.json().catch(() => ({}));
    throw new Error(info.error || ('Xatolik ' + res.status));
  }
  const data = await res.json();
  return data.words || [];
}

// Стартовый набор: две темы уровня A1, чтобы играть было чем сразу.
async function vocabGenerateStarter() {
  const note = document.getElementById('ls-sub');
  if (note) note.textContent = "AI so'zlarni tayyorlamoqda...";

  try {
    const batches = await Promise.all([
      vocabFetchWords('A1', STARTER_TOPICS[0], WORDS_PER_BATCH),
      vocabFetchWords('A1', STARTER_TOPICS[1], WORDS_PER_BATCH),
    ]);
    const merged = [].concat.apply([], batches);
    if (merged.length === 0) return false;
    VOCAB = merged;
    saveVocab();
    return true;
  } catch (e) {
    console.warn('so\'zlar tayyorlanmadi', e);
    const msg = document.getElementById('error-msg');
    if (msg) msg.textContent = "So'zlarni tayyorlab bo'lmadi: " + e.message;
    return false;
  }
}

// Докинуть слов по текущему уровню и выбранной теме.
async function vocabAddMore() {
  const btn = document.getElementById('more-words-btn');
  if (btn) { btn.disabled = true; btn.textContent = "⏳ Tayyorlanmoqda..."; }

  const level = getCEFRLevel();
  const topic = topicFilter !== 'all'
    ? (TOPIC_NAMES[topicFilter] || topicFilter)
    : STARTER_TOPICS[Math.floor(Math.random() * STARTER_TOPICS.length)];

  try {
    const words = await vocabFetchWords(level, topic, WORDS_PER_BATCH);
    const have = new Set(VOCAB.map(w => w.id));
    const fresh = words.filter(w => !have.has(w.id));
    VOCAB = VOCAB.concat(fresh);
    saveVocab();
    renderTopics();
    if (btn) btn.textContent = '✓ ' + fresh.length + " ta yangi so'z qo'shildi";
  } catch (e) {
    if (btn) btn.textContent = '⚠️ ' + e.message;
  } finally {
    setTimeout(() => {
      if (btn) { btn.disabled = false; btn.textContent = "🤖 Yangi so'zlar qo'shish"; }
    }, 2500);
  }
}

function loadVocabFromFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      const words = data.words || data;
      if (!Array.isArray(words) || words.length === 0) {
        alert("JSON faylda so'zlar topilmadi");
        return;
      }
      VOCAB = words;
      saveVocab();
      alert("✓ " + words.length + " ta so'z yuklandi!");
      show('s-home');
    } catch(err) {
      alert("JSON o'qish xatosi: " + err.message);
    }
    event.target.value = '';
  };
  reader.readAsText(file);
}

// HOME
function updateHomeStats() {
  const stats = getStats();
  const today = todayStr();
  if (stats.todayDate !== today) {
    stats.todayDate = today; stats.todayLearned = 0;
    statsSave(stats);
  }
  const known = getKnownWordsCount();
  const level = getCEFRLevel();
  document.getElementById('user-level').textContent = level;
  document.getElementById('user-level-name').textContent = CEFR_NAMES[level];
  document.getElementById('user-level-icon').textContent = CEFR_ICONS[level];

  const curIdx = CEFR_LEVELS.indexOf(level);
  const nextLevel = CEFR_LEVELS[Math.min(curIdx+1, 5)];
  const curThr = CEFR_THRESHOLDS[level];
  const nextThr = CEFR_THRESHOLDS[nextLevel];
  const pct = nextLevel === level ? 100 : ((known - curThr) / (nextThr - curThr)) * 100;
  document.getElementById('lc-bar').style.width = Math.min(100, Math.max(0, pct)) + '%';
  document.getElementById('lc-bar-current').textContent = known + " so'z";
  document.getElementById('lc-bar-next').textContent =
    nextLevel === level ? 'Maksimum darajada!' : nextLevel + ' gacha: ' + (nextThr - known) + " so'z";

  document.getElementById('ms-streak').textContent = stats.streakDays || 0;
  renderStreak();
  renderDailyCard();
  document.getElementById('ms-known').textContent = known;
  document.getElementById('ms-today').textContent = stats.todayLearned || 0;

  const goal = stats.dailyGoal || 10;
  const todayN = stats.todayLearned || 0;
  document.getElementById('dg-count').textContent = todayN + ' / ' + goal;
  document.getElementById('dg-bar').style.width = Math.min(100, (todayN / goal) * 100) + '%';
  const dgCount = document.getElementById('dg-count');
  const dgBar = document.getElementById('dg-bar');
  if (todayN >= goal) { dgCount.classList.add('dg-done'); dgBar.classList.add('dg-done-bar'); }
  else { dgCount.classList.remove('dg-done'); dgBar.classList.remove('dg-done-bar'); }
}

// TOPICS
function setLevelFilter(lvl) {
  levelFilter = lvl;
  document.querySelectorAll('.lvl-pill').forEach(p => p.classList.toggle('active', p.dataset.lvl === lvl));
  renderTopics();
}

function getFilteredVocab() {
  return VOCAB.filter(w => {
    if (w.status !== 'ok') return false;
    if (levelFilter !== 'all' && w.level !== levelFilter) return false;
    if (topicFilter !== 'all' && w.topic !== topicFilter) return false;
    return true;
  });
}

function renderTopics() {
  const grid = document.getElementById('topics-grid');
  grid.innerHTML = '';
  const okWords = VOCAB.filter(w => w.status === 'ok' && (levelFilter === 'all' || w.level === levelFilter));
  const topicCount = {};
  for (const w of okWords) topicCount[w.topic] = (topicCount[w.topic] || 0) + 1;

  const allBtn = document.createElement('button');
  allBtn.className = 'topic-card' + (topicFilter === 'all' ? ' selected' : '');
  allBtn.innerHTML =
    '<span class="tc-ico">🌐</span>' +
    '<span class="tc-name">Barcha mavzular</span>' +
    '<span class="tc-count">' + okWords.length + " so'z</span>";
  allBtn.onclick = () => setTopic('all');
  grid.appendChild(allBtn);

  const sorted = Object.entries(topicCount).sort((a,b) => b[1] - a[1]);
  const srs = srsLoad();
  for (const [topic, count] of sorted) {
    const known = okWords.filter(w => w.topic === topic && srs[w.id] && srs[w.id].box >= 3).length;
    const btn = document.createElement('button');
    btn.className = 'topic-card' + (topicFilter === topic ? ' selected' : '');
    const tname = TOPIC_NAMES[topic] || topic;
    const parts = tname.split(' ');
    const icon = parts[0];
    const rest = parts.slice(1).join(' ') || topic;
    btn.innerHTML =
      '<span class="tc-ico">' + icon + '</span>' +
      '<span class="tc-name">' + rest + '</span>' +
      '<span class="tc-count">' + count + " so'z</span>" +
      (known > 0 ? '<span class="tc-prog">✓ ' + known + '</span>' : '');
    btn.onclick = () => setTopic(topic);
    grid.appendChild(btn);
  }
}

function setTopic(t) { topicFilter = t; renderTopics(); }

// MODE SELECT
function setDir(d) {
  direction = d;
  document.getElementById('dir-eu').classList.toggle('selected', d === 'en-uz');
  document.getElementById('dir-ue').classList.toggle('selected', d === 'uz-en');
}
function setGameMode(gm) {
  gameMode = gm;
  document.querySelectorAll('.gm-card[data-gm]').forEach(c => c.classList.remove('selected'));
  document.querySelector('[data-gm="' + gm + '"]').classList.add('selected');
}
function toggleTrain() {
  trainEnabled = !trainEnabled;
  document.getElementById('train-sw').classList.toggle('on', trainEnabled);
  document.getElementById('train-count-row').classList.toggle('show', trainEnabled);
}
function setTrainCount(n) {
  trainCount = n;
  document.querySelectorAll('.tc-btn').forEach(b => b.classList.remove('sel'));
  document.querySelector('[data-tc="' + n + '"]').classList.add('sel');
}

function beginFlow() {
  const filtered = getFilteredVocab();
  if (filtered.length === 0) {
    alert("Bu filtr uchun so'zlar topilmadi");
    return;
  }
  if (trainEnabled) startTraining(filtered);
  else {
    sessionPool = srsPickWords(filtered, Math.min(filtered.length, 30));
    startGame();
  }
}

// TRAINING
function startTraining(filtered) {
  show('s-train');
  trainPool = srsPickWords(filtered, Math.min(trainCount, filtered.length));
  trainIdx = 0;
  trainFlipped = false;
  renderTrainCard();
}

function renderTrainCard() {
  pronSetup();
  const w = trainPool[trainIdx];
  if (!w) return;
  trainFlipped = false;
  const isEU = direction === 'en-uz';
  document.getElementById('fc-badge').textContent = isEU ? 'INGLIZCHA' : "O'ZBEKCHA";
  document.getElementById('fc-word').textContent = isEU ? w.en : (w.uz[0] || w.en);
  document.getElementById('fc-phon').textContent = (isEU && w.phon) ? w.phon : '';
  document.getElementById('fc-divider').style.display = 'none';
  document.getElementById('fc-translation').style.display = 'none';
  document.getElementById('fc-example').style.display = 'none';
  document.getElementById('fc-flip').textContent = "👁 Tarjimani ko'rsatish";
  document.getElementById('train-counter').textContent = (trainIdx+1) + ' / ' + trainPool.length;
  document.getElementById('train-bar').style.width = (((trainIdx+1)/trainPool.length)*100) + '%';
  document.getElementById('fc-prev').disabled = trainIdx === 0;
  document.getElementById('fc-next').disabled = trainIdx === trainPool.length-1;
}

function flipCard() {
  const w = trainPool[trainIdx];
  if (!w) return;
  trainFlipped = !trainFlipped;
  const isEU = direction === 'en-uz';
  if (trainFlipped) {
    document.getElementById('fc-divider').style.display = 'block';
    document.getElementById('fc-translation').style.display = 'block';
    document.getElementById('fc-translation').textContent = isEU ? w.uz.join(', ') : w.en;
    if (w.example_en) {
      document.getElementById('fc-example').style.display = 'block';
      document.getElementById('fc-example').innerHTML =
        '<b>«' + w.example_en + '»</b>' + (w.example_uz ? '<br>— ' + w.example_uz : '');
    }
    document.getElementById('fc-flip').textContent = "🙈 Yashirish";
  } else {
    document.getElementById('fc-divider').style.display = 'none';
    document.getElementById('fc-translation').style.display = 'none';
    document.getElementById('fc-example').style.display = 'none';
    document.getElementById('fc-flip').textContent = "👁 Tarjimani ko'rsatish";
  }
}

function trainPrev() { if (trainIdx > 0) { trainIdx--; renderTrainCard(); } }
function trainNext() { if (trainIdx < trainPool.length-1) { trainIdx++; renderTrainCard(); } }

function speakCurrentTrain() {
  const w = trainPool[trainIdx];
  if (!w || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(w.en);
  u.lang = 'en-US'; u.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
function speakCurrentGame() {
  if (!currentWord || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(currentWord.en);
  u.lang = 'en-US'; u.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function exitTraining() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  show('s-modes');
}

function startGameAfterTrain() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  sessionPool = trainPool.slice();
  shuffle(sessionPool);
  startGame();
}

// GAME
function startGame() {
  if (sessionPool.length === 0) {
    const filtered = getFilteredVocab();
    sessionPool = srsPickWords(filtered, Math.min(30, filtered.length));
  }
  if (sessionPool.length === 0) {
    alert("So'zlar topilmadi");
    show('s-modes'); return;
  }
  sessionQueue = sessionPool.slice();
  shuffle(sessionQueue);

  sScore=0; sCorrect=0; sWrong=0; sTotal=0; wordNum=1;
  lives=3; timeLeft=60;
  newWordsThisSession = 0;
  if (timerId) { clearInterval(timerId); timerId=null; }

  ['g-score','g-correct','g-wrong','g-total'].forEach(id => document.getElementById(id).textContent='0');
  const isEU = direction === 'en-uz';
  const pill = document.getElementById('g-mode-pill');
  pill.textContent = isEU ? 'EN→UZ' : 'UZ→EN';
  pill.className = 'g-mode-pill ' + (isEU ? 'eng' : 'uzb');
  document.getElementById('g-timer-pill').style.display = (gameMode==='time') ? 'flex' : 'none';
  document.getElementById('g-lives-pill').style.display = (gameMode==='survival') ? 'flex' : 'none';
  if (gameMode==='time') document.getElementById('g-timer').textContent = '60';
  if (gameMode==='survival') document.getElementById('g-lives-pill').textContent = '❤️❤️❤️';

  configureGameUI();
  show('s-game');
  if (gameMode==='time') startTimer();
  loadWord();
}

function configureGameUI() {
  const inputWrap = document.getElementById('input-wrap');
  const mcGrid = document.getElementById('mc-grid');
  const sbArea = document.getElementById('sb-area');
  inputWrap.style.display = 'none';
  mcGrid.style.display = 'none';
  sbArea.style.display = 'none';
  if (gameMode === 'multi') mcGrid.style.display = 'grid';
  else if (gameMode === 'build') sbArea.style.display = 'flex';
  else inputWrap.style.display = 'block';
}

function exitGame() {
  if (timerId) { clearInterval(timerId); timerId=null; }
  show('s-modes');
}

function startTimer() {
  timeLeft = 60;
  document.getElementById('g-timer').textContent = timeLeft;
  document.getElementById('g-timer-pill').classList.remove('warn');
  timerId = setInterval(() => {
    timeLeft--;
    document.getElementById('g-timer').textContent = timeLeft;
    if (timeLeft <= 10) document.getElementById('g-timer-pill').classList.add('warn');
    if (timeLeft <= 0) { clearInterval(timerId); timerId=null; endGame('time'); }
  }, 1000);
}

function loadWord() {
  loading = true; checked = false;
  if (sessionQueue.length === 0) { sessionQueue = sessionPool.slice(); shuffle(sessionQueue); }
  currentWord = sessionQueue.shift();
  const srsBefore = srsGetWord(currentWord.id);
  if (srsBefore.box === 0) newWordsThisSession++;
  const isEU = direction === 'en-uz';
  const card = document.getElementById('word-card');
  card.className = 'word-card ' + (isEU ? 'eng-card' : 'uzb-card');
  document.getElementById('wc-badge').textContent = isEU ? "INGLIZCHA SO'Z" : "O'ZBEKCHA SO'Z";
  document.getElementById('word-counter').textContent = "So'z #" + wordNum;
  setInd('idle','💭',"Tayyor bo'ling",'Javobingizni tanlang yoki yozing');
  document.getElementById('wc-speak-mini').style.display = isEU ? 'inline-block' : 'none';

  if (gameMode === 'multi') renderMultiChoice();
  else if (gameMode === 'build') renderSentenceBuilder();
  else if (gameMode === 'fill') renderFillGap();
  else {
    document.getElementById('wc-word').textContent = isEU ? currentWord.en : currentWord.uz[0];
    document.getElementById('wc-word').style.fontSize = '34px';
    document.getElementById('wc-hint').textContent = '';
    const iw = document.getElementById('input-wrap');
    iw.className = 'input-wrap ' + (isEU ? 'uzb-in' : 'eng-in');
    const ff = document.getElementById('in-field');
    ff.value = ''; ff.disabled = false;
    ff.placeholder = isEU ? "O'zbekcha tarjima..." : "English translation...";
    document.getElementById('in-flag').textContent = isEU ? '🇺🇿' : '🇬🇧';
    setTimeout(() => ff.focus(), 50);
  }
  setButtons('check');
  loading = false;
}

function renderMultiChoice() {
  const isEU = direction === 'en-uz';
  document.getElementById('wc-word').textContent = isEU ? currentWord.en : currentWord.uz[0];
  document.getElementById('wc-word').style.fontSize = '34px';
  document.getElementById('wc-hint').textContent = '';
  const correctAnswer = isEU ? currentWord.uz[0] : currentWord.en;
  const wrongPool = VOCAB.filter(w => w.status === 'ok' && w.id !== currentWord.id && w.level === currentWord.level);
  const fallback = VOCAB.filter(w => w.status === 'ok' && w.id !== currentWord.id);
  const pool = wrongPool.length >= 3 ? wrongPool : fallback;
  shuffle(pool);
  const wrongs = pool.slice(0, 3).map(w => isEU ? w.uz[0] : w.en);
  const options = [correctAnswer, ...wrongs];
  shuffle(options);
  const grid = document.getElementById('mc-grid');
  grid.innerHTML = '';
  options.forEach(opt => {
    const b = document.createElement('button');
    b.className = 'mc-opt';
    b.textContent = opt;
    b.onclick = () => mcChoose(b, opt, correctAnswer);
    grid.appendChild(b);
  });
  document.getElementById('btn-row').style.display = 'none';
}

function mcChoose(btn, picked, correct) {
  if (checked) return;
  checked = true; sTotal++;
  document.getElementById('g-total').textContent = sTotal;
  const allBtns = document.querySelectorAll('.mc-opt');
  allBtns.forEach(b => b.disabled = true);
  const ok = picked.toLowerCase().trim() === correct.toLowerCase().trim();
  allBtns.forEach(b => {
    if (b.textContent.toLowerCase().trim() === correct.toLowerCase().trim()) b.classList.add('correct');
    else if (b === btn && !ok) b.classList.add('wrong');
  });
  applyResult(ok, ok ? "To'g'ri!" : 'Xato', ok ? '«' + correct + "» — a'lo!" : "To'g'ri javob: «" + correct + '»');
  document.getElementById('btn-row').style.display = 'grid';
  setButtons('next');
}

function renderFillGap() {
  const wordEn = currentWord.en;
  let sentence = currentWord.example_en || 'The ___ is here.';
  const regex = new RegExp('\\b' + wordEn.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\b', 'gi');
  if (regex.test(sentence)) sentence = sentence.replace(regex, '___');
  else sentence = '___ — (' + currentWord.uz[0] + ')';
  document.getElementById('wc-badge').textContent = "GAPNI TO'LDIRING";
  document.getElementById('wc-word').textContent = sentence;
  document.getElementById('wc-word').style.fontSize = '20px';
  document.getElementById('wc-hint').textContent = '💡 ' + currentWord.uz.join(', ');
  const iw = document.getElementById('input-wrap');
  iw.className = 'input-wrap eng-in';
  const ff = document.getElementById('in-field');
  ff.value = ''; ff.disabled = false;
  ff.placeholder = "Bo'sh joyga so'z (inglizcha)...";
  document.getElementById('in-flag').textContent = '🇬🇧';
  setTimeout(() => ff.focus(), 50);
}

function renderSentenceBuilder() {
  let sentence = currentWord.example_en || (currentWord.en + ' is good');
  sentence = sentence.replace(/[.,!?;:]/g, '').trim();
  const words = sentence.split(/\s+/);
  document.getElementById('wc-badge').textContent = "GAPNI QURING";
  document.getElementById('wc-word').textContent = currentWord.example_uz || currentWord.uz[0];
  document.getElementById('wc-word').style.fontSize = '18px';
  document.getElementById('wc-hint').textContent = "⬇ So'zlardan inglizcha gap quring";
  const target = document.getElementById('sb-target');
  target.dataset.target = sentence;
  target.innerHTML = ''; target.classList.add('empty');
  const pool = document.getElementById('sb-pool');
  pool.innerHTML = '';
  const shuf = words.slice(); shuffle(shuf);
  shuf.forEach((w, idx) => {
    const b = document.createElement('button');
    b.className = 'sb-chip';
    b.textContent = w;
    b.dataset.poolIdx = idx;
    b.onclick = () => sbToggle(b);
    pool.appendChild(b);
  });
}

function sbToggle(btn) {
  if (checked) return;
  const target = document.getElementById('sb-target');
  if (btn.classList.contains('used')) return;
  const clone = btn.cloneNode(true);
  clone.classList.remove('used');
  clone.classList.add('target');
  clone.onclick = () => sbRemove(clone, btn);
  target.appendChild(clone);
  target.classList.remove('empty');
  btn.classList.add('used');
}

function sbRemove(targetBtn, poolBtn) {
  if (checked) return;
  targetBtn.remove();
  poolBtn.classList.remove('used');
  const target = document.getElementById('sb-target');
  if (target.children.length === 0) target.classList.add('empty');
}

function checkAnswer() {
  if (checked || loading) return;
  if (gameMode === 'build') {
    const target = document.getElementById('sb-target');
    const built = Array.from(target.children).map(c => c.textContent).join(' ').trim();
    if (!built) { setInd('loading','⚠️',"Bo'sh!","So'zlarni tanlang"); return; }
    checked = true; sTotal++;
    document.getElementById('g-total').textContent = sTotal;
    const expected = target.dataset.target.toLowerCase().trim();
    const ok = built.toLowerCase().trim() === expected;
    applyResult(ok, ok ? 'Ajoyib!' : 'Xato',
      ok ? '«' + target.dataset.target + "» — to'g'ri!" : "To'g'ri: «" + target.dataset.target + '»');
    setButtons('next');
    return;
  }
  const val = document.getElementById('in-field').value.trim().toLowerCase();
  if (!val) { setInd('loading','⚠️',"Javob kiriting!","Avval tarjima yozing"); return; }
  checked = true; sTotal++;
  document.getElementById('g-total').textContent = sTotal;
  document.getElementById('check-btn').disabled = true;
  document.getElementById('in-field').disabled = true;
  let ok = false; let correctText = '';
  const isEU = direction === 'en-uz';
  if (gameMode === 'fill') {
    ok = (val === currentWord.en.toLowerCase() || lev(currentWord.en.toLowerCase(), val) <= 1);
    correctText = currentWord.en;
  } else {
    if (isEU) {
      ok = currentWord.uz.some(t => t.toLowerCase() === val || lev(t.toLowerCase(), val) <= 1);
      correctText = currentWord.uz[0];
    } else {
      ok = (val === currentWord.en.toLowerCase() || lev(currentWord.en.toLowerCase(), val) <= 1);
      correctText = currentWord.en;
    }
  }
  applyResult(ok, ok ? "To'g'ri!" : 'Xato', ok ? '«' + correctText + "» — a'lo!" : "To'g'ri: «" + correctText + '»');
  setButtons('next');
}

function applyResult(ok, msg, hint) {
  const beforeBox = srsGetWord(currentWord.id).box;
  const afterSrs = srsUpdateWord(currentWord.id, ok);
  recordDayActivity();
  const stats = getStats();
  if (ok) stats.totalCorrect = (stats.totalCorrect||0) + 1;
  else stats.totalWrong = (stats.totalWrong||0) + 1;
  if (ok && beforeBox < 3 && afterSrs.box >= 3) stats.todayLearned = (stats.todayLearned||0) + 1;
  statsSave(stats);
  if (ok) {
    sScore++; sCorrect++;
    document.getElementById('g-score').textContent = sScore;
    document.getElementById('g-correct').textContent = sCorrect;
    setInd('ok','🎉', msg, hint);
    haptic(40);
  } else {
    sWrong++;
    document.getElementById('g-wrong').textContent = sWrong;
    setInd('fail','❌', msg, hint);
    haptic([60,40,60]);
    if (gameMode === 'survival') {
      lives--;
      const hearts = '❤️'.repeat(Math.max(0,lives)) + '🖤'.repeat(3 - Math.max(0,lives));
      document.getElementById('g-lives-pill').textContent = hearts;
      if (lives <= 0) { setTimeout(() => endGame('survival'), 900); return; }
    }
    sessionQueue.push(currentWord);
  }
}

function haptic(p) { if (navigator.vibrate) navigator.vibrate(p); }

function nextWord() { wordNum++; loadWord(); }

function endGame(reason) {
  if (timerId) { clearInterval(timerId); timerId=null; }
  const emoji = reason==='time' ? '⏱️' : (reason==='survival' ? '💔' : '🎉');
  const title = reason==='time' ? 'Vaqt tugadi!' : (reason==='survival' ? 'Jonlar tugadi!' : 'Tugadi!');
  let sub = '';
  if (sTotal === 0) sub = "Hech narsa qilmadingiz";
  else {
    const pct = Math.round((sCorrect/sTotal)*100);
    if (pct >= 90) sub = "Ajoyib natija! 🌟";
    else if (pct >= 70) sub = "Yaxshi! Davom eting";
    else if (pct >= 50) sub = "Yomon emas";
    else sub = "Mashq qiling, yaxshi bo'ladi!";
  }
  document.getElementById('rc-emoji').textContent = emoji;
  document.getElementById('rc-title').textContent = title;
  document.getElementById('rc-sub').textContent = sub;
  document.getElementById('rc-correct').textContent = sCorrect;
  document.getElementById('rc-wrong').textContent = sWrong;
  document.getElementById('rc-score').textContent = sScore;
  if (newWordsThisSession > 0) {
    document.getElementById('rc-new').style.display = 'block';
    document.getElementById('rc-new').textContent = '+ ' + newWordsThisSession + " ta yangi so'z ko'rdingiz!";
  } else {
    document.getElementById('rc-new').style.display = 'none';
  }
  show('s-result');
}

function handleKey(e) {
  if (e.key === 'Enter') { e.preventDefault(); if (!checked) checkAnswer(); else nextWord(); }
}
function clearIn() {
  document.getElementById('in-field').value = '';
  document.getElementById('in-field').focus();
}

function setInd(type, ico, title, msg) {
  const el = document.getElementById('indicator');
  el.className = 'indicator ' + type;
  el.innerHTML = '<span class="ind-ico">' + ico + '</span>' +
    '<div class="ind-body"><div class="ind-title">' + title + '</div>' +
    '<div class="ind-msg">' + (msg||'') + '</div></div>';
}

function setButtons(which) {
  const row = document.getElementById('btn-row');
  if (gameMode === 'multi') {
    if (which === 'check') { row.style.display = 'none'; return; }
    row.style.display = 'grid';
  }
  if (which === 'check') {
    row.className = 'btn-row single';
    row.innerHTML = '<button class="check-btn" id="check-btn" onclick="checkAnswer()">✓ Tekshirish</button>';
  } else {
    row.className = 'btn-row';
    row.innerHTML =
      '<button class="check-btn" disabled style="opacity:.3;cursor:default">✓ Tekshirildi</button>' +
      '<button class="next-btn" onclick="nextWord()">Keyingi →</button>';
  }
}

function lev(a,b) {
  const m=a.length, n=b.length;
  const dp = Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?j:j===0?i:0));
  for (let i=1; i<=m; i++) for (let j=1; j<=n; j++)
    dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1+Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function shuffle(a) {
  for (let i=a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function renderStats() {
  const known = getKnownWordsCount();
  const level = getCEFRLevel();
  document.getElementById('stats-level').textContent = level;
  document.getElementById('stats-level-name').textContent = CEFR_NAMES[level];
  document.getElementById('stats-level-icon').textContent = CEFR_ICONS[level];
  const curIdx = CEFR_LEVELS.indexOf(level);
  const nextLevel = CEFR_LEVELS[Math.min(curIdx+1, 5)];
  const curThr = CEFR_THRESHOLDS[level];
  const nextThr = CEFR_THRESHOLDS[nextLevel];
  const pct = nextLevel === level ? 100 : ((known - curThr) / (nextThr - curThr)) * 100;
  document.getElementById('stats-bar').style.width = Math.min(100, Math.max(0, pct)) + '%';
  document.getElementById('stats-bar-current').textContent = known + " so'z";
  document.getElementById('stats-bar-next').textContent =
    nextLevel === level ? 'Maksimum darajada!' : nextLevel + ' gacha: ' + (nextThr - known) + " so'z";

  const { counts, totals } = getKnownByLevel();
  const barsEl = document.getElementById('cefr-bars');
  barsEl.innerHTML = '';
  for (const lvl of CEFR_LEVELS) {
    const c = counts[lvl] || 0;
    const t = totals[lvl] || 0;
    const p = t > 0 ? (c/t)*100 : 0;
    const row = document.createElement('div');
    row.className = 'cefr-row';
    row.innerHTML =
      '<div class="cefr-label">' + lvl + '</div>' +
      '<div class="cefr-bar-bg"><div class="cefr-bar-fg ' + lvl + '" style="width:' + p + '%"></div></div>' +
      '<div class="cefr-count">' + c + ' / ' + (t || '—') + '</div>';
    barsEl.appendChild(row);
  }

  const srs = srsLoad();
  const topicData = {};
  for (const w of VOCAB) {
    if (w.status !== 'ok') continue;
    if (!topicData[w.topic]) topicData[w.topic] = { total:0, known:0 };
    topicData[w.topic].total++;
    if (srs[w.id] && srs[w.id].box >= 3) topicData[w.topic].known++;
  }
  const sorted = Object.entries(topicData).sort((a,b) => b[1].known - a[1].known);
  const listEl = document.getElementById('topic-stats-list');
  listEl.innerHTML = '';
  for (const [topic, data] of sorted) {
    const row = document.createElement('div');
    row.className = 'tsi-row';
    const pct2 = data.total > 0 ? Math.round((data.known/data.total)*100) : 0;
    row.innerHTML =
      '<div class="tsi-name">' + (TOPIC_NAMES[topic] || topic) + '</div>' +
      '<div class="tsi-prog">' + data.known + ' / ' + data.total + ' (' + pct2 + '%)</div>';
    listEl.appendChild(row);
  }

  const goalKnown = getKnownWordsCount();
  const goalCur = getCEFRLevel();
  const goalNext = CEFR_LEVELS[Math.min(CEFR_LEVELS.indexOf(goalCur) + 1, CEFR_LEVELS.length - 1)];
  const goalFrom = CEFR_THRESHOLDS[goalCur];
  const goalTo = CEFR_THRESHOLDS[goalNext];
  const goalPct = goalNext === goalCur ? 100
    : Math.max(0, Math.min(100, Math.round(((goalKnown - goalFrom) / (goalTo - goalFrom)) * 100)));

  document.getElementById('next-level').textContent = goalNext === goalCur ? goalCur : goalNext;
  document.getElementById('next-need').textContent = goalNext === goalCur
    ? 'Eng yuqori darajadasiz'
    : goalNext + ' gacha: ' + Math.max(0, goalTo - goalKnown) + " so'z";
  document.getElementById('next-bar').style.width = goalPct + '%';
  document.getElementById('next-hint').textContent =
    goalPct >= 80 ? "Keyingi daraja juda yaqin — bir necha kun qoldi"
      : goalPct >= 40 ? "Yarim yo'lni bosib o'tdingiz"
      : "Har kuni 10 daqiqa — eng ishonchli yo'l";
}

function logoTap() { /* removed admin — admin is now separate file */ }

function resetProgress() {
  if (!confirm("Haqiqatdan ham barcha statistikani nolga keltirmoqchimisiz?")) return;
  localStorage.removeItem('lx_srs');
  localStorage.removeItem('lx_stats');
  alert("Statistika tozalandi");
  show('s-home');
}

// ────────────────────────────────────────────────────────────────────
// KIRISH — экран входа и переход в приложение.
// Пока пользователь не вошёл (или не выбрал режим гостя), словарь не
// грузится и приложение не показывается.
// ────────────────────────────────────────────────────────────────────
let authMode = 'in';        // 'in' — вход, 'up' — регистрация
let authBusy = false;
let appStarted = false;

function authTab(mode) {
  authMode = mode;
  document.getElementById('auth-tab-in').classList.toggle('active', mode === 'in');
  document.getElementById('auth-tab-up').classList.toggle('active', mode === 'up');
  document.getElementById('auth-name-row').style.display = mode === 'up' ? '' : 'none';
  document.getElementById('auth-submit').textContent = mode === 'up' ? "Ro'yxatdan o'tish" : 'Kirish';
  document.getElementById('auth-pass').setAttribute('autocomplete', mode === 'up' ? 'new-password' : 'current-password');
  authError('');
}

function authError(msg) {
  const box = document.getElementById('auth-err');
  box.textContent = msg || '';
  box.style.display = msg ? '' : 'none';
}

function authSetBusy(state) {
  authBusy = state;
  document.getElementById('auth-submit').disabled = state;
  document.getElementById('auth-google').disabled = state;
}

async function authSubmit() {
  if (authBusy) return;
  const name = document.getElementById('auth-name').value.trim();
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-pass').value;

  if (!email || !pass) { authError("Email va parolni to'ldiring"); return; }
  if (authMode === 'up' && pass.length < 6) { authError('Parol kamida 6 ta belgidan iborat bo\'lsin'); return; }

  authError('');
  authSetBusy(true);
  try {
    if (authMode === 'up') await LexiQAuth.signUp(name, email, pass);
    else await LexiQAuth.signIn(email, pass);
  } catch (e) {
    authError(e.message);
  } finally {
    authSetBusy(false);
  }
}

async function authGoogle() {
  if (authBusy) return;
  authError('');
  authSetBusy(true);
  try {
    await LexiQAuth.signInGoogle();
  } catch (e) {
    authError(e.message);
  } finally {
    authSetBusy(false);
  }
}

function authGuest() {
  const name = document.getElementById('auth-name').value.trim();
  LexiQAuth.continueAsGuest(name);
}

function logoutAsk() {
  const guest = LexiQAuth.current() && LexiQAuth.current().guest;
  document.getElementById('logout-text').textContent = guest
    ? "Mehmon rejimidan chiqasiz. Natijalar shu brauzerda qoladi, lekin ularni faqat shu qurilmada ko'rasiz."
    : "Hisobingizdan chiqasiz. Progress hisobingizda saqlanib qoladi.";
  document.getElementById('logout-modal').classList.add('open');
}

// Клик по затемнению закрывает окно, клик внутри — нет.
function logoutClose(event) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById('logout-modal').classList.remove('open');
}

async function logoutConfirm() {
  document.getElementById('logout-modal').classList.remove('open');
  await LexiQAuth.signOut();
  appStarted = false;
  show('s-auth');
}

function renderProfile() {
  const user = LexiQAuth.current();
  if (!user) return;
  const name = user.name || 'Mehmon';
  const stats = getStats();
  const st = streakState(stats);

  document.getElementById('pf-ava').textContent = name.charAt(0).toUpperCase();
  document.getElementById('pf-name').textContent = name;
  document.getElementById('pf-mail').textContent = user.email || '';

  const kind = document.getElementById('pf-kind');
  kind.textContent = user.guest ? 'Mehmon rejimi' : 'Hisob faol';
  kind.classList.toggle('online', !user.guest);

  document.getElementById('pf-level').textContent = getCEFRLevel();
  document.getElementById('pf-known').textContent = getKnownWordsCount();
  document.getElementById('pf-streak').textContent = st.days;
  document.getElementById('pf-record').textContent = streakBest(st.days);

  document.getElementById('pf-note').textContent = user.guest
    ? "Ro'yxatdan o'tsangiz, progress hisobingizda saqlanadi va boshqa qurilmada ham ochiladi. Reytingda ham qatnasha olasiz."
    : "Progress hisobingizga saqlanmoqda — istalgan qurilmadan kirsangiz, davom ettirasiz.";
}

// Без настроенного Firebase регистрация невозможна — показываем только вход гостем,
// чтобы человек не тыкал в поля, которые всё равно не сработают.
function authApplyMode() {
  const online = LexiQAuth.isFirebase();
  ['auth-tabs', 'auth-submit', 'auth-google'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = online ? '' : 'none';
  });
  document.querySelector('.auth-fields').style.display = online ? '' : 'none';
  document.querySelector('.auth-sep').style.display = online ? '' : 'none';
  if (!online) {
    document.getElementById('auth-note').textContent =
      "Hozircha mehmon rejimi ishlaydi: natijalar shu qurilmada saqlanadi.";
  }
}

function renderUser(user) {
  const chip = document.getElementById('user-chip');
  if (!chip) return;
  const name = user.name || 'Mehmon';
  document.getElementById('uc-name').textContent = name;
  document.getElementById('uc-ava').textContent = name.charAt(0).toUpperCase();
}

async function startApp() {
  if (appStarted) return;
  appStarted = true;
  show('s-loading');
  const loaded = await loadVocab();
  show(loaded && VOCAB.length > 0 ? 's-home' : 's-error');
}

function onAuthChange(user) {
  if (user) {
    renderUser(user);
    startApp();
    syncPull();
  } else {
    appStarted = false;
    authApplyMode();
    show('s-auth');
  }
}

LexiQAuth.onChange(onAuthChange);
LexiQAuth.init();

// Enter в любом поле формы — отправка
['auth-name', 'auth-email', 'auth-pass'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') authSubmit(); });
});

// ────────────────────────────────────────────────────────────────────
// AI USTOZ — чат с ИИ-репетитором.
// Ключи провайдеров на сервере, фронт ходит только в /api/tutor
// и читает ответ потоком, дописывая текст в пузырь по мере прихода.
// ────────────────────────────────────────────────────────────────────
const TUTOR_ENDPOINT = '/api/tutor';
const TUTOR_HISTORY_KEY = 'lexiq_tutor_history';   // режим «Ustoz»
const TALK_HISTORY_KEY = 'lexiq_talk_history';     // режим «Suhbat»
const TUTOR_MAX_HISTORY = 24;

// Сценарии разговора — местные ситуации, а не абстрактные диалоги.
const TALK_SCENARIOS = [
  { id: 'tanishuv',   label: '👋 Tanishuv',   opener: 'Hello! Nice to meet you. What is your name?' },
  { id: 'aeroport',   label: '✈️ Aeroport',   opener: 'Good morning! Can I see your passport and ticket, please?' },
  { id: 'bozor',      label: '🍅 Bozor',      opener: 'Hello! These tomatoes are very fresh. How many kilos do you want?' },
  { id: 'kafe',       label: '☕️ Kafe',       opener: 'Welcome! Here is the menu. What would you like to drink?' },
  { id: 'universitet',label: '🎓 Universitet',opener: 'Hi! Are you a new student here? Which faculty are you in?' },
  { id: 'ish',        label: '💼 Ish suhbati',opener: 'Good afternoon. Please tell me a little about yourself.' },
  { id: 'shifokor',   label: '🩺 Shifokor',   opener: 'Hello. What is the problem? Where does it hurt?' },
  { id: 'yol',        label: '🚌 Yo\'lda',    opener: 'Excuse me, does this bus go to the city centre?' },
];

const TUTOR_CHIPS = [
  { label: "🆕 5 ta yangi so'z", text: "Mening darajam uchun 5 ta yangi so'z bering, har biriga misol gap bilan." },
  { label: '✍️ Gapimni tekshiring', text: 'Men yozgan inglizcha gapni tekshiring va xatolarimni tushuntiring: ' },
  { label: '📖 Grammatika', text: "Present Simple qoidasini oddiy qilib tushuntiring, 3 ta misol bilan." },
  { label: '💬 Suhbat', text: "Men bilan oddiy inglizcha suhbat boshlang. Birinchi savolni bering." },
];

let tutorHistory = [];
let tutorMode = 'ustoz';      // 'ustoz' — объясняет по-узбекски, 'suhbat' — говорит по-английски
let talkScenario = 'tanishuv';
let tutorBusy = false;
let tutorWired = false;
let tutorPending = null;   // вопрос, заданный с другого экрана

function tutorHistoryKey() {
  return tutorMode === 'suhbat' ? TALK_HISTORY_KEY : TUTOR_HISTORY_KEY;
}

function tutorLoadHistory() {
  try {
    const raw = localStorage.getItem(tutorHistoryKey());
    const parsed = raw ? JSON.parse(raw) : [];
    tutorHistory = Array.isArray(parsed) ? parsed.slice(-TUTOR_MAX_HISTORY) : [];
  } catch (e) {
    tutorHistory = [];
  }
}

function tutorSaveHistory() {
  try {
    localStorage.setItem(tutorHistoryKey(), JSON.stringify(tutorHistory.slice(-TUTOR_MAX_HISTORY)));
  } catch (e) {
    // Переполнение localStorage не должно ломать чат.
  }
}

function tutorEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Из разметки модели поддерживаем только **жирный** — остальное показываем как текст.
function tutorFormat(s) {
  const html = tutorEscape(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  // Разговорный режим присылает исправление двумя строками с маркерами —
  // показываем их отдельным блоком, а не как часть реплики.
  return html
    .replace(/^\u270D\uFE0F?\s*(.+)$/gm, '<span class="cm-fix">✍️ $1</span>')
    .replace(/^\u2139\uFE0F?\s*(.+)$/gm, '<span class="cm-why">ℹ️ $1</span>');
}

function tutorAutoGrow(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function tutorScrollDown() {
  const log = document.getElementById('chat-log');
  if (log) log.scrollTop = log.scrollHeight;
}

function tutorBubble(role, html) {
  const log = document.getElementById('chat-log');
  const div = document.createElement('div');
  div.className = 'chat-msg ' + role;
  div.innerHTML = html;
  log.appendChild(div);
  tutorScrollDown();
  return div;
}

function tutorRenderChips() {
  const box = document.getElementById('chat-chips');
  box.innerHTML = '';
  TUTOR_CHIPS.forEach(chip => {
    const b = document.createElement('button');
    b.className = 'chat-chip';
    b.textContent = chip.label;
    b.onclick = () => {
      const input = document.getElementById('chat-input');
      input.value = chip.text;
      input.focus();
      tutorAutoGrow(input);
      if (!chip.text.endsWith(' ')) tutorSend();
    };
    box.appendChild(b);
  });
}

function tutorRenderLog() {
  const log = document.getElementById('chat-log');
  log.innerHTML = '';
  if (tutorHistory.length === 0) {
    tutorBubble('bot', tutorFormat(
      tutorMode === 'suhbat'
        ? "Keling, ingliz tilida gaplashamiz 💬\n\nVaziyatni tanlang va inglizcha yozing. Xato qilsangiz, avval to'g'ri variantni ko'rsataman, keyin suhbatni davom ettiraman."
        : "Salom! Men LexiQ Ustozman 👋\n\nIngliz tili bo'yicha istalgan savolingizni bering: so'z ma'nosi, grammatika, gap tuzish yoki xatolarni tekshirish. Pastdagi tugmalardan ham boshlashingiz mumkin."
    ));
    return;
  }
  tutorHistory.forEach(m => tutorBubble(m.role === 'user' ? 'user' : 'bot', tutorFormat(m.content)));
}

function tutorSetMode(mode) {
  if (tutorBusy || mode === tutorMode) return;
  tutorMode = mode;
  document.getElementById('tm-ustoz').classList.toggle('active', mode === 'ustoz');
  document.getElementById('tm-suhbat').classList.toggle('active', mode === 'suhbat');
  document.getElementById('tutor-name').textContent = mode === 'suhbat' ? 'Suhbat' : 'AI Ustoz';
  document.getElementById('tutor-ava').textContent = mode === 'suhbat' ? '💬' : '🤖';
  document.getElementById('chat-input').placeholder =
    mode === 'suhbat' ? 'Write in English...' : 'Savolingizni yozing...';
  document.getElementById('chat-scenarios').style.display = mode === 'suhbat' ? '' : 'none';
  document.getElementById('chat-chips').style.display = mode === 'suhbat' ? 'none' : '';
  tutorLoadHistory();
  tutorRenderLog();
}

function tutorRenderScenarios() {
  const box = document.getElementById('chat-scenarios');
  box.innerHTML = '';
  TALK_SCENARIOS.forEach(sc => {
    const b = document.createElement('button');
    b.className = 'chat-chip' + (sc.id === talkScenario ? ' on' : '');
    b.textContent = sc.label;
    b.onclick = () => tutorPickScenario(sc.id);
    box.appendChild(b);
  });
}

// Смена ситуации начинает разговор заново: реплики из аэропорта в кафе не нужны.
function tutorPickScenario(id) {
  if (tutorBusy) return;
  const sc = TALK_SCENARIOS.find(x => x.id === id);
  if (!sc) return;
  talkScenario = id;
  tutorRenderScenarios();
  tutorHistory = [{ role: 'assistant', content: sc.opener }];
  tutorSaveHistory();
  tutorRenderLog();
}

function tutorInit() {
  const level = getCEFRLevel();
  document.getElementById('tutor-level-label').textContent = 'Daraja: ' + level;

  if (!tutorWired) {
    tutorLoadHistory();
    tutorRenderChips();
    tutorRenderScenarios();
    const input = document.getElementById('chat-input');
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); tutorSend(); }
    });
    tutorWired = true;
  }
  tutorRenderLog();

  if (tutorPending) {
    const text = tutorPending;
    tutorPending = null;
    const input = document.getElementById('chat-input');
    input.value = text;
    tutorAutoGrow(input);
    tutorSend();
  }
}

// Открывает чат и сразу отправляет вопрос — используется разбором ошибок теста.
function tutorAsk(text) {
  tutorPending = text;
  show('s-tutor');
}

function tutorReset() {
  tutorHistory = [];
  tutorSaveHistory();
  tutorRenderLog();
}

function tutorSetBusy(state) {
  tutorBusy = state;
  const btn = document.getElementById('chat-send');
  if (btn) btn.disabled = state;
}

async function tutorSend() {
  if (tutorBusy) return;
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  tutorAutoGrow(input);

  tutorHistory.push({ role: 'user', content: text });
  tutorHistory = tutorHistory.slice(-TUTOR_MAX_HISTORY);
  tutorSaveHistory();
  tutorBubble('user', tutorFormat(text));

  tutorSetBusy(true);
  const bubble = tutorBubble('bot', '<span class="chat-typing"><i></i><i></i><i></i></span>');
  let answer = '';

  try {
    const res = await fetch(TUTOR_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        messages: tutorHistory,
        level: getCEFRLevel(),
        mode: tutorMode,
        scenario: talkScenario,
      }),
    });

    if (!res.ok || !res.body) {
      const info = await res.json().catch(() => ({}));
      bubble.className = 'chat-msg err';
      bubble.innerHTML = tutorEscape(info.error || ('Xatolik: ' + res.status)) +
        (info.hint ? '<span class="cm-hint">' + tutorEscape(info.hint) + '</span>' : '');
      tutorHistory.pop();
      tutorSaveHistory();
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      answer += decoder.decode(value, { stream: true });
      bubble.innerHTML = tutorFormat(answer);
      tutorScrollDown();
    }

    if (!answer.trim()) {
      bubble.className = 'chat-msg err';
      bubble.textContent = "Javob bo'sh keldi. Yana urinib ko'ring.";
      tutorHistory.pop();
      tutorSaveHistory();
      return;
    }

    tutorHistory.push({ role: 'assistant', content: answer });
    tutorHistory = tutorHistory.slice(-TUTOR_MAX_HISTORY);
    tutorSaveHistory();
  } catch (e) {
    bubble.className = 'chat-msg err';
    bubble.textContent = 'Aloqa xatosi: ' + e.message;
    tutorHistory.pop();
    tutorSaveHistory();
  } finally {
    tutorSetBusy(false);
  }
}

// ────────────────────────────────────────────────────────────────────
// AI MASHQ — урок и тест, сгенерированные под уровень ученика.
// Сервер (/api/generate) отдаёт уже нормализованный JSON, поэтому здесь
// только отрисовка и логика прохождения.
// ────────────────────────────────────────────────────────────────────
const AI_ENDPOINT = '/api/generate';
const AI_QUIZ_SIZE = 5;

const AI_TOPICS = [
  { label: '🗣 Kundalik suhbat', topic: 'kundalik suhbat iboralari' },
  { label: '⏰ Present Simple', topic: 'Present Simple grammatikasi' },
  { label: '🕓 Past Simple', topic: 'Past Simple grammatikasi' },
  { label: '✈️ Sayohat', topic: 'sayohat va aeroport so\'zlari' },
  { label: '💼 Ish', topic: 'ish va ofis so\'zlari' },
  { label: '🍽 Ovqat', topic: 'ovqat va restoran so\'zlari' },
  { label: '📱 Texnologiya', topic: 'texnologiya va internet so\'zlari' },
  { label: '🎓 Akademik', topic: "akademik va rasmiy so'zlar" },
];

const AI_VIEWS = ['ai-setup', 'ai-loading', 'ai-error', 'ai-lesson', 'ai-quiz', 'ai-result'];

let aiTopic = '';
let aiQuestions = [];
let aiIdx = 0;
let aiAnswers = [];
let aiBusy = false;
let aiWired = false;

function aiShowView(id) {
  AI_VIEWS.forEach(v => {
    const el = document.getElementById(v);
    if (!el) return;
    // Пустая строка возвращает элемент к display из таблицы стилей (flex),
    // а не к inline-значению — иначе внутренние отступы пропадают.
    el.style.display = (v === id) ? '' : 'none';
  });
}

function aiRenderTopics() {
  const box = document.getElementById('ai-topics');
  box.innerHTML = '';
  AI_TOPICS.forEach(t => {
    const b = document.createElement('button');
    b.className = 'chat-chip';
    b.textContent = t.label;
    b.onclick = () => {
      aiTopic = t.topic;
      document.getElementById('ai-topic').value = t.topic;
      box.querySelectorAll('.chat-chip').forEach(c => c.classList.remove('on'));
      b.classList.add('on');
    };
    box.appendChild(b);
  });
}

function aiInit() {
  document.getElementById('ai-level-label').textContent = 'Daraja: ' + getCEFRLevel();
  if (!aiWired) {
    aiRenderTopics();
    aiWired = true;
  }
  aiShowView('ai-setup');
}

function aiBackToSetup() {
  aiShowView('ai-setup');
}

function aiCurrentTopic() {
  const typed = document.getElementById('ai-topic').value.trim();
  return typed || aiTopic || 'kundalik ingliz tili';
}

function aiFail(info, status) {
  aiShowView('ai-error');
  const box = document.getElementById('ai-error-txt');
  const msg = (info && info.error) ? info.error : ('Xatolik: ' + status);
  box.innerHTML = tutorEscape(msg) +
    (info && info.hint ? '<span class="cm-hint">' + tutorEscape(info.hint) + '</span>' : '');
}

async function aiGenerate(mode) {
  if (aiBusy) return;
  aiBusy = true;

  const topic = aiCurrentTopic();
  const level = getCEFRLevel();
  aiShowView('ai-loading');
  document.getElementById('ai-loading-txt').textContent =
    mode === 'lesson' ? 'Dars tayyorlanmoqda...' : 'Test tuzilmoqda...';

  try {
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode, level, topic, count: AI_QUIZ_SIZE }),
    });

    if (!res.ok) {
      const info = await res.json().catch(() => ({}));
      aiFail(info, res.status);
      return;
    }

    const data = await res.json();
    if (mode === 'lesson') aiRenderLesson(data);
    else aiStartQuiz(data);
  } catch (e) {
    aiFail({ error: 'Aloqa xatosi: ' + e.message }, 0);
  } finally {
    aiBusy = false;
  }
}

function aiSpeak(text) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function aiRenderLesson(data) {
  const lesson = data.lesson || {};
  document.getElementById('lesson-title').textContent = lesson.title || data.topic || 'Dars';
  document.getElementById('lesson-intro').textContent = lesson.intro || '';

  const box = document.getElementById('lesson-points');
  box.innerHTML = '';
  (lesson.points || []).forEach((p, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'lesson-point';

    const rule = document.createElement('div');
    rule.className = 'lp-rule';
    rule.innerHTML = '<span class="lp-num">' + (i + 1) + '</span>' + tutorFormat(p.rule || '');
    wrap.appendChild(rule);

    if (p.example_en) {
      const ex = document.createElement('div');
      ex.className = 'lp-ex';

      const en = document.createElement('div');
      en.className = 'lp-en';
      en.textContent = p.example_en;
      const speak = document.createElement('button');
      speak.className = 'lp-speak';
      speak.textContent = '🔊';
      speak.onclick = () => aiSpeak(p.example_en);
      en.appendChild(speak);
      ex.appendChild(en);

      if (p.example_uz) {
        const uz = document.createElement('div');
        uz.className = 'lp-uz';
        uz.textContent = p.example_uz;
        ex.appendChild(uz);
      }
      wrap.appendChild(ex);
    }
    box.appendChild(wrap);
  });

  const sum = document.getElementById('lesson-summary');
  sum.textContent = lesson.summary || '';
  sum.style.display = lesson.summary ? '' : 'none';

  aiTopic = data.topic || aiTopic;
  aiShowView('ai-lesson');
  window.scrollTo(0, 0);
}

function aiStartQuiz(data) {
  aiQuestions = data.questions || [];
  aiIdx = 0;
  aiAnswers = [];
  aiTopic = data.topic || aiTopic;
  document.getElementById('ai-q-topic').textContent = aiTopic;
  aiShowView('ai-quiz');
  aiRenderQuestion();
}

function aiRenderQuestion() {
  const q = aiQuestions[aiIdx];
  document.getElementById('ai-q-counter').textContent = (aiIdx + 1) + ' / ' + aiQuestions.length;
  document.getElementById('ai-q-text').textContent = q.q;
  document.getElementById('ai-explain').style.display = 'none';
  document.getElementById('ai-next-btn').style.display = 'none';

  const grid = document.getElementById('ai-options');
  grid.innerHTML = '';
  q.options.forEach((opt, i) => {
    const b = document.createElement('button');
    b.className = 'mc-opt';
    b.textContent = opt;
    b.onclick = () => aiAnswer(i);
    grid.appendChild(b);
  });
  window.scrollTo(0, 0);
}

function aiAnswer(picked) {
  const q = aiQuestions[aiIdx];
  if (aiAnswers.length > aiIdx) return;   // на вопрос уже ответили

  aiAnswers.push(picked);
  const buttons = document.getElementById('ai-options').querySelectorAll('.mc-opt');
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === q.correct) b.classList.add('correct');
    else if (i === picked) b.classList.add('wrong');
  });

  const exp = document.getElementById('ai-explain');
  const ok = picked === q.correct;
  exp.className = 'ai-explain' + (ok ? '' : ' wrong');
  exp.innerHTML = (ok ? '✅ ' : '❌ ') + tutorFormat(q.explanation || (ok ? "To'g'ri!" : "To'g'ri javob: " + q.options[q.correct]));
  exp.style.display = '';

  const next = document.getElementById('ai-next-btn');
  next.textContent = (aiIdx + 1 < aiQuestions.length) ? 'Keyingi →' : 'Natijani ko\'rish';
  next.style.display = '';
}

function aiNext() {
  if (aiIdx + 1 < aiQuestions.length) {
    aiIdx++;
    aiRenderQuestion();
  } else {
    aiRenderResult();
  }
}

function aiRenderResult() {
  let correct = 0;
  aiQuestions.forEach((q, i) => { if (aiAnswers[i] === q.correct) correct++; });
  const wrong = aiQuestions.length - correct;
  const pct = Math.round((correct / aiQuestions.length) * 100);

  document.getElementById('ai-rc-correct').textContent = correct;
  document.getElementById('ai-rc-wrong').textContent = wrong;
  document.getElementById('ai-rc-emoji').textContent = pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪';
  document.getElementById('ai-rc-title').textContent = pct >= 80 ? 'Ajoyib!' : pct >= 50 ? 'Yaxshi!' : 'Yana mashq qiling';
  document.getElementById('ai-rc-sub').textContent = pct + '% to\'g\'ri — ' + aiTopic;

  const box = document.getElementById('ai-review');
  box.innerHTML = '';
  const lbl = document.getElementById('ai-review-lbl');

  const mistakes = aiQuestions
    .map((q, i) => ({ q, i }))
    .filter(({ q, i }) => aiAnswers[i] !== q.correct);

  lbl.style.display = mistakes.length ? '' : 'none';

  mistakes.forEach(({ q, i }) => {
    const item = document.createElement('div');
    item.className = 'ai-rev-item';

    const qt = document.createElement('div');
    qt.className = 'ai-rev-q';
    qt.textContent = q.q;
    item.appendChild(qt);

    const bad = document.createElement('div');
    bad.className = 'ai-rev-line ai-rev-bad';
    bad.textContent = '❌ Sizning javobingiz: ' + (q.options[aiAnswers[i]] ?? '—');
    item.appendChild(bad);

    const good = document.createElement('div');
    good.className = 'ai-rev-line ai-rev-good';
    good.textContent = '✅ To\'g\'ri javob: ' + q.options[q.correct];
    item.appendChild(good);

    if (q.explanation) {
      const exp = document.createElement('div');
      exp.className = 'ai-rev-exp';
      exp.textContent = q.explanation;
      item.appendChild(exp);
    }

    const btn = document.createElement('button');
    btn.className = 'ai-rev-btn';
    btn.textContent = '🤖 Batafsil tushuntirish';
    btn.onclick = () => tutorAsk(
      'Savol: "' + q.q + '". Men "' + (q.options[aiAnswers[i]] ?? '—') +
      '" deb javob berdim, lekin to\'g\'risi "' + q.options[q.correct] +
      '" ekan. Nima uchun ekanini batafsil tushuntiring va shunga o\'xshash 2 ta misol bering.'
    );
    item.appendChild(btn);

    box.appendChild(item);
  });

  aiShowView('ai-result');
  window.scrollTo(0, 0);
}

// ────────────────────────────────────────────────────────────────────
// SERIYA — визуальный слой над streakDays, который уже считается.
// Огонь растёт вместе с серией и гаснет, если день пропущен.
// ────────────────────────────────────────────────────────────────────
const STREAK_BEST_KEY = 'lexiq_streak_best';
const STREAK_STAGES = [
  { from: 0,  icon: '🕯', text: "Bugun mashq qiling — seriya boshlanadi" },
  { from: 1,  icon: '✨', text: "Boshlandi! Ertaga ham qaytib keling" },
  { from: 3,  icon: '🔥', text: "Yaxshi ketyapti, olov yonmoqda" },
  { from: 7,  icon: '🔥', text: "Bir hafta! Odat shakllanmoqda" },
  { from: 14, icon: '🌋', text: "Ikki hafta — bu allaqachon jiddiy" },
  { from: 30, icon: '🏆', text: "Bir oy uzluksiz. Zo'r natija" },
];

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function streakBest(current) {
  let best = 0;
  try { best = parseInt(localStorage.getItem(STREAK_BEST_KEY) || '0', 10) || 0; } catch (e) {}
  if (current > best) {
    best = current;
    try { localStorage.setItem(STREAK_BEST_KEY, String(best)); } catch (e) {}
  }
  return best;
}

// Серия жива, если играли сегодня или вчера: вчерашняя ещё не сгорела,
// но человек должен успеть сегодня — об этом и предупреждаем.
function streakState(stats) {
  const today = todayStr();
  if (!stats.lastDayPlayed) return { days: 0, alive: false, playedToday: false };
  const gap = daysBetween(stats.lastDayPlayed, today);
  if (gap === 0) return { days: stats.streakDays || 0, alive: true, playedToday: true };
  if (gap === 1) return { days: stats.streakDays || 0, alive: true, playedToday: false };
  return { days: 0, alive: false, playedToday: false };
}

function renderStreak() {
  const card = document.getElementById('streak-card');
  if (!card) return;
  const stats = getStats();
  const st = streakState(stats);
  const stage = STREAK_STAGES.slice().reverse().find(s => st.days >= s.from) || STREAK_STAGES[0];

  card.classList.toggle('lit', st.alive && st.days > 0);
  card.classList.toggle('cold', !st.alive || st.days === 0);
  document.getElementById('sk-flame').textContent = stage.icon;
  document.getElementById('sk-count').textContent = st.days;
  document.getElementById('sk-best').textContent = streakBest(st.days);

  let sub = stage.text;
  if (st.alive && !st.playedToday) {
    const left = 24 - new Date().getHours();
    sub = `Seriya ${left} soatdan keyin uziladi — bugun mashq qiling`;
  }
  document.getElementById('sk-sub').textContent = sub;

  // Полоски последней недели: закрашены дни, попавшие внутрь серии.
  const week = document.getElementById('sk-week');
  week.innerHTML = '';
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const within = st.alive && stats.lastDayPlayed &&
      daysBetween(key, stats.lastDayPlayed) >= 0 &&
      daysBetween(key, stats.lastDayPlayed) < st.days;
    const el = document.createElement('div');
    el.className = 'sk-day' + (key === todayStr() && st.playedToday ? ' today' : within ? ' on' : '');
    week.appendChild(el);
  }
}

// ────────────────────────────────────────────────────────────────────
// KUN TOPSHIRIG'I — одно задание в день, одинаковое для всех.
// Слова выбираются детерминированно по дате, поэтому общий сервер не нужен:
// у двух людей в один день набор совпадает.
// ────────────────────────────────────────────────────────────────────
const DAILY_KEY = 'lexiq_daily';
const DAILY_SIZE = 10;

// Простой детерминированный генератор: одна и та же дата — одна и та же выборка.
function seededRandom(seed) {
  let x = seed;
  return function () {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    return x / 0x7fffffff;
  };
}

function dateSeed(dateStr) {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) h = (h * 31 + dateStr.charCodeAt(i)) & 0x7fffffff;
  return h;
}

let dailyWords = [];
let dailyIdx = 0;
let dailyCorrect = 0;

function dailyBuild() {
  const rnd = seededRandom(dateSeed(todayStr()));
  const pool = VOCAB.slice();
  const picked = [];
  const used = new Set();
  while (picked.length < Math.min(DAILY_SIZE, pool.length)) {
    const i = Math.floor(rnd() * pool.length);
    if (used.has(i)) continue;
    used.add(i);
    picked.push(pool[i]);
  }
  return picked.map(word => {
    const options = [word];
    const guard = new Set([word.id]);
    while (options.length < 4 && options.length < pool.length) {
      const cand = pool[Math.floor(rnd() * pool.length)];
      if (guard.has(cand.id)) continue;
      guard.add(cand.id);
      options.push(cand);
    }
    // Тасуем варианты тем же генератором — порядок тоже одинаков у всех.
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return { word, options, correct: options.findIndex(o => o.id === word.id) };
  });
}

function dailyLoad() {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    const data = raw ? JSON.parse(raw) : null;
    return data && data.date === todayStr() ? data : null;
  } catch (e) {
    return null;
  }
}

function dailySave(score) {
  const prev = dailyLoad();
  const best = Math.max(score, (prev && prev.best) || 0);
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify({ date: todayStr(), score, best, done: true }));
  } catch (e) {}
}

function renderDailyCard() {
  const card = document.getElementById('daily-card');
  if (!card) return;
  const done = dailyLoad();
  card.classList.toggle('done', !!done);
  document.getElementById('dc-state').textContent = done ? `${done.score} / ${DAILY_SIZE}` : 'Bajarilmagan';
  document.getElementById('dc-title').textContent = done
    ? "Bugungi topshiriq bajarildi"
    : `Bugungi ${DAILY_SIZE} ta so'z`;
  document.getElementById('dc-sub').textContent = done
    ? "Ertaga yangi topshiriq. Yana urinib ko'rishingiz mumkin."
    : "Hamma uchun bir xil. Xatosiz bajaring va rekordni yangilang.";
}

function dailyStart() {
  if (!VOCAB.length) return;
  dailyWords = dailyBuild();
  dailyIdx = 0;
  dailyCorrect = 0;
  document.getElementById('daily-play').style.display = '';
  document.getElementById('daily-done').style.display = 'none';
  document.getElementById('dh-date').textContent = todayStr();
  show('s-daily');
  dailyRender();
}

function dailyRender() {
  const q = dailyWords[dailyIdx];
  document.getElementById('dl-counter').textContent = (dailyIdx + 1) + ' / ' + dailyWords.length;
  document.getElementById('dl-score').textContent = dailyCorrect + ' ball';
  document.getElementById('dl-word').textContent = q.word.en;

  const grid = document.getElementById('dl-options');
  grid.innerHTML = '';
  q.options.forEach((opt, i) => {
    const b = document.createElement('button');
    b.className = 'mc-opt';
    b.textContent = Array.isArray(opt.uz) ? opt.uz[0] : opt.uz;
    b.onclick = () => dailyAnswer(i, b);
    grid.appendChild(b);
  });
}

function dailyAnswer(picked, btn) {
  const q = dailyWords[dailyIdx];
  const buttons = document.getElementById('dl-options').querySelectorAll('.mc-opt');
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === q.correct) b.classList.add('correct');
    else if (i === picked) b.classList.add('wrong');
  });
  if (picked === q.correct) dailyCorrect++;

  setTimeout(() => {
    dailyIdx++;
    if (dailyIdx < dailyWords.length) dailyRender();
    else dailyFinish();
  }, 700);
}

function dailyFinish() {
  recordDayActivity();
  dailySave(dailyCorrect);
  lbSubmit(dailyCorrect).then(lbRender);
  syncSoon();
  const data = dailyLoad();
  const pct = Math.round((dailyCorrect / dailyWords.length) * 100);

  document.getElementById('daily-play').style.display = 'none';
  document.getElementById('daily-done').style.display = '';
  document.getElementById('dl-correct').textContent = dailyCorrect;
  document.getElementById('dl-best').textContent = (data && data.best) || dailyCorrect;
  document.getElementById('dl-emoji').textContent = pct === 100 ? '🏆' : pct >= 70 ? '👍' : '💪';
  document.getElementById('dl-title').textContent =
    pct === 100 ? "Mukammal!" : pct >= 70 ? "Yaxshi natija" : "Yana mashq kerak";
  document.getElementById('dl-sub').textContent = pct + "% to'g'ri";
  document.getElementById('dl-note').textContent =
    "Bugungi topshiriq hamma uchun bir xil edi. Reyting ro'yxatdan o'tgan foydalanuvchilar uchun qo'shiladi.";
}

// ────────────────────────────────────────────────────────────────────
// XARITA — путь по уровням. Каждый CEFR это «город»: видно, сколько слов
// в нём пройдено, какой открыт, а какой ещё закрыт.
// Правило открытия: следующий город открывается, когда в текущем
// изучено больше половины слов.
// ────────────────────────────────────────────────────────────────────
const MAP_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const CITY_UNLOCK_PCT = 50;

function levelProgress(level) {
  const words = VOCAB.filter(w => w.level === level);
  if (words.length === 0) return { known: 0, total: 0, pct: 0 };
  const srs = srsLoad();
  let known = 0;
  words.forEach(w => { if (srs[w.id] && srs[w.id].box >= 3) known++; });
  return { known, total: words.length, pct: Math.round((known / words.length) * 100) };
}

function renderMap() {
  const box = document.getElementById('map-path');
  if (!box) return;
  box.innerHTML = '';

  let unlocked = true;   // A1 открыт всегда
  let currentMarked = false;

  MAP_LEVELS.forEach(level => {
    const p = levelProgress(level);
    const done = p.pct >= CITY_UNLOCK_PCT;
    const isCurrent = unlocked && !done && !currentMarked;
    if (isCurrent) currentMarked = true;

    const card = document.createElement('button');
    card.className = 'city' + (!unlocked ? ' locked' : '') + (done ? ' done' : '') + (isCurrent ? ' current' : '');
    card.innerHTML =
      '<div class="city-top">' +
        '<span class="city-code">' + level + '</span>' +
        '<span class="city-name">' + (CEFR_NAMES[level] || '') + '</span>' +
        '<span class="city-state">' + (!unlocked ? '🔒' : done ? '✅' : CEFR_ICONS[level] || '📍') + '</span>' +
      '</div>' +
      '<div class="city-bar"><i style="width:' + (unlocked ? p.pct : 0) + '%"></i></div>' +
      '<div class="city-meta">' +
        '<span>' + (unlocked ? p.known + ' / ' + p.total + " so'z" : "Yopiq") + '</span>' +
        '<span>' + (unlocked ? p.pct + '%' : 'Oldingi darajani ' + CITY_UNLOCK_PCT + '% ga yeting') + '</span>' +
      '</div>';

    if (unlocked) {
      card.onclick = () => {
        setLevelFilter(level);
        show('s-topics');
      };
    }
    box.appendChild(card);

    // Следующий город открыт, только если этот пройден больше чем наполовину
    unlocked = unlocked && done;
  });
}

// ────────────────────────────────────────────────────────────────────
// TALAFFUZ — проверка произношения через распознавание речи браузера.
// API есть не везде (Chrome — да, Safari — частично), поэтому кнопка
// показывается только там, где оно реально работает, и никогда не
// блокирует занятие: не распозналось — просто подсказка, а не ошибка.
// ────────────────────────────────────────────────────────────────────
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let pronActive = false;

// Насколько похожи два слова: 1 — совпадают, 0 — ничего общего.
// Расстояние Левенштейна, нормированное на длину.
function wordSimilarity(a, b) {
  a = a.toLowerCase().replace(/[^a-z]/g, '');
  b = b.toLowerCase().replace(/[^a-z]/g, '');
  if (!a || !b) return 0;
  if (a === b) return 1;
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return 1 - prev[n] / Math.max(m, n);
}

function pronShow(cls, text) {
  const box = document.getElementById('pron-result');
  if (!box) return;
  box.className = 'pron-result ' + cls;
  box.textContent = text;
  box.style.display = '';
}

function pronSetup() {
  const btn = document.getElementById('fc-mic');
  if (!btn) return;
  btn.style.display = SpeechRec ? '' : 'none';
  const box = document.getElementById('pron-result');
  if (box) box.style.display = 'none';
}

function pronStart() {
  if (!SpeechRec || pronActive) return;
  const word = trainPool[trainIdx];
  if (!word) return;

  const btn = document.getElementById('fc-mic');
  const rec = new SpeechRec();
  rec.lang = 'en-US';
  rec.interimResults = false;
  rec.maxAlternatives = 3;

  pronActive = true;
  btn.classList.add('listening');
  btn.textContent = '🎤 Eshitilmoqda...';
  pronShow('near', "Mikrofonga so'zni ayting");

  rec.onresult = (e) => {
    const heard = [];
    for (let i = 0; i < e.results[0].length; i++) heard.push(e.results[0][i].transcript.trim());
    const best = heard.reduce((acc, h) => Math.max(acc, wordSimilarity(h, word.en)), 0);

    if (best >= 0.85) pronShow('ok', '✅ Zo\'r! "' + word.en + '" to\'g\'ri aytildi');
    else if (best >= 0.55) pronShow('near', '🟡 Yaqin. Eshitildi: "' + heard[0] + '". Yana urinib ko\'ring');
    else pronShow('bad', '❌ Eshitildi: "' + heard[0] + '". Avval 🔊 tugmasini bosib tinglang');
  };

  rec.onerror = (e) => {
    if (e.error === 'not-allowed') pronShow('bad', 'Mikrofonga ruxsat berilmadi');
    else if (e.error === 'no-speech') pronShow('near', 'Ovoz eshitilmadi. Yana urinib ko\'ring');
    else pronShow('bad', 'Xatolik: ' + e.error);
  };

  rec.onend = () => {
    pronActive = false;
    btn.classList.remove('listening');
    btn.textContent = '🎤 Ayting';
  };

  try {
    rec.start();
  } catch (e) {
    pronActive = false;
    btn.classList.remove('listening');
    btn.textContent = '🎤 Ayting';
    pronShow('bad', 'Mikrofon ishga tushmadi');
  }
}

// ────────────────────────────────────────────────────────────────────
// MENING XATOLARIM — тест по личным слабым местам.
// Слабыми считаются слова из младших коробок Лейтнера: именно на них
// ученик спотыкается чаще всего.
// ────────────────────────────────────────────────────────────────────
const WEAK_WORDS_LIMIT = 12;

function weakWords() {
  const srs = srsLoad();
  const seen = VOCAB.filter(w => srs[w.id]);
  // Коробка 0-1 — слово ещё не закрепилось; сортируем от самых проблемных.
  return seen
    .filter(w => (srs[w.id].box || 0) <= 1)
    .sort((a, b) => (srs[a.id].box || 0) - (srs[b.id].box || 0))
    .slice(0, WEAK_WORDS_LIMIT);
}

function aiWeakSpots() {
  const weak = weakWords();
  if (weak.length < 4) {
    aiShowView('ai-error');
    document.getElementById('ai-error-txt').innerHTML =
      "Hali yetarli ma'lumot yo'q" +
      '<span class="cm-hint">Bir necha marta o\'ynang — qaysi so\'zlar qiyin ekani aniqlansin, keyin shu yerda shaxsiy test paydo bo\'ladi.</span>';
    return;
  }
  const list = weak.map(w => w.en).join(', ');
  document.getElementById('ai-topic').value = "mening qiyin so'zlarim: " + list;
  aiTopic = "qiyin so'zlar: " + list;
  aiGenerate('quiz');
}

// ────────────────────────────────────────────────────────────────────
// REYTING — таблица лидеров задания дня.
// Набор слов уже одинаков у всех (выбирается по дате), поэтому сравнение
// честное. Пишем только свою строку: путь daily/{дата}/scores/{uid},
// остальное запрещают правила Firestore.
// ────────────────────────────────────────────────────────────────────
const LB_LIMIT = 20;

function lbReady() {
  return typeof firebase !== 'undefined' &&
    firebase.apps && firebase.apps.length > 0 &&
    typeof firebase.firestore === 'function' &&
    LexiQAuth.current() && !LexiQAuth.current().guest;
}

async function lbSubmit(score) {
  if (!lbReady()) return;
  const user = LexiQAuth.current();
  try {
    await firebase.firestore()
      .collection('daily').doc(todayStr())
      .collection('scores').doc(user.uid)
      .set({
        name: (user.name || 'Talaba').slice(0, 40),
        score: score,
        at: firebase.firestore.FieldValue.serverTimestamp(),
      });
  } catch (e) {
    console.warn('reyting yozilmadi', e);
  }
}

async function lbRender() {
  const box = document.getElementById('leaderboard');
  const sub = document.getElementById('lb-sub');
  if (!box) return;
  box.innerHTML = '';

  if (!lbReady()) {
    sub.textContent = '';
    box.innerHTML = '<div class="lb-empty">Reytingda qatnashish uchun ro\'yxatdan o\'ting — mehmon rejimida natijalar faqat shu qurilmada qoladi.</div>';
    return;
  }

  sub.textContent = 'yuklanmoqda...';
  try {
    const snap = await firebase.firestore()
      .collection('daily').doc(todayStr())
      .collection('scores')
      .orderBy('score', 'desc')
      .limit(LB_LIMIT)
      .get();

    const me = LexiQAuth.current().uid;
    if (snap.empty) {
      sub.textContent = '';
      box.innerHTML = '<div class="lb-empty">Bugun hali hech kim topshiriqni bajarmagan. Siz birinchisiz!</div>';
      return;
    }

    sub.textContent = snap.size + ' ta ishtirokchi';
    let pos = 0;
    snap.forEach(doc => {
      pos++;
      const d = doc.data();
      const row = document.createElement('div');
      row.className = 'lb-row' + (pos <= 3 ? ' top' : '') + (doc.id === me ? ' me' : '');
      row.innerHTML =
        '<span class="lb-pos">' + pos + '</span>' +
        '<span class="lb-name"></span>' +
        '<span class="lb-score">' + d.score + '</span>';
      // Имя приходит от другого пользователя — вставляем только как текст.
      row.querySelector('.lb-name').textContent = d.name || 'Talaba';
      box.appendChild(row);
    });
  } catch (e) {
    sub.textContent = '';
    box.innerHTML = '<div class="lb-empty">Reytingni yuklab bo\'lmadi. Internetni tekshiring.</div>';
    console.warn('reyting o\'qilmadi', e);
  }
}

// ────────────────────────────────────────────────────────────────────
// Синхронизация прогресса с аккаунтом: статистика и коробки Лейтнера
// уезжают в users/{uid} и возвращаются на другом устройстве.
// ────────────────────────────────────────────────────────────────────
let syncTimer = null;

function syncReady() {
  return lbReady();
}

async function syncPush() {
  if (!syncReady()) return;
  const user = LexiQAuth.current();
  try {
    await firebase.firestore().collection('users').doc(user.uid).set({
      stats: getStats(),
      srs: srsLoad(),
      streakBest: parseInt(localStorage.getItem(STREAK_BEST_KEY) || '0', 10) || 0,
      at: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn('progress saqlanmadi', e);
  }
}

// Записей много (каждый ответ), поэтому копим и отправляем пачкой.
function syncSoon() {
  if (!syncReady()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(syncPush, 4000);
}

async function syncPull() {
  if (!syncReady()) return;
  const user = LexiQAuth.current();
  try {
    const doc = await firebase.firestore().collection('users').doc(user.uid).get();
    if (!doc.exists) return;
    const data = doc.data();
    // Берём облачное только если там больше прогресса — иначе свежая
    // локальная игра затёрлась бы старой копией из аккаунта.
    const localKnown = Object.keys(srsLoad()).length;
    const cloudKnown = data.srs ? Object.keys(data.srs).length : 0;
    if (cloudKnown > localKnown) {
      srsSave(data.srs);
      if (data.stats) statsSave(data.stats);
      if (data.streakBest) localStorage.setItem(STREAK_BEST_KEY, String(data.streakBest));
      updateHomeStats();
    }
  } catch (e) {
    console.warn('progress yuklanmadi', e);
  }
}

// ────────────────────────────────────────────────────────────────────
// O'QISH — чтение с заданиями.
// Текст, словарик и вопросы приходят одним ответом: если запрашивать
// вопросы отдельно, они окажутся про другой текст.
// ────────────────────────────────────────────────────────────────────
const READ_VIEWS = ['read-setup', 'read-loading', 'read-error', 'read-text', 'read-quiz', 'read-done'];
const READ_GENRES = [
  { id: 'hikoya',  label: '📚 Hikoya' },
  { id: 'dialog',  label: '💬 Dialog' },
  { id: 'yangilik',label: '📰 Yangilik' },
  { id: 'ilmiy',   label: '🔬 Ilmiy' },
];
const READ_TOPICS = [
  "kundalik hayot", "sayohat", "do'stlik", "texnologiya",
  "sport", "ovqat", "maktab va universitet", "ish",
];

let readGenre = 'hikoya';
let readTopic = READ_TOPICS[0];
let readData = null;
let readIdx = 0;
let readCorrect = 0;
let readBusy = false;
let readWired = false;

function readShowView(id) {
  READ_VIEWS.forEach(v => {
    const el = document.getElementById(v);
    if (el) el.style.display = (v === id) ? '' : 'none';
  });
}

function readBack() {
  speechSynthesis.cancel();
  readShowView('read-setup');
}

function readChips(boxId, items, current, onPick) {
  const box = document.getElementById(boxId);
  box.innerHTML = '';
  items.forEach(item => {
    const id = item.id || item;
    const b = document.createElement('button');
    b.className = 'chat-chip' + (id === current ? ' on' : '');
    b.textContent = item.label || item;
    b.onclick = () => onPick(id);
    box.appendChild(b);
  });
}

function readInit() {
  document.getElementById('read-level-label').textContent = 'Daraja: ' + getCEFRLevel();
  if (!readWired) {
    readWired = true;
  }
  readChips('read-genres', READ_GENRES, readGenre, id => { readGenre = id; readInit(); });
  readChips('read-topics', READ_TOPICS, readTopic, id => {
    readTopic = id;
    document.getElementById('read-topic').value = id;
    readInit();
  });
  readShowView('read-setup');
}

async function readGenerate() {
  if (readBusy) return;
  readBusy = true;
  speechSynthesis.cancel();

  const typed = document.getElementById('read-topic').value.trim();
  const topic = typed || readTopic;
  readShowView('read-loading');

  try {
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'reading', level: getCEFRLevel(), topic, genre: readGenre }),
    });
    if (!res.ok) {
      const info = await res.json().catch(() => ({}));
      readShowView('read-error');
      document.getElementById('read-error-txt').innerHTML =
        tutorEscape(info.error || ('Xatolik ' + res.status)) +
        (info.hint ? '<span class="cm-hint">' + tutorEscape(info.hint) + '</span>' : '');
      return;
    }
    const data = await res.json();
    readData = data.reading;
    readRenderText(data);
  } catch (e) {
    readShowView('read-error');
    document.getElementById('read-error-txt').textContent = 'Aloqa xatosi: ' + e.message;
  } finally {
    readBusy = false;
  }
}

function readRenderText(data) {
  const r = readData;
  document.getElementById('rd-title').textContent = r.title || 'Matn';
  const words = (r.text || '').split(/\s+/).filter(Boolean).length;
  document.getElementById('rd-meta').textContent =
    data.level + ' · ' + words + " so'z · " + (data.topic || '');

  // Слова из словарика подчёркиваем прямо в тексте: перевод виден по наведению.
  const body = document.getElementById('rd-body');
  body.textContent = r.text || '';
  (r.glossary || []).forEach(g => {
    const re = new RegExp('\\b(' + g.en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')\\b', 'i');
    const html = body.innerHTML;
    if (re.test(html)) {
      body.innerHTML = html.replace(re, '<span class="gl" title="' + tutorEscape(g.uz) + '">$1</span>');
    }
  });

  const gloss = document.getElementById('rd-gloss');
  gloss.innerHTML = '';
  (r.glossary || []).forEach(g => {
    const row = document.createElement('div');
    row.className = 'gloss-row';
    row.innerHTML = '<span class="gloss-en"></span><span class="gloss-uz"></span>' +
      '<button class="gloss-say">🔊</button>';
    row.querySelector('.gloss-en').textContent = g.en;
    row.querySelector('.gloss-uz').textContent = g.uz;
    row.querySelector('.gloss-say').onclick = () => aiSpeak(g.en);
    gloss.appendChild(row);
  });

  document.getElementById('rd-add').disabled = false;
  document.getElementById('rd-add').textContent = "➕ So'zlarni lug'atga qo'shish";
  readReveal();
  readShowView('read-text');
  window.scrollTo(0, 0);
}

// Озвучка текста целиком — то же аудирование, только с текстом перед глазами.
function readSpeak() {
  const btn = document.getElementById('rd-speak');
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    btn.classList.remove('on');
    btn.textContent = '🔊 Tinglash';
    return;
  }
  if (!readData || !readData.text) return;
  const u = new SpeechSynthesisUtterance(readData.text);
  u.lang = 'en-US';
  // На младших уровнях читаем медленнее — иначе половина слов сливается.
  const lvl = getCEFRLevel();
  u.rate = (lvl === 'A1' || lvl === 'A2') ? 0.78 : 0.92;
  u.onend = () => { btn.classList.remove('on'); btn.textContent = '🔊 Tinglash'; };
  btn.classList.add('on');
  btn.textContent = '⏹ To\'xtatish';
  speechSynthesis.speak(u);
}

// Слова из текста уезжают в общий словарь — с примером из самого текста.
function readAddWords() {
  if (!readData || !readData.glossary) return;
  const have = new Set(VOCAB.map(w => w.id));
  const level = getCEFRLevel();
  let added = 0;

  readData.glossary.forEach(g => {
    const id = 'ai-' + g.en.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (have.has(id)) return;
    const sentence = (readData.text || '').split(/(?<=[.!?])\s+/)
      .find(s => new RegExp('\\b' + g.en + '\\b', 'i').test(s)) || '';
    VOCAB.push({
      id, en: g.en.toLowerCase(), uz: [g.uz], level,
      topic: 'reading', pos: '', example_en: sentence.trim(), example_uz: '', status: 'ok',
    });
    added++;
  });

  saveVocab();
  const btn = document.getElementById('rd-add');
  btn.disabled = true;
  btn.textContent = added ? '✓ ' + added + " ta so'z qo'shildi" : "Bu so'zlar allaqachon lug'atda";
}

function readStartQuiz() {
  speechSynthesis.cancel();
  readIdx = 0;
  readCorrect = 0;
  readShowView('read-quiz');
  readRenderQuestion();
}

function readRenderQuestion() {
  const q = readData.questions[readIdx];
  document.getElementById('rd-counter').textContent = (readIdx + 1) + ' / ' + readData.questions.length;
  document.getElementById('rd-q').textContent = q.q;
  document.getElementById('rd-explain').style.display = 'none';
  document.getElementById('rd-next').style.display = 'none';

  const grid = document.getElementById('rd-options');
  grid.innerHTML = '';
  q.options.forEach((opt, i) => {
    const b = document.createElement('button');
    b.className = 'mc-opt';
    b.textContent = opt;
    b.onclick = () => readAnswer(i);
    grid.appendChild(b);
  });
  window.scrollTo(0, 0);
}

function readAnswer(picked) {
  const q = readData.questions[readIdx];
  const buttons = document.getElementById('rd-options').querySelectorAll('.mc-opt');
  if (buttons[0].disabled) return;

  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === q.correct) b.classList.add('correct');
    else if (i === picked) b.classList.add('wrong');
  });
  if (picked === q.correct) readCorrect++;

  const exp = document.getElementById('rd-explain');
  exp.className = 'ai-explain' + (picked === q.correct ? '' : ' wrong');
  exp.textContent = (picked === q.correct ? '✅ ' : '❌ ') +
    (q.explanation || ("To'g'ri javob: " + q.options[q.correct]));
  exp.style.display = '';

  const next = document.getElementById('rd-next');
  next.textContent = (readIdx + 1 < readData.questions.length) ? 'Keyingi →' : "Natijani ko'rish";
  next.style.display = '';
}

function readNext() {
  if (readIdx + 1 < readData.questions.length) {
    readIdx++;
    readRenderQuestion();
  } else {
    const total = readData.questions.length;
    const pct = Math.round((readCorrect / total) * 100);
    document.getElementById('rd-emoji').textContent = pct >= 75 ? '🏆' : pct >= 50 ? '👍' : '💪';
    document.getElementById('rd-title2').textContent =
      pct >= 75 ? 'Matnni yaxshi tushundingiz' : pct >= 50 ? "Yomon emas" : "Matnni qayta o'qing";
    document.getElementById('rd-sub').textContent = readCorrect + ' / ' + total + " to'g'ri";
    recordDayActivity();
    readShowView('read-done');
    window.scrollTo(0, 0);
  }
}

// ────────────────────────────────────────────────────────────────────
// YOZISH — письмо с разбором.
// Оценка 1-5 по четырём понятным критериям, а не экзаменационный балл:
// платформа доводит до уровня, а не выставляет отметку.
// ────────────────────────────────────────────────────────────────────
const WRITE_VIEWS = ['write-setup', 'write-loading', 'write-error', 'write-result'];
const WRITE_TASKS = [
  { id: 'kun',     label: '📅 Kunim',       text: "Bugungi kuningiz haqida yozing: nima qildingiz, kim bilan uchrashdingiz." },
  { id: 'dost',    label: '✉️ Do\'stga xat', text: "Do'stingizga xat yozing: qanday yashayotganingizni va yaqin rejalaringizni ayting." },
  { id: 'shahar',  label: '🏙 Mening shahrim', text: "O'z shahringizni tasvirlang: nimasi yoqadi, nimasini o'zgartirgan bo'lardingiz." },
  { id: 'orzu',    label: '🌟 Orzuim',      text: "Kelajakdagi orzuingiz haqida yozing va unga qanday erishmoqchisiz." },
  { id: 'fikr',    label: '💭 Fikrim',      text: "Telefon bolalarga foydali yoki zararli? O'z fikringizni asoslab yozing." },
];

let writeTask = WRITE_TASKS[0];
let writeBusy = false;

function writeShowView(id) {
  WRITE_VIEWS.forEach(v => {
    const el = document.getElementById(v);
    if (el) el.style.display = (v === id) ? '' : 'none';
  });
}

function writeBack() {
  writeShowView('write-setup');
}

function writeInit() {
  document.getElementById('write-level-label').textContent = 'Daraja: ' + getCEFRLevel();
  const box = document.getElementById('write-tasks');
  box.innerHTML = '';
  WRITE_TASKS.forEach(t => {
    const b = document.createElement('button');
    b.className = 'chat-chip' + (t.id === writeTask.id ? ' on' : '');
    b.textContent = t.label;
    b.onclick = () => { writeTask = t; writeInit(); };
    box.appendChild(b);
  });
  document.getElementById('write-task-text').textContent = writeTask.text;
  writeCount();
  writeShowView('write-setup');
}

function writeCount() {
  const words = document.getElementById('write-area').value.split(/\s+/).filter(Boolean).length;
  document.getElementById('write-words').textContent = words + " so'z";
  const hint = document.getElementById('write-hint');
  hint.textContent = words < 10 ? "kamida 10 ta so'z" : words < 40 ? 'yaxshi, davom eting' : 'yetarli';
}

async function writeCheck() {
  if (writeBusy) return;
  const text = document.getElementById('write-area').value.trim();
  if (text.split(/\s+/).filter(Boolean).length < 10) {
    document.getElementById('write-hint').textContent = "kamida 10 ta so'z kerak";
    return;
  }

  writeBusy = true;
  writeShowView('write-loading');
  try {
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'writing', level: getCEFRLevel(), task: writeTask.text, text }),
    });
    if (!res.ok) {
      const info = await res.json().catch(() => ({}));
      writeShowView('write-error');
      document.getElementById('write-error-txt').innerHTML =
        tutorEscape(info.error || ('Xatolik ' + res.status)) +
        (info.hint ? '<span class="cm-hint">' + tutorEscape(info.hint) + '</span>' : '');
      return;
    }
    const data = await res.json();
    writeRender(data.check);
    recordDayActivity();
  } catch (e) {
    writeShowView('write-error');
    document.getElementById('write-error-txt').textContent = 'Aloqa xatosi: ' + e.message;
  } finally {
    writeBusy = false;
  }
}

function writeRender(check) {
  document.getElementById('sc-task').textContent = check.scores.task;
  document.getElementById('sc-grammar').textContent = check.scores.grammar;
  document.getElementById('sc-vocab').textContent = check.scores.vocabulary;
  document.getElementById('sc-coh').textContent = check.scores.coherence;
  document.getElementById('write-comment').textContent = check.comment || '';
  document.getElementById('write-level').textContent = check.level_note || '';
  document.getElementById('write-fixed').textContent = check.corrected || '';

  const box = document.getElementById('write-notes');
  box.innerHTML = '';
  document.getElementById('notes-lbl').style.display = check.notes.length ? '' : 'none';
  check.notes.forEach(n => {
    const item = document.createElement('div');
    item.className = 'note-item';
    item.innerHTML = '<div class="note-wrong"></div><div class="note-right"></div><div class="note-why"></div>';
    item.querySelector('.note-wrong').textContent = n.wrong;
    item.querySelector('.note-right').textContent = '→ ' + n.right;
    item.querySelector('.note-why').textContent = n.why;
    box.appendChild(item);
  });

  writeShowView('write-result');
  window.scrollTo(0, 0);
}

// ────────────────────────────────────────────────────────────────────
// TINGLASH — то же чтение, но текст закрыт: остаётся только звук.
// Отдельного запроса к ИИ не нужно, материал уже сгенерирован.
// ────────────────────────────────────────────────────────────────────
let readHiddenMode = false;

function readListenMode() {
  readHiddenMode = !readHiddenMode;
  document.getElementById('rd-body').style.display = readHiddenMode ? 'none' : '';
  document.getElementById('rd-hidden').style.display = readHiddenMode ? '' : 'none';
  document.getElementById('rd-listen').classList.toggle('on', readHiddenMode);
  // Словарик тоже прячем: в нём половина ответов на вопросы.
  document.getElementById('rd-gloss').style.display = readHiddenMode ? 'none' : '';
  if (readHiddenMode && !speechSynthesis.speaking) readSpeak();
}

function readReveal() {
  readHiddenMode = false;
  document.getElementById('rd-body').style.display = '';
  document.getElementById('rd-hidden').style.display = 'none';
  document.getElementById('rd-gloss').style.display = '';
  document.getElementById('rd-listen').classList.remove('on');
}
