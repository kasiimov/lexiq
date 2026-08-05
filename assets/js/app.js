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
function getIELTSBand() {
  const known = getKnownWordsCount();
  if (known < 100) return 4.0;
  if (known < 500) return 4.5;
  if (known < 1000) return 5.0;
  if (known < 1500) return 5.5;
  if (known < 2000) return 6.0;
  if (known < 2500) return 6.5;
  if (known < 3000) return 7.0;
  return 7.5;
}

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

  // Try fetching vocabulary.json from same folder
  try {
    const res = await fetch('./data/vocabulary.json');
    if (res.ok) {
      const data = await res.json();
      VOCAB = data.words || data;
      saveVocab();
      console.log('Loaded ' + VOCAB.length + ' words from vocabulary.json');
      return true;
    }
  } catch(e) { console.warn('Fetch vocabulary.json fail', e); }

  return false;
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

  const band = getIELTSBand();
  document.getElementById('ielts-band').textContent = band.toFixed(1);
  let hint = '';
  if (band < 5.0) hint = "Asoslarni o'rganing — 500 so'zga yetib boring";
  else if (band < 6.0) hint = "Yaxshi boshlanish! 1000 so'zga harakat qiling";
  else if (band < 7.0) hint = "B2 darajaga yaqinsiz! Davom eting";
  else if (band < 7.5) hint = "Ajoyib! IELTS-ga tayyor bo'lyapsiz";
  else hint = "Mukammal!";
  document.getElementById('ielts-hint').textContent = hint;
}

function logoTap() { /* removed admin — admin is now separate file */ }

function resetProgress() {
  if (!confirm("Haqiqatdan ham barcha statistikani nolga keltirmoqchimisiz?")) return;
  localStorage.removeItem('lx_srs');
  localStorage.removeItem('lx_stats');
  alert("Statistika tozalandi");
  show('s-home');
}

// INIT
async function init() {
  const loaded = await loadVocab();
  if (loaded && VOCAB.length > 0) {
    show('s-home');
  } else {
    show('s-error');
  }
}

init();

// ────────────────────────────────────────────────────────────────────
// AI USTOZ — чат с ИИ-репетитором.
// Ключи провайдеров на сервере, фронт ходит только в /api/tutor
// и читает ответ потоком, дописывая текст в пузырь по мере прихода.
// ────────────────────────────────────────────────────────────────────
const TUTOR_ENDPOINT = '/api/tutor';
const TUTOR_HISTORY_KEY = 'lexiq_tutor_history';
const TUTOR_MAX_HISTORY = 24;

const TUTOR_CHIPS = [
  { label: "🆕 5 ta yangi so'z", text: "Mening darajam uchun 5 ta yangi so'z bering, har biriga misol gap bilan." },
  { label: '✍️ Gapimni tekshiring', text: 'Men yozgan inglizcha gapni tekshiring va xatolarimni tushuntiring: ' },
  { label: '📖 Grammatika', text: "Present Simple qoidasini oddiy qilib tushuntiring, 3 ta misol bilan." },
  { label: '💬 Suhbat', text: "Men bilan oddiy inglizcha suhbat boshlang. Birinchi savolni bering." },
];

let tutorHistory = [];
let tutorBusy = false;
let tutorWired = false;
let tutorPending = null;   // вопрос, заданный с другого экрана

function tutorLoadHistory() {
  try {
    const raw = localStorage.getItem(TUTOR_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    tutorHistory = Array.isArray(parsed) ? parsed.slice(-TUTOR_MAX_HISTORY) : [];
  } catch (e) {
    tutorHistory = [];
  }
}

function tutorSaveHistory() {
  try {
    localStorage.setItem(TUTOR_HISTORY_KEY, JSON.stringify(tutorHistory.slice(-TUTOR_MAX_HISTORY)));
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
  return tutorEscape(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
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
      "Salom! Men LexiQ Ustozman 👋\n\nIngliz tili bo'yicha istalgan savolingizni bering: so'z ma'nosi, grammatika, gap tuzish yoki xatolarni tekshirish. Pastdagi tugmalardan ham boshlashingiz mumkin."
    ));
    return;
  }
  tutorHistory.forEach(m => tutorBubble(m.role === 'user' ? 'user' : 'bot', tutorFormat(m.content)));
}

function tutorInit() {
  const level = getCEFRLevel();
  document.getElementById('tutor-level-label').textContent = 'Daraja: ' + level;

  if (!tutorWired) {
    tutorLoadHistory();
    tutorRenderChips();
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
      body: JSON.stringify({ messages: tutorHistory, level: getCEFRLevel() }),
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
  { label: '🎓 IELTS', topic: 'IELTS uchun akademik so\'zlar' },
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
    if (el) el.style.display = (v === id) ? '' : 'none';
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
