/* ============================================================
   Congix English — конфигурация Firebase (вход и регистрация).

   Как включить настоящие аккаунты:
   1. console.firebase.google.com → Add project → назовите «congix-english»
   2. Build → Authentication → Sign-in method → включите
      «Email/Password» и «Google»
   3. ⚙️ Project settings → Your apps → </> Web → зарегистрируйте
      приложение «Congix English Web» и скопируйте объект firebaseConfig сюда
   4. Сохраните этот файл как assets/js/firebase-config.js
      (он в .gitignore — в репозиторий не попадёт)
   5. Authentication → Settings → Authorized domains → добавьте
      congix-english.netlify.app

   Пока файла нет, приложение работает в режиме «Mehmon»:
   профиль хранится в браузере, регистрация скрыта.

   Ключи ИИ (GEMINI_API_KEY, GROQ_API_KEY) сюда НЕ добавляются —
   они живут только в переменных окружения Netlify и читаются
   edge-функциями на сервере.
   ============================================================ */

const FIREBASE_CONFIG = {
  apiKey:            "SIZNING_API_KEY",
  authDomain:        "SIZNING_PROJECT.firebaseapp.com",
  projectId:         "SIZNING_PROJECT",
  storageBucket:     "SIZNING_PROJECT.appspot.com",
  messagingSenderId: "SIZNING_SENDER_ID",
  appId:             "SIZNING_APP_ID"
};
