// Congix English — панель пользователей.
//
// Данные приходят одним запросом к /api/admin/users. В Firestore напрямую
// отсюда не ходим: правила базы намеренно не дают читать чужие профили, и
// ослаблять их ради админки нельзя — тогда список учеников достался бы
// любому, кто вошёл в приложение. Всё чтение делает edge-функция, которая
// представляется сервисным аккаунтом и проверяет ту же куку, что и страница.

let allUsers = [];
let orphanCount = 0;
let activityFilter = 'all';

const DAY = 86400000;

// ── Форматирование ──────────────────────────────────────────────────

function fmtDate(ms) {
  if (!ms) return '—';
  const d = new Date(ms);
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// «2 kun oldin» полезнее точной даты: по нему сразу видно, кто отвалился.
function fmtAgo(ms) {
  if (!ms) return 'hech qachon';
  const diff = Date.now() - ms;
  if (diff < 0) return 'hozir';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'hozir';
  if (mins < 60) return mins + ' daqiqa oldin';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + ' soat oldin';
  const days = Math.floor(hours / 24);
  if (days < 30) return days + ' kun oldin';
  const months = Math.floor(days / 30);
  if (months < 12) return months + ' oy oldin';
  return Math.floor(months / 12) + ' yil oldin';
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Группа активности задаёт и точку в строке, и фильтр — считаем в одном месте,
// чтобы фильтр не разошёлся с цветом.
function activityOf(user) {
  if (!user.lastLoginAt) return 'never';
  const age = Date.now() - user.lastLoginAt;
  if (age < DAY) return 'today';
  if (age < 7 * DAY) return 'week';
  return 'idle';
}

const ACTIVITY_LABEL = {
  today: 'Bugun faol',
  week: 'Shu hafta',
  idle: 'Nofaol',
  never: 'Kirmagan',
};

function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2600);
}

// ── Загрузка ────────────────────────────────────────────────────────

async function loadUsers() {
  const container = document.getElementById('users-container');
  container.innerHTML = '<div class="empty-state">Yuklanmoqda...</div>';

  let res;
  try {
    res = await fetch('/api/admin/users', { credentials: 'same-origin' });
  } catch (e) {
    container.innerHTML = '<div class="empty-state">Tarmoq xatosi. Internetni tekshiring.</div>';
    return;
  }

  // Сессия живёт 12 часов и может истечь прямо на открытой вкладке.
  // Молча показать пустую таблицу — худшее, что можно сделать: выглядит так,
  // будто все ученики исчезли.
  if (res.status === 401) {
    container.innerHTML =
      '<div class="empty-state">Sessiya tugadi. <a href="/admin" style="color:var(--lime)">Qayta kiring</a></div>';
    return;
  }

  let data;
  try {
    data = await res.json();
  } catch (e) {
    container.innerHTML = '<div class="empty-state">Server javobi tushunarsiz.</div>';
    return;
  }

  if (data.error === 'not_configured') {
    renderSetupHelp();
    return;
  }
  if (!res.ok) {
    container.innerHTML =
      '<div class="empty-state">Xatolik: ' + escapeHtml(data.message || res.status) + '</div>';
    return;
  }

  allUsers = data.users || [];
  orphanCount = (data.orphans || []).length;
  renderStats();
  renderUsers();
}

// Пока сервисный ключ не заведён, показываем не «ошибку», а инструкцию:
// это единственный шаг, который нельзя сделать за владельца проекта.
function renderSetupHelp() {
  document.getElementById('stats-grid').innerHTML = '';
  document.getElementById('users-container').innerHTML = `
    <div class="setup-card">
      <h3>🔑 Firebase kaliti kerak</h3>
      <p>
        Foydalanuvchilar ro'yxatini ko'rsatish uchun server Firebase'ga
        ulanishi kerak. Bu bir martalik sozlash — 2 daqiqa vaqt oladi.
      </p>
      <ol>
        <li>Firebase Console → Project settings → <b>Service accounts</b></li>
        <li><b>Generate new private key</b> → JSON fayl yuklab olinadi</li>
        <li>Netlify → Site configuration → <b>Environment variables</b></li>
        <li>Yangi o'zgaruvchi: <code>FIREBASE_SERVICE_ACCOUNT</code> —
            qiymati sifatida JSON faylning <b>butun matnini</b> qo'ying</li>
        <li>Netlify'da saytni qayta deploy qiling</li>
      </ol>
    </div>`;
}

// ── Сводка ──────────────────────────────────────────────────────────

