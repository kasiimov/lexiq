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

const COOKIE = "congix_admin";

// Двенадцать часов: рабочий день правки словаря укладывается в одну сессию,
// а забытая открытой вкладка к утру всё равно попросит пароль заново.
const SESSION_SECONDS = 12 * 60 * 60;

const encoder = new TextEncoder();

function base64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

async function hmac(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return new Uint8Array(signature);
}

// Сравнение за постоянное время: обычное === выходит на первом несовпавшем
// байте, и по времени ответа пароль можно подбирать посимвольно.
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// Сами секреты тоже сравниваем не напрямую, а по их HMAC: длина введённого
// пароля тогда ничего не выдаёт, потому что дайджест всегда 32 байта.
async function secretsMatch(secret: string, expected: string, given: string): Promise<boolean> {
  if (!expected) return false;
  const [left, right] = await Promise.all([hmac(secret, expected), hmac(secret, given)]);
  return timingSafeEqual(left, right);
}

async function issueToken(secret: string, email: string): Promise<string> {
  const payload = `${email}|${Math.floor(Date.now() / 1000) + SESSION_SECONDS}`;
  const signature = await hmac(secret, payload);
  return `${base64urlEncode(encoder.encode(payload))}.${base64urlEncode(signature)}`;
}

async function tokenIsValid(secret: string, token: string): Promise<boolean> {
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) return false;

  const payloadBytes = base64urlDecode(payloadPart);
  const givenSignature = base64urlDecode(signaturePart);
  if (!payloadBytes || !givenSignature) return false;

  const payload = new TextDecoder().decode(payloadBytes);
  const expected = await hmac(secret, payload);
  if (!timingSafeEqual(expected, givenSignature)) return false;

  const expiresAt = Number(payload.split("|")[1]);
  return Number.isFinite(expiresAt) && expiresAt > Math.floor(Date.now() / 1000);
}

function readCookie(request: Request, name: string): string {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return "";
}

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
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #1C1A18; color: #F2EFEA; padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  .card {
    width: 100%; max-width: 380px; background: #2A2724; border: 1px solid #3A3632;
    border-radius: 16px; padding: 32px 28px;
  }
  .mark {
    width: 44px; height: 44px; border-radius: 12px; background: #F0EADF; color: #1C1A18;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; font-weight: 700; margin-bottom: 18px;
  }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { margin: 0 0 24px; color: #9C948A; font-size: 14px; }
  label { display: block; font-size: 13px; color: #9C948A; margin-bottom: 6px; }
  input {
    width: 100%; padding: 11px 13px; margin-bottom: 16px; font-size: 15px;
    background: #211E1B; color: #F2EFEA; border: 1px solid #3A3632; border-radius: 9px;
  }
  input:focus { outline: none; border-color: #6FD3C7; }
  button {
    width: 100%; padding: 12px; font-size: 15px; font-weight: 600; cursor: pointer;
    background: #F0EADF; color: #1C1A18; border: 0; border-radius: 9px;
  }
  button:hover { background: #fff; }
  .alert {
    background: #3A2422; border: 1px solid #7A3B33; color: #F3B8AF;
    padding: 10px 13px; border-radius: 9px; font-size: 14px; margin: 0 0 18px;
  }
  .back { display: block; margin-top: 20px; text-align: center; color: #9C948A; font-size: 13px; }
</style>
</head>
<body>
  <form class="card" method="POST" action="/admin.html">
    <div class="mark">C</div>
    <h1>Admin paneli</h1>
    <p class="sub">Lug'atni tahrirlash uchun kiring</p>
    ${alert}
    <label for="email">Email</label>
    <input type="email" id="email" name="email" autocomplete="username" required autofocus>
    <label for="password">Parol</label>
    <input type="password" id="password" name="password" autocomplete="current-password" required>
    <button type="submit">Kirish</button>
    <a class="back" href="/">&larr; Saytga qaytish</a>
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

export const config = { path: ["/admin", "/admin.html", "/admin/logout"] };
