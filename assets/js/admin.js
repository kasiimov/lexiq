// ════════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════════
let vocab = [];
let filtered = [];
let statusFilter = 'todo';
let levelFilter = 'all';
let topicFilter = 'all';
let sortBy = 'alpha';
let searchQuery = '';
let currentPage = 1;
const PAGE_SIZE = 30;
let unsavedChanges = false;
let editingId = null;

const STORAGE_KEY = 'congix_admin_vocab';

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vocab));
  } catch(e) {
    showToast("Saqlash xatosi: " + e.message, 'error');
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { vocab = JSON.parse(raw); return true; }
  } catch(e) { console.warn('Load fail', e); }
  return false;
}

async function init() {
  if (loadFromStorage()) {
    showToast("Lokal saqlovdan " + vocab.length + " ta so'z yuklandi", 'success');
  } else {
    try {
      const res = await fetch('./data/vocabulary.json');
      if (res.ok) {
        const data = await res.json();
        vocab = data.words || data;
        saveToStorage();
        showToast("vocabulary.json dan " + vocab.length + " ta so'z yuklandi", 'success');
      } else {
        showToast("Bo'sh boshlandi. JSON yuklang yoki so'z qo'shing.", 'success');
      }
    } catch(e) {
      showToast("Bo'sh boshlandi. JSON yuklang yoki so'z qo'shing.", 'success');
    }
  }
  buildTopicsList();
  render();
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      const words = data.words || data;
      if (!Array.isArray(words)) {
        showToast("JSON formati noto'g'ri", 'error');
        return;
      }
      if (vocab.length > 0) {
        if (!confirm("Hozir " + vocab.length + " ta so'z bor. Yangi fayl bilan birlashtirilsinmi?\n\nOK — birlashtirish (id bo'yicha)\nCancel — bekor qilish")) return;
        const byId = {};
        for (const w of vocab) byId[w.id] = w;
        for (const w of words) byId[w.id] = w;
        vocab = Object.values(byId);
      } else {
        vocab = words;
      }
      saveToStorage();
      buildTopicsList();
      currentPage = 1;
      render();
      showToast(words.length + " ta so'z yuklandi. Jami: " + vocab.length, 'success');
    } catch(err) {
      showToast("JSON o'qish xatosi: " + err.message, 'error');
    }
    event.target.value = '';
  };
  reader.readAsText(file);
}

function exportJSON() {
  if (vocab.length === 0) {
    showToast("Eksport qilish uchun so'z yo'q", 'error');
    return;
  }
  const exportData = {
    meta: {
      version: "1.0",
      total_words: vocab.length,
      language: "Uzbek (Latin)",
      exported_at: new Date().toISOString(),
      status_ok: vocab.filter(w => w.status === 'ok').length,
      status_todo: vocab.filter(w => w.status === 'todo').length,
      status_review: vocab.filter(w => w.status === 'review').length
    },
    words: vocab
  };
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = new Date().toISOString().slice(0,10);
  a.href = url;
  a.download = 'vocabulary-' + today + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(vocab.length + " ta so'z eksport qilindi", 'success');
}

function setStatusFilter(s) {
  statusFilter = s;
  document.querySelectorAll('#status-pills .pill').forEach(p => {
    p.classList.remove('active', 'ok', 'todo', 'review', 'all');
    if (p.dataset.status === s) p.classList.add('active', s);
  });
  currentPage = 1;
  render();
}

function onFilterChange() {
  levelFilter = document.getElementById('level-filter').value;
  topicFilter = document.getElementById('topic-filter').value;
  sortBy = document.getElementById('sort-by').value;
  currentPage = 1;
  render();
}

function onSearchChange() {
  searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
  currentPage = 1;
  render();
}

function applyFilters() {
  let result = vocab.slice();
  if (statusFilter !== 'all') result = result.filter(w => w.status === statusFilter);
  if (levelFilter !== 'all') result = result.filter(w => w.level === levelFilter);
  if (topicFilter !== 'all') result = result.filter(w => w.topic === topicFilter);
  if (searchQuery) {
    result = result.filter(w => {
      const uzText = (w.uz || []).join(' ').toLowerCase();
      return w.en.toLowerCase().includes(searchQuery) ||
             uzText.includes(searchQuery) ||
             (w.id || '').toLowerCase().includes(searchQuery);
    });
  }
  if (sortBy === 'alpha') result.sort((a,b) => a.en.localeCompare(b.en));
  else if (sortBy === 'alpha-desc') result.sort((a,b) => b.en.localeCompare(a.en));
  else if (sortBy === 'level') {
    const order = {A1:1, A2:2, B1:3, B2:4, C1:5, C2:6};
    result.sort((a,b) => (order[a.level]||9) - (order[b.level]||9) || a.en.localeCompare(b.en));
  } else if (sortBy === 'recent') {
    const idIdx = {};
    vocab.forEach((w,i) => idIdx[w.id] = i);
    result.sort((a,b) => (idIdx[b.id]||0) - (idIdx[a.id]||0));
  }
  return result;
}