function renderStats() {
  const total = allUsers.length;
  const today = allUsers.filter((u) => activityOf(u) === 'today').length;
  const week = allUsers.filter((u) => ['today', 'week'].includes(activityOf(u))).length;
  const never = allUsers.filter((u) => !u.lastDayPlayed).length;
  const newWeek = allUsers.filter((u) => u.createdAt && Date.now() - u.createdAt < 7 * DAY).length;
  const words = allUsers.reduce((sum, u) => sum + (u.knownWords || 0), 0);

  const cards = [
    { v: total, l: 'JAMI', cls: 'total' },
    { v: today, l: 'BUGUN FAOL', cls: 'ok' },
    { v: week, l: '7 KUN ICHIDA', cls: 'todo' },
    { v: newWeek, l: 'YANGI (7 KUN)', cls: 'ok' },
    { v: never, l: 'BOSHLAMAGAN', cls: 'review' },
    { v: words, l: "O'RGANILGAN SO'Z", cls: 'total' },
  ];

  document.getElementById('stats-grid').innerHTML = cards.map((c) =>
    `<div class="stat-card">
       <div class="stat-v ${c.cls}">${c.v}</div>
       <div class="stat-l">${c.l}</div>
     </div>`
  ).join('');
}

// ── Таблица ─────────────────────────────────────────────────────────

function setActivityFilter(value) {
  activityFilter = value;
  document.querySelectorAll('#activity-pills .pill').forEach((pill) => {
    pill.classList.toggle('active', pill.dataset.activity === value);
  });
  renderUsers();
}

