/* Конфигурация Firebase проекта LexiQ.

   Эти значения НЕ секретные: Firebase отдаёт их каждому браузеру, который
   открывает сайт, поэтому они лежат в репозитории и в них нет смысла прятать.
   Доступ к данным ограничивают правила Firestore (firestore.rules), а не эти
   ключи. Настоящие секреты — GEMINI_API_KEY и GROQ_API_KEY — живут только в
   переменных окружения Netlify и читаются edge-функциями на сервере. */

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDifkYaIufU8k8rr5p0nJPSgB5WobGJMio",
  authDomain:        "lexiq-57ac4.firebaseapp.com",
  projectId:         "lexiq-57ac4",
  storageBucket:     "lexiq-57ac4.firebasestorage.app",
  messagingSenderId: "135027998167",
  appId:             "1:135027998167:web:2553eae4772734f8bb9f92"
};
