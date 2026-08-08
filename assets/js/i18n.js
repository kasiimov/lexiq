// Языки интерфейса: узбекский, русский, английский.
//
// Ключ словаря — узбекская строка. Так разметка остаётся читаемой без
// словаря под рукой: в HTML стоит настоящий текст, а data-t помечает, что
// его нужно перевести. Если перевода нет, показывается ключ — то есть
// узбекский, а не пустое место и не «missing.key».
//
// Язык интерфейса переключается без перезагрузки и запоминается. Он же
// уезжает в запросы к ИИ: объяснение должно приходить на языке, который
// человек выбрал, иначе смысл переключателя теряется.

(function (global) {
  const LANGS = [
    { id: 'uz', label: "O'zbekcha", short: 'UZ' },
    { id: 'ru', label: 'Русский',   short: 'RU' },
    { id: 'en', label: 'English',   short: 'EN' },
  ];

  const DICT = {
    ru: {
      // меню
      "Bosh sahifa": "Главная",
      "Mashq": "Практика",
      "Kun topshirig'i": "Задание дня",
      "Xarita": "Карта",
      "Sun'iy intellekt": "Искусственный интеллект",
      "AI dars va test": "ИИ: урок и тест",
      "AI ustoz": "ИИ-наставник",
      "Yozish": "Письмо",
      "O'qish": "Чтение",
      "Yangi so'zlar": "Новые слова",
      "Natijalar": "Результаты",
      "Statistika": "Статистика",
      "Profil": "Профиль",
      "Menyuni yig'ish": "Свернуть меню",
      "Menyuni ochish": "Развернуть меню",
      // шапка и общее
      "kun": "дн.",
      "Chiqish": "Выйти",
      "Orqaga": "Назад",
      "Qaytish": "Вернуться",
      "Boshqa mavzu": "Другая тема",
      "Davom etish": "Продолжить",
      "Keyingi": "Дальше",
      "Boshlash": "Начать",
      "Tekshirish": "Проверить",
      "Yakunlash": "Завершить",
      "Daraja": "Уровень",
      "Mavzu tanlang": "Выберите тему",
      "Hammasi": "Все",
      // главная
      "Sizning darajangiz": "Ваш уровень",
      "Kunlik maqsad": "Дневная цель",
      "Kun": "Дн.",
      "So'z": "Слов",
      "Bugun": "Сегодня",
      "rekord": "рекорд",
      "Bugungi 10 ta so'z": "10 слов на сегодня",
      "Bajarilmagan": "Не выполнено",
      "Hamma uchun bir xil. Xatosiz bajaring va rekordni yangilang.":
        "Одинаковое для всех. Пройдите без ошибок и обновите рекорд.",
      "Bugun mashq qiling — seriya boshlanadi": "Позанимайтесь сегодня — серия начнётся",
      "Batafsil natijalar": "Подробные результаты",
      "Savol bering": "Задайте вопрос",
      "Yo'lingiz": "Ваш путь",
      "Matn va tekshiruv": "Текст и проверка",
      "Matn va savollar": "Текст и вопросы",
      "Dars va test": "Урок и тест",
      "AI mashq": "ИИ-практика",
      // вход
      "Kirish": "Войти",
      "Ro'yxatdan o'tish": "Регистрация",
      "Qaytganingizdan xursandmiz": "Рады, что вы вернулись",
      "Ro'yxatdan o'ting": "Зарегистрируйтесь",
      "Email": "Email",
      "Parol": "Пароль",
      "Ismingiz": "Ваше имя",
      "Google bilan kirish": "Войти через Google",
      "Mehmon sifatida davom etish": "Продолжить как гость",
      "yoki": "или",
      "Mehmon rejimida natijalar faqat shu qurilmada saqlanadi.":
        "В гостевом режиме результаты сохраняются только на этом устройстве.",
      "Kuniga 10 daqiqa — va so'zlar esda qoladi":
        "10 минут в день — и слова остаются в памяти",
      // профиль
      "Mehmon rejimi": "Гостевой режим",
      "Hisob faol": "Аккаунт активен",
      "O'rganilgan so'z": "Выучено слов",
      "Seriya": "Серия",
      "Rekord seriya": "Рекорд серии",
      "Batafsil statistika": "Подробная статистика",
      "Chiqasizmi?": "Выйти?",
      "Bekor qilish": "Отмена",
      "Ha, chiqish": "Да, выйти",
    },
    en: {
      "Bosh sahifa": "Home",
      "Mashq": "Practice",
      "Kun topshirig'i": "Daily task",
      "Xarita": "Map",
      "Sun'iy intellekt": "Artificial intelligence",
      "AI dars va test": "AI lesson & test",
      "AI ustoz": "AI tutor",
      "Yozish": "Writing",
      "O'qish": "Reading",
      "Yangi so'zlar": "New words",
      "Natijalar": "Results",
      "Statistika": "Statistics",
      "Profil": "Profile",
      "Menyuni yig'ish": "Collapse menu",
      "Menyuni ochish": "Expand menu",
      "kun": "days",
      "Chiqish": "Sign out",
      "Orqaga": "Back",
      "Qaytish": "Back",
      "Boshqa mavzu": "Another topic",
      "Davom etish": "Continue",
      "Keyingi": "Next",
      "Boshlash": "Start",
      "Tekshirish": "Check",
      "Yakunlash": "Finish",
      "Daraja": "Level",
      "Mavzu tanlang": "Choose a topic",
      "Hammasi": "All",
      "Sizning darajangiz": "Your level",
      "Kunlik maqsad": "Daily goal",
      "Kun": "Days",
      "So'z": "Words",
      "Bugun": "Today",
      "rekord": "record",
      "Bugungi 10 ta so'z": "Today's 10 words",
      "Bajarilmagan": "Not done",
      "Hamma uchun bir xil. Xatosiz bajaring va rekordni yangilang.":
        "The same for everyone. Finish without mistakes and beat the record.",
      "Bugun mashq qiling — seriya boshlanadi": "Practise today — your streak begins",
      "Batafsil natijalar": "Detailed results",
      "Savol bering": "Ask a question",
      "Yo'lingiz": "Your path",
      "Matn va tekshiruv": "Text and feedback",
      "Matn va savollar": "Text and questions",
      "Dars va test": "Lesson and test",
      "AI mashq": "AI practice",
      "Kirish": "Sign in",
      "Ro'yxatdan o'tish": "Sign up",
      "Qaytganingizdan xursandmiz": "Good to see you again",
      "Ro'yxatdan o'ting": "Create an account",
      "Email": "Email",
      "Parol": "Password",
      "Ismingiz": "Your name",
      "Google bilan kirish": "Continue with Google",
      "Mehmon sifatida davom etish": "Continue as a guest",
      "yoki": "or",
      "Mehmon rejimida natijalar faqat shu qurilmada saqlanadi.":
        "In guest mode results are kept on this device only.",
      "Kuniga 10 daqiqa — va so'zlar esda qoladi":
        "Ten minutes a day — and the words stay with you",
      "Mehmon rejimi": "Guest mode",
      "Hisob faol": "Account active",
      "O'rganilgan so'z": "Words learned",
      "Seriya": "Streak",
      "Rekord seriya": "Best streak",
      "Batafsil statistika": "Detailed statistics",
      "Chiqasizmi?": "Sign out?",
      "Bekor qilish": "Cancel",
      "Ha, chiqish": "Yes, sign out",
    },
  };

  const KEY = 'lexiq_lang';
  let current = 'uz';

  try {
    const saved = localStorage.getItem(KEY);
    if (saved && (saved === 'uz' || DICT[saved])) current = saved;
  } catch (e) {}

  function t(key) {
    if (current === 'uz') return key;
    const table = DICT[current];
    return (table && table[key]) || key;
  }

  // Проходит по разметке и подставляет перевод. Оригинал сохраняется в
  // data-t при первом вызове, иначе после первого переключения ключ был бы
  // потерян и обратно на узбекский вернуть было бы нечего.
  function applyLang(root) {
    (root || document).querySelectorAll('[data-t]').forEach(function (el) {
      const key = el.dataset.t || el.textContent.trim();
      el.dataset.t = key;
      el.textContent = t(key);
    });
    (root || document).querySelectorAll('[data-t-title]').forEach(function (el) {
      const key = el.dataset.tTitle;
      el.setAttribute('title', t(key));
      if (el.hasAttribute('aria-label')) el.setAttribute('aria-label', t(key));
    });
    (root || document).querySelectorAll('[data-t-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.dataset.tPh));
    });
  }

  function setLang(id) {
    if (id !== 'uz' && !DICT[id]) return;
    current = id;
    try { localStorage.setItem(KEY, id); } catch (e) {}
    document.documentElement.lang = id;
    applyLang();
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.classList.toggle('on', b.dataset.lang === id);
    });
    // Экраны, которые рисует JS, перерисовываем сами
    if (typeof global.renderShell === 'function') {
      const active = document.querySelector('.screen.active');
      if (active) global.renderShell(active.id);
    }
  }

  function lang() { return current; }

  global.t = t;
  global.setLang = setLang;
  global.lang = lang;
  global.applyLang = applyLang;
  global.LANGS = LANGS;

  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.lang = current;
    applyLang();
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.classList.toggle('on', b.dataset.lang === current);
    });
  });
})(window);