function currentList() {
  const query = document.getElementById('search-input').value.trim().toLowerCase();
  const provider = document.getElementById('provider-filter').value;
  const sortBy = document.getElementById('sort-by').value;

  const list = allUsers.filter((u) => {
    // «Boshlamagan» — это про игру, а не про вход: человек мог зарегистрироваться
    // и ни разу не сыграть, и именно таких нужно видеть отдельно.
    if (activityFilter === 'never') {
      if (u.lastDayPlayed) return false;
    } else if (activityFilter !== 'all' && activityOf(u) !== activityFilter) {
      return false;
    }
    if (provider !== 'all' && u.provider !== provider) return false;
    if (query) {
      const hay = (u.name + ' ' + u.email).toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  const sorters = {
    recent: (a, b) => (b.lastLoginAt || 0) - (a.lastLoginAt || 0),
    new: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
    words: (a, b) => b.knownWords - a.knownWords,
    streak: (a, b) => b.streakDays - a.streakDays || b.streakBest - a.streakBest,
    accuracy: (a, b) => (b.accuracy ?? -1) - (a.accuracy ?? -1),
    name: (a, b) => (a.name || a.email).localeCompare(b.name || b.email),
  };
  return list.sort(sorters[sortBy] || sorters.recent);
}

function renderUsers() {
  const list = currentList();
  const container = document.getElementById('users-container');

  const note = orphanCount
    ? `<div class="users-note">ℹ️ Yana ${orphanCount} ta progress yozuvi bor,
       lekin ularning akkaunti o'chirilgan.</div>`
    : '';

  if (!list.length) {
    container.innerHTML = note +
      '<div class="empty-state">Hech kim topilmadi. Filtrlarni o\'zgartiring.</div>';
    return;
  }

  const rows = list.map((u, i) => {
    const group = activityOf(u);
    const initial = escapeHtml((u.name || u.email || '?').trim().charAt(0).toUpperCase());
    const accuracy = u.accuracy == null
      ? '<span class="u-dim">—</span>'
      : `<div class="u-num">${u.accuracy}%</div>
         <div class="u-bar"><span class="${u.accuracy < 60 ? 'low' : ''}"
              style="width:${u.accuracy}%"></span></div>`;

    return `<tr onclick="openUserModal(${i})">
      <td>
        <div class="u-ident">
          <div class="u-avatar ${u.provider === 'google' ? 'google' : ''}">${initial}</div>
          <div>
            <div class="u-name">${escapeHtml(u.name || '—')}
              ${u.disabled ? '<span class="u-tag off">bloklangan</span>' : ''}</div>
            <div class="u-email">${escapeHtml(u.email || '—')}</div>
          </div>
        </div>
      </td>
      <td><span class="u-tag ${u.provider === 'google' ? 'google' : ''}">
        ${u.provider === 'google' ? 'Google' : 'Email'}</span></td>
      <td>
        <span class="u-dot ${group}"></span>${fmtAgo(u.lastLoginAt)}
        <div class="u-sub">${ACTIVITY_LABEL[group]}</div>
      </td>
      <td><div class="u-num">${u.knownWords}</div><div class="u-sub">so'z</div></td>
      <td>${accuracy}</td>
      <td><div class="u-num">${u.streakDays}</div>
          <div class="u-sub">eng uzun ${u.streakBest}</div></td>
      <td><div class="u-num">${u.sessionsPlayed}</div><div class="u-sub">sessiya</div></td>
      <td class="u-dim">${fmtDate(u.createdAt)}</td>
    </tr>`;
  }).join('');

  // Индекс строки указывает в отфильтрованный список, поэтому модалка читает
  // из него же — иначе после сортировки открывался бы не тот человек.
  window.__visibleUsers = list;

  container.innerHTML = note + `
    <div class="users-table-wrap">
      <table class="users-table">
        <thead><tr>
          <th>Foydalanuvchi</th><th>Usul</th><th>Oxirgi kirish</th>
          <th>So'z</th><th>Aniqlik</th><th>Streak</th><th>Sessiya</th><th>Ro'yxatdan</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ── Карточка ученика ────────────────────────────────────────────────

function openUserModal(index) {
  const u = (window.__visibleUsers || [])[index];
  if (!u) return;

  document.getElementById('user-modal-title').textContent = u.name || u.email || 'Foydalanuvchi';
  document.getElementById('user-modal-body').innerHTML = `
    <div class="detail-grid">
      <div class="detail-cell"><div class="k">SO'Z</div><div class="v">${u.knownWords}</div></div>
      <div class="detail-cell"><div class="k">ANIQLIK</div>
        <div class="v">${u.accuracy == null ? '—' : u.accuracy + '%'}</div></div>
      <div class="detail-cell"><div class="k">STREAK</div><div class="v">${u.streakDays}</div></div>
      <div class="detail-cell"><div class="k">SESSIYA</div><div class="v">${u.sessionsPlayed}</div></div>
    </div>
    <div class="detail-row"><span class="k">Email</span>
      <span class="v">${escapeHtml(u.email || '—')}</span></div>
    <div class="detail-row"><span class="k">Kirish usuli</span>
      <span class="v">${u.provider === 'google' ? 'Google' : 'Email / parol'}</span></div>
    <div class="detail-row"><span class="k">Ro'yxatdan o'tgan</span>
      <span class="v">${fmtDate(u.createdAt)}</span></div>
    <div class="detail-row"><span class="k">Oxirgi kirish</span>
      <span class="v">${fmtDate(u.lastLoginAt)} (${fmtAgo(u.lastLoginAt)})</span></div>
    <div class="detail-row"><span class="k">Oxirgi o'yin kuni</span>
      <span class="v">${escapeHtml(u.lastDayPlayed || '—')}</span></div>
    <div class="detail-row"><span class="k">To'g'ri / xato javob</span>
      <span class="v">${u.totalCorrect} / ${u.totalWrong}</span></div>
    <div class="detail-row"><span class="k">Eng uzun streak</span>
      <span class="v">${u.streakBest} kun</span></div>
    <div class="detail-row"><span class="k">Holat</span>
      <span class="v">${u.disabled ? 'Bloklangan' : 'Faol'}</span></div>
    <div class="detail-row"><span class="k">UID</span>
      <span class="v">${escapeHtml(u.uid)}</span></div>`;

  document.getElementById('user-modal').classList.add('show');
}

function closeUserModal() {
  document.getElementById('user-modal').classList.remove('show');
}

// ── Экспорт ─────────────────────────────────────────────────────────

function exportUsersCSV() {
  const list = currentList();
  if (!list.length) { toast('Eksport uchun ma\'lumot yo\'q'); return; }

  const head = ['Ism', 'Email', 'Usul', "Ro'yxatdan", 'Oxirgi kirish',
                "So'z", 'Aniqlik %', 'Streak', 'Eng uzun streak',
                "To'g'ri", 'Xato', 'Sessiya', 'UID'];

  // Ячейку экранируем всегда: имена и почта вполне могут содержать запятую,
  // и один такой ученик сдвинул бы все колонки в файле.
  const cell = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';

  const rows = list.map((u) => [
    u.name, u.email, u.provider === 'google' ? 'Google' : 'Email',
    fmtDate(u.createdAt), fmtDate(u.lastLoginAt),
    u.knownWords, u.accuracy == null ? '' : u.accuracy,
    u.streakDays, u.streakBest, u.totalCorrect, u.totalWrong,
    u.sessionsPlayed, u.uid,
  ].map(cell).join(','));

  // BOM — чтобы Excel открыл узбекские буквы как UTF-8, а не как кракозябры.
  const blob = new Blob(['﻿' + [head.map(cell).join(','), ...rows].join('\r\n')],
                        { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'congix-users-' + new Date().toISOString().slice(0, 10) + '.csv';
  link.click();
  URL.revokeObjectURL(link.href);
  toast(list.length + ' ta foydalanuvchi eksport qilindi');
}

document.getElementById('user-modal').addEventListener('click', (e) => {
  if (e.target.id === 'user-modal') closeUserModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeUserModal();
});

loadUsers();