function buildTopicsList() {
  const topics = [...new Set(vocab.map(w => w.topic).filter(Boolean))].sort();
  const sel = document.getElementById('topic-filter');
  const dl = document.getElementById('topics-datalist');
  sel.innerHTML = '<option value="all">Hammasi</option>';
  dl.innerHTML = '';
  for (const t of topics) {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    sel.appendChild(opt);
    const dlOpt = document.createElement('option');
    dlOpt.value = t;
    dl.appendChild(dlOpt);
  }
}

function render() {
  renderStats();
  filtered = applyFilters();
  renderWordsList();
  renderPagination();
}

function renderStats() {
  const total = vocab.length;
  const ok = vocab.filter(w => w.status === 'ok').length;
  const todo = vocab.filter(w => w.status === 'todo').length;
  const review = vocab.filter(w => w.status === 'review').length;
  document.getElementById('stats-grid').innerHTML =
    '<div class="stat-card"><div class="stat-v total">' + total + '</div><div class="stat-l">Jami so\'z</div></div>' +
    '<div class="stat-card"><div class="stat-v ok">' + ok + '</div><div class="stat-l">✓ OK</div></div>' +
    '<div class="stat-card"><div class="stat-v todo">' + todo + '</div><div class="stat-l">⏳ Todo</div></div>' +
    '<div class="stat-card"><div class="stat-v review">' + review + '</div><div class="stat-l">⚠ Review</div></div>';
}

function escapeAttr(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderWordsList() {
  const container = document.getElementById('words-list-container');
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><div style="font-weight:700; font-size:15px; color:var(--txt); margin-bottom:6px;">So\'zlar topilmadi</div><div>Filtrlarni o\'zgartiring yoki yangi so\'z qo\'shing</div></div>';
    return;
  }
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);
  let html = '<div class="words-list">';
  for (const w of pageItems) html += renderWordRow(w);
  html += '</div>';
  container.innerHTML = html;
}

function renderWordRow(w) {
  const uzStr = (w.uz || []).join(', ');
  const status = w.status || 'todo';
  return '<div class="word-row status-' + status + '" data-id="' + w.id + '">' +
    '<div class="word-header">' +
      '<div class="word-en">' + escapeHtml(w.en) + '</div>' +
      '<div class="word-meta">' +
        '<span class="meta-badge level-' + w.level + '">' + w.level + '</span>' +
        '<span class="meta-badge">' + escapeHtml(w.topic || 'common') + '</span>' +
        (w.pos ? '<span class="meta-badge">' + escapeHtml(w.pos) + '</span>' : '') +
        (w.phon ? '<span class="meta-badge">' + escapeHtml(w.phon) + '</span>' : '') +
        '<span class="meta-badge">' + w.id + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="field-grid">' +
      '<div class="field"><label class="field-label">O\'zbekcha (vergul bilan)</label>' +
        '<input type="text" class="field-input uz" value="' + escapeAttr(uzStr) + '" oninput="updateField(\'' + w.id + '\', \'uz\', this.value)"></div>' +
      '<div class="field"><label class="field-label">English (so\'z)</label>' +
        '<input type="text" class="field-input" value="' + escapeAttr(w.en) + '" oninput="updateField(\'' + w.id + '\', \'en\', this.value)"></div>' +
    '</div>' +
    '<div class="field-grid">' +
      '<div class="field"><label class="field-label">Misol — English</label>' +
        '<input type="text" class="field-input example" value="' + escapeAttr(w.example_en) + '" oninput="updateField(\'' + w.id + '\', \'example_en\', this.value)"></div>' +
      '<div class="field"><label class="field-label">Misol — O\'zbekcha</label>' +
        '<input type="text" class="field-input example" value="' + escapeAttr(w.example_uz) + '" oninput="updateField(\'' + w.id + '\', \'example_uz\', this.value)"></div>' +
    '</div>' +
    '<div class="row-actions">' +
      '<button class="btn btn-ghost btn-xs" onclick="openEditModal(\'' + w.id + '\')">✏ Batafsil</button>' +
      '<button class="btn btn-danger btn-xs" onclick="deleteWord(\'' + w.id + '\')">🗑 O\'chirish</button>' +
      '<div style="flex:1"></div>' +
      '<div class="status-buttons">' +
        '<button class="status-btn ' + (status==='ok'?'active ok':'') + '" onclick="setWordStatus(\'' + w.id + '\',\'ok\')">✓ OK</button>' +
        '<button class="status-btn ' + (status==='todo'?'active todo':'') + '" onclick="setWordStatus(\'' + w.id + '\',\'todo\')">⏳ Todo</button>' +
        '<button class="status-btn ' + (status==='review'?'active review':'') + '" onclick="setWordStatus(\'' + w.id + '\',\'review\')">⚠ Review</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagEl = document.getElementById('pagination');
  if (totalPages <= 1) { pagEl.style.display = 'none'; return; }
  pagEl.style.display = 'flex';
  document.getElementById('page-info').textContent = currentPage + ' / ' + totalPages + ' (jami ' + filtered.length + ')';
  document.getElementById('prev-page').disabled = currentPage === 1;
  document.getElementById('next-page').disabled = currentPage === totalPages;
}

