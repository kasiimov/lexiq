// Congix English — сессия администратора.
//
// Один и тот же код нужен двум функциям: admin-gate отдаёт страницы, admin-api
// отдаёт данные. Если бы каждая проверяла куку по-своему, рано или поздно одна
// из них стала бы проверять слабее — а слабее здесь значит «открыто всем».

export const COOKIE = "congix_admin";

// Двенадцать часов: рабочий день укладывается в одну сессию, а забытая
// открытой вкладка к утру всё равно попросит пароль заново.
export const SESSION_SECONDS = 12 * 60 * 60;

const encoder = new TextEncoder();

export function base64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64urlDecode(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

export async function hmac(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

// Сравнение за постоянное время: обычное === выходит на первом несовпавшем
// байте, и по времени ответа секрет подбирается посимвольно.
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// Сами секреты сравниваем не напрямую, а по их HMAC: длина введённого пароля
// тогда ничего не выдаёт, потому что дайджест всегда 32 байта.
export async function secretsMatch(
  secret: string,
  expected: string,
  given: string,
): Promise<boolean> {
  if (!expected) return false;
  const [left, right] = await Promise.all([hmac(secret, expected), hmac(secret, given)]);
  return timingSafeEqual(left, right);
}

export async function issueToken(secret: string, email: string): Promise<string> {
  const payload = `${email}|${Math.floor(Date.now() / 1000) + SESSION_SECONDS}`;
  const signature = await hmac(secret, payload);
  return `${base64urlEncode(encoder.encode(payload))}.${base64urlEncode(signature)}`;
}

export async function tokenIsValid(secret: string, token: string): Promise<boolean> {
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

export function readCookie(request: Request, name: string): string {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return "";
}

// Единственная точка, где решается «пустить или нет». Отсутствие секрета —
// это отказ, а не разрешение: иначе стёртая переменная окружения молча
// открыла бы панель всему интернету.
export async function requestIsAuthorized(request: Request): Promise<boolean> {
  const secret = Deno.env.get("ADMIN_SESSION_SECRET") ?? "";
  if (!secret) return false;
  const token = readCookie(request, COOKIE);
  return !!token && await tokenIsValid(secret, token);
}
