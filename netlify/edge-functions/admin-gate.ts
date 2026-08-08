// Congix English — вход в админку.
//
// Проверка пароля живёт на сервере намеренно. Если сравнивать пароль в
// admin.js, он уезжает в браузер вместе со скриптом: «Просмотр кода» — и
// пароль виден любому. Здесь пароль остаётся в переменных окружения Netlify,
// а в браузер уходит только подписанная кука сессии.
//
// Переменные окружения сайта:
//   ADMIN_EMAIL           — почта администратора
//   ADMIN_PASSWORD        — пароль
//   ADMIN_SESSION_SECRET  — случайная строка, которой подписывается кука
//
// Пока переменные не заданы, дверь закрыта: пустой пароль не должен
// открывать панель, поэтому проверка падает в отказ, а не пропускает.

import type { Context } from "https://edge.netlify.com/";
import {
  COOKIE,
  issueToken,
  readCookie,
  secretsMatch,
  SESSION_SECONDS,
  tokenIsValid,
} from "./lib/admin-session.ts";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Страница входа отдаётся самой функцией, а не лежит отдельным файлом:
// статический login.html пришлось бы отдавать всем, и он стал бы ещё одной
// дверью, которую нужно стеречь. Скриптов здесь нет вовсе — обычная форма.
//
// Палитра и шрифты берутся из site.css, а не переписываются здесь своими
// значениями: иначе дверь в Congix выглядит дверью в чужой дом, и при смене
// фирменных цветов эта страница осталась бы старой.
function loginPage(message: string, status: number): Response {
  const alert = message
    ? `<p class="alert">${escapeHtml(message)}</p>`
    : "";

  return new Response(
    `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Congix English Admin — Kirish</title>
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/site.css?v=6">
<style>
  body {
    min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:var(--ink); padding:24px;
  }
  .login-card {
    width:100%; max-width:400px;
    background:var(--surface); border:1px solid var(--line);
    border-radius:20px; padding:36px 32px;
  }
  .login-brand { display:flex; align-items:center; gap:12px; margin-bottom:28px; }
  .login-title { font-family:var(--font-display); font-weight:600; font-size:24px;
    letter-spacing:-0.02em; margin:0 0 6px; }
  .login-sub { color:var(--muted); font-size:15px; margin:0 0 28px; }
  .login-field { margin-bottom:18px; }
  .login-field label {
    display:block; font-size:13px; font-weight:500; color:var(--muted); margin-bottom:7px;
  }
  .login-field input {
    width:100%; padding:13px 15px; font:inherit; font-size:15px;
    background:var(--ink); color:var(--cream);
    border:1px solid var(--line); border-radius:12px;
    transition:border-color .15s;
  }
  .login-field input:focus { outline:none; border-color:var(--lime); }
  .login-card .btn { width:100%; margin-top:6px; }
  .alert {
    background:var(--surface-2); border:1px solid var(--clay); color:var(--clay);
    padding:12px 15px; border-radius:12px; font-size:14px; margin:0 0 20px;
  }
  .login-back {
    display:block; margin-top:24px; text-align:center;
    color:var(--faint); font-size:14px; transition:color .15s;
  }
  .login-back:hover { color:var(--cream); }
</style>
</head>
<body>
  <form class="login-card" method="POST" action="/admin.html">
    <div class="login-brand">
      <span class="brand-mark">C</span>
      <span class="brand-name">Congix English</span>
    </div>
    <h1 class="login-title">Admin paneli</h1>
    <p class="login-sub">Davom etish uchun tizimga kiring</p>
    ${alert}
    <div class="login-field">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" autocomplete="username" required autofocus>
    </div>
    <div class="login-field">
      <label for="password">Parol</label>
      <input type="password" id="password" name="password" autocomplete="current-password" required>
    </div>
    <button class="btn btn-primary" type="submit">Kirish</button>
    <a class="login-back" href="/">&larr; Saytga qaytish</a>
  </form>
</body>
</html>`,
    {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        // Форма входа не должна оседать ни в браузере, ни на CDN: иначе
        // следующий человек за этим компьютером получит её из кэша уже
        // «пройденной», вместе с чужой сессией.
        "cache-control": "no-store, private",
        "x-robots-tag": "noindex, nofollow",
      },
    },
  );
}

export default async function handler(request: Request, context: Context): Promise<Response> {
  const url = new URL(request.url);
  const secret = Deno.env.get("ADMIN_SESSION_SECRET") ?? "";
  const email = Deno.env.get("ADMIN_EMAIL") ?? "";
  const password = Deno.env.get("ADMIN_PASSWORD") ?? "";

  // Выход: кука гасится сроком в прошлом, сервер её больше не увидит.
  if (url.pathname === "/admin/logout") {
    return new Response(null, {
      status: 303,
      headers: {
        location: "/admin.html",
        "set-cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }

  if (!secret || !email || !password) {
    return loginPage(
      "Server sozlanmagan: ADMIN_EMAIL, ADMIN_PASSWORD va ADMIN_SESSION_SECRET kiritilmagan.",
      503,
    );
  }

  if (request.method === "POST") {
    const form = await request.formData();
    const givenEmail = String(form.get("email") ?? "").trim().toLowerCase();
    const givenPassword = String(form.get("password") ?? "");

    const [emailOk, passwordOk] = await Promise.all([
      secretsMatch(secret, email.trim().toLowerCase(), givenEmail),
      secretsMatch(secret, password, givenPassword),
    ]);

    // Что именно не сошлось — не сообщаем: иначе форма превращается в
    // справочник существующих логинов.
    if (!emailOk || !passwordOk) {
      return loginPage("Email yoki parol noto'g'ri.", 401);
    }

    const token = await issueToken(secret, givenEmail);
    return new Response(null, {
      status: 303,
      headers: {
        location: "/admin.html",
        "set-cookie":
          `${COOKIE}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }

  const token = readCookie(request, COOKIE);
  if (!token || !(await tokenIsValid(secret, token))) {
    return loginPage("", 200);
  }

  // Короткий адрес /admin отдаёт ту же страницу без редиректа, чтобы в адресной
  // строке не мелькало «.html».
  const response = url.pathname === "/admin"
    ? await context.rewrite("/admin.html")
    : await context.next();

  // Панель за паролем не должна лежать в общем кэше CDN.
  response.headers.set("cache-control", "no-store, private");
  response.headers.set("x-robots-tag", "noindex, nofollow");
  return response;
}

export const config = {
  path: ["/admin", "/admin.html", "/admin-words.html", "/admin/logout"],
};