function prevPage() {
  if (currentPage > 1) { currentPage--; renderWordsList(); renderPagination(); window.scrollTo(0,0); }
}
function nextPage() {
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (currentPage < totalPages) { currentPage++; renderWordsList(); renderPagination(); window.scrollTo(0,0); }
}

function updateField(id, field, value) {
  const w = vocab.find(v => v.id === id);
  if (!w) return;
  if (field === 'uz') {
    w.uz = value.split(',').map(s => s.trim()).filter(Boolean);
  } else {
    w[field] = value;
  }
  saveToStorage();
  renderStats();
}

function setWordStatus(id, status) {
  const w = vocab.find(v => v.id === id);
  if (!w) return;
  w.status = status;
  saveToStorage();
  render();
  showToast('"' + w.en + '" — ' + status.toUpperCase(), 'success');
}

function deleteWord(id) {
  const w = vocab.find(v => v.id === id);
  if (!w) return;
  if (!confirm('"' + w.en + '" so\'zini o\'chirishni xohlaysizmi?')) return;
  vocab = vocab.filter(v => v.id !== id);
  saveToStorage();
  render();
  showToast('"' + w.en + '" o\'chirildi', 'success');
}

function openAddModal() {
  editingId = null;
  document.getElementById('add-modal-title').textContent = "➕ Yangi so'z qo'shish";
  document.getElementById('add-id').value = '';
  document.getElementById('add-en').value = '';
  document.getElementById('add-uz').value = '';
  document.getElementById('add-level').value = 'A1';
  document.getElementById('add-topic').value = 'common';
  document.getElementById('add-pos').value = 'noun';
  document.getElementById('add-phon').value = '';
  document.getElementById('add-example-en').value = '';
  document.getElementById('add-example-uz').value = '';
  document.getElementById('add-status').value = 'todo';
  document.getElementById('add-modal').classList.add('show');
  setTimeout(() => document.getElementById('add-en').focus(), 100);
}

function openEditModal(id) {
  const w = vocab.find(v => v.id === id);
  if (!w) return;
  editingId = id;
  document.getElementById('add-modal-title').textContent = '✏ Tahrirlash: ' + w.en;
  document.getElementById('add-id').value = w.id;
  document.getElementById('add-en').value = w.en || '';
  document.getElementById('add-uz').value = (w.uz || []).join(', ');
  document.getElementById('add-level').value = w.level || 'A1';
  document.getElementById('add-topic').value = w.topic || 'common';
  document.getElementById('add-pos').value = w.pos || 'noun';
  document.getElementById('add-phon').value = w.phon || '';
  document.getElementById('add-example-en').value = w.example_en || '';
  document.getElementById('add-example-uz').value = w.example_uz || '';
  document.getElementById('add-status').value = w.status || 'todo';
  document.getElementById('add-modal').classList.add('show');
}

function closeAddModal() {
  document.getElementById('add-modal').classList.remove('show');
  editingId = null;
}

