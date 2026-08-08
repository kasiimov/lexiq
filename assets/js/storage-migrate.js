// Congix English — перенос старых ключей localStorage.
//
// Данные лежали под именами времён LexiQ: lexiq_* и lx_*. Просто переименовать
// ключи в коде было нельзя — у всех, кто уже занимался, браузер продолжил бы
// хранить прогресс под старым именем, а приложение искало бы под новым. Со
// стороны это выглядит как «сайт стёр мой словарь и streak».
//
// Поэтому при первой загрузке новой версии значения переезжают под новые
// имена. Скрипт обязан идти первым в <head>: инлайн-код в app.html читает
// состояние меню ещё до отрисовки, и к тому моменту ключ уже должен быть новым.

(function () {
  var RENAMES = {
    // Профиль и вход
    lexiq_user: 'congix_user',
    // Прогресс обучения: коробки Лейтнера и статистика ответов —
    // самое ценное, что здесь есть.
    lx_srs: 'congix_srs',
    lx_stats: 'congix_stats',
    lexiq_streak_best: 'congix_streak_best',
    lexiq_daily: 'congix_daily',
    // Словарь и интерфейс
    lexiq_vocab: 'congix_vocab',
    lexiq_lang: 'congix_lang',
    lexiq_side_collapsed: 'congix_side_collapsed',
    // История переписки с ИИ
    lexiq_tutor_history: 'congix_tutor_history',
    lexiq_talk_history: 'congix_talk_history',
    // Словарь в админке
    lexiq_admin_vocab: 'congix_admin_vocab'
  };

  var FLAG = 'congix_storage_migrated';

  try {
    if (localStorage.getItem(FLAG) === '1') return;

    for (var oldKey in RENAMES) {
      if (!Object.prototype.hasOwnProperty.call(RENAMES, oldKey)) continue;

      var newKey = RENAMES[oldKey];
      var oldValue = localStorage.getItem(oldKey);
      if (oldValue === null) continue;

      // Если под новым именем уже что-то есть, оно свежее: человек успел
      // позаниматься на обновлённой версии. Затирать его старой копией нельзя.
      if (localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, oldValue);
      }
      localStorage.removeItem(oldKey);
    }

    localStorage.setItem(FLAG, '1');
  } catch (e) {
    // Приватный режим браузера запрещает запись. Это не повод ронять страницу:
    // без переноса приложение просто начнёт с чистого листа.
  }
})();
