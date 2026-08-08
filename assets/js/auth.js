// Congix English — вход в приложение.
//
// Два режима, выбираются автоматически:
//   1. Firebase — если рядом лежит firebase-config.js с заполненными ключами.
//      Тогда работают регистрация по почте, вход и вход через Google, и
//      аккаунт виден с любого устройства.
//   2. Мехмон (гость) — если конфига нет. Профиль хранится в localStorage
//      этого браузера. Приложение остаётся полностью рабочим: прогресс,
//      игры и ИИ ничего не знают про учётные записи.
//
// Наружу отдаётся один объект CongixAuth, чтобы app.js не зависел от того,
// какой режим включён.

const AUTH_STORAGE_KEY = 'congix_user';

const CongixAuth = (function () {
  let user = null;                  // { name, email, uid, guest }
  let listeners = [];
  let firebaseReady = false;
  let auth = null;

  function notify() {
    listeners.forEach((fn) => {
      try { fn(user); } catch (e) { console.warn('auth listener fail', e); }
    });
  }

  function saveLocal(u) {
    try {
      if (u) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      // Приватный режим браузера может запрещать запись — не повод падать.
    }
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function fromFirebase(fbUser) {
    if (!fbUser) return null;
    return {
      uid: fbUser.uid,
      email: fbUser.email || '',
      name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Talaba'),
      guest: false,
    };
  }

  // Сообщения Firebase английские и техничные — переводим в человеческие узбекские.
  function humanError(e) {
    const code = (e && e.code) || '';
    const map = {
      'auth/invalid-email': "Email noto'g'ri yozilgan",
      'auth/user-not-found': 'Bunday foydalanuvchi topilmadi',
      'auth/wrong-password': "Parol noto'g'ri",
      'auth/invalid-credential': "Email yoki parol noto'g'ri",
      'auth/email-already-in-use': "Bu email allaqachon ro'yxatdan o'tgan",
      'auth/weak-password': "Parol juda qisqa — kamida 6 ta belgi kerak",
      'auth/too-many-requests': "Juda ko'p urinish. Biroz kuting",
      'auth/popup-closed-by-user': 'Oyna yopildi',
      'auth/network-request-failed': 'Internet bilan aloqa yo\'q',
    };
    return map[code] || (e && e.message) || 'Xatolik yuz berdi';
  }

  function init() {
    const configured =
      typeof FIREBASE_CONFIG !== 'undefined' &&
      FIREBASE_CONFIG &&
      FIREBASE_CONFIG.apiKey &&
      FIREBASE_CONFIG.apiKey.indexOf('SIZNING') === -1;

    if (configured && typeof firebase !== 'undefined') {
      try {
        firebase.initializeApp(FIREBASE_CONFIG);
        auth = firebase.auth();
        firebaseReady = true;
        auth.onAuthStateChanged((fbUser) => {
          // Гостевой профиль не трогаем: он живёт, пока в Firebase никого нет.
          if (fbUser) {
            user = fromFirebase(fbUser);
            saveLocal(user);
          } else {
            const local = loadLocal();
            user = local && local.guest ? local : null;
          }
          notify();
        });
        return;
      } catch (e) {
        console.warn('Firebase init fail, mehmon rejimi', e);
        firebaseReady = false;
      }
    }

    user = loadLocal();
    notify();
  }

  return {
    init,
    isFirebase: () => firebaseReady,
    current: () => user,

    onChange(fn) {
      listeners.push(fn);
      if (user !== null) fn(user);
    },

    async signUp(name, email, password) {
      if (!firebaseReady) throw new Error("Ro'yxatdan o'tish hozir ishlamayapti");
      try {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        if (name) await cred.user.updateProfile({ displayName: name });
        user = fromFirebase(auth.currentUser);
        saveLocal(user);
        notify();
        return user;
      } catch (e) {
        throw new Error(humanError(e));
      }
    },

    async signIn(email, password) {
      if (!firebaseReady) throw new Error('Kirish hozir ishlamayapti');
      try {
        await auth.signInWithEmailAndPassword(email, password);
        return user;
      } catch (e) {
        throw new Error(humanError(e));
      }
    },

    async signInGoogle() {
      if (!firebaseReady) throw new Error('Google orqali kirish hozir ishlamayapti');
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        return user;
      } catch (e) {
        throw new Error(humanError(e));
      }
    },

    // Гость — полноценный вход, только без сервера: профиль лежит в браузере.
    continueAsGuest(name) {
      user = {
        uid: 'guest-' + Math.random().toString(36).slice(2, 10),
        email: '',
        name: (name || '').trim() || 'Mehmon',
        guest: true,
      };
      saveLocal(user);
      notify();
      return user;
    },

    async signOut() {
      if (firebaseReady && auth.currentUser) {
        try { await auth.signOut(); } catch (e) { console.warn('signOut fail', e); }
      }
      user = null;
      saveLocal(null);
      notify();
    },
  };
})();