function saveNewWord() {
  const en = document.getElementById('add-en').value.trim();
  const uzStr = document.getElementById('add-uz').value.trim();
  if (!en) { showToast("Inglizcha so'z bo'sh", 'error'); return; }
  if (!uzStr) { showToast("O'zbekcha tarjima bo'sh", 'error'); return; }

  const uz = uzStr.split(',').map(s => s.trim()).filter(Boolean);
  const data = {
    en: en.toLowerCase(),
    uz: uz,
    level: document.getElementById('add-level').value,
    topic: document.getElementById('add-topic').value.trim() || 'common',
    pos: document.getElementById('add-pos').value,
    phon: document.getElementById('add-phon').value.trim(),
    example_en: document.getElementById('add-example-en').value.trim(),
    example_uz: document.getElementById('add-example-uz').value.trim(),
    status: document.getElementById('add-status').value
  };

  if (editingId) {
    const w = vocab.find(v => v.id === editingId);
    if (w) {
      Object.assign(w, data);
      showToast('"' + en + '" yangilandi', 'success');
    }
  } else {
    const existing = vocab.find(v => v.en.toLowerCase() === data.en);
    if (existing) {
      if (!confirm('"' + en + '" so\'zi allaqachon bor (id: ' + existing.id + '). Baribir qo\'shilsinmi?')) return;
    }
    data.id = generateId(data.en);
    vocab.push(data);
    showToast('"' + en + '" qo\'shildi', 'success');
  }

  saveToStorage();
  buildTopicsList();
  render();
  closeAddModal();
}

function generateId(en) {
  const m1 = en.toLowerCase().match(/[a-z]/);
  const firstChar = m1 ? m1[0] : 'x';
  const sameLetterIds = vocab
    .map(w => w.id)
    .filter(id => id && id.startsWith(firstChar))
    .map(id => {
      const m = id.match(/^[a-z](\d+)$/);
      return m ? parseInt(m[1]) : 0;
    });
  const maxNum = sameLetterIds.length > 0 ? Math.max.apply(null, sameLetterIds) : 0;
  const nextNum = String(maxNum + 1).padStart(3, '0');
  return firstChar + nextNum;
}

function openBulkAddModal() {
  document.getElementById('bulk-text').value = '';
  document.getElementById('bulk-status').value = 'todo';
  document.getElementById('bulk-modal').classList.add('show');
}
function closeBulkAddModal() {
  document.getElementById('bulk-modal').classList.remove('show');
}

function processBulkAdd() {
  const text = document.getElementById('bulk-text').value.trim();
  const defaultStatus = document.getElementById('bulk-status').value;
  if (!text) { showToast("Matn bo'sh", 'error'); return; }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let added = 0, skipped = 0, errors = [];

  for (const line of lines) {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length < 2) { skipped++; errors.push('Format: "' + line + '"'); continue; }
    const en = parts[0].toLowerCase();
    if (!en) { skipped++; continue; }
    const uz = parts[1].split(',').map(s => s.trim()).filter(Boolean);
    if (uz.length === 0) { skipped++; errors.push('Tarjima yo\'q: "' + line + '"'); continue; }
    if (vocab.find(v => v.en.toLowerCase() === en)) { skipped++; continue; }

    const data = {
      id: generateId(en),
      en: en,
      uz: uz,
      level: parts[2] || 'A1',
      topic: parts[3] || 'common',
      pos: '',
      phon: '',
      example_en: parts[4] || '',
      example_uz: parts[5] || '',
      status: defaultStatus
    };
    vocab.push(data);
    added++;
  }

  saveToStorage();
  buildTopicsList();
  render();
  closeBulkAddModal();

  let msg = added + " ta so'z qo'shildi";
  if (skipped > 0) msg += ', ' + skipped + ' o\'tkazib yuborildi';
  showToast(msg, added > 0 ? 'success' : 'error');
  if (errors.length > 0 && errors.length <= 5) {
    setTimeout(() => alert("Xatoliklar:\n\n" + errors.join('\n')), 500);
  }
}

let toastTimer = null;
function showToast(msg, type) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show' + (type ? ' ' + type : '');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.show').forEach(m => m.classList.remove('show'));
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    exportJSON();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    openAddModal();
  }
});

document.querySelectorAll('.modal-backdrop').forEach(m => {
  m.addEventListener('click', (e) => {
    if (e.target === m) m.classList.remove('show');
  });
});

init();
