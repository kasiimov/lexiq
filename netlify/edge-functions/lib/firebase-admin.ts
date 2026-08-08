// Congix English — чтение данных Firebase со стороны сервера.
//
// Зачем это вообще нужно. Правила Firestore намеренно запрещают одному
// пользователю читать чужой профиль (см. firestore.rules), и это правильно:
// иначе список всех учеников достался бы любому, кто вошёл в приложение.
// Поэтому админка не ходит в базу из браузера — она спрашивает эту функцию,
// а та представляется сервисным аккаунтом.
//
// Переменная окружения FIREBASE_SERVICE_ACCOUNT — целиком JSON ключа из
// Firebase Console → Project settings → Service accounts → Generate new
// private key. Ключ даёт полный доступ к проекту, поэтому живёт только в
// переменных окружения Netlify и никогда не попадает ни в репозиторий,
// ни в браузер.

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  createdAt: number | null;
  lastLoginAt: number | null;
  disabled: boolean;
  provider: string;
}

export interface ProgressDoc {
  uid: string;
  totalCorrect: number;
  totalWrong: number;
  sessionsPlayed: number;
  streakDays: number;
  streakBest: number;
  lastDayPlayed: string | null;
  knownWords: number;
  updatedAt: number | null;
}

export class NotConfigured extends Error {}

function serviceAccount(): ServiceAccount {
  const raw = Deno.env.get("FIREBASE_SERVICE_ACCOUNT") ?? "";
  if (!raw.trim()) {
    throw new NotConfigured("FIREBASE_SERVICE_ACCOUNT kiritilmagan");
  }
  let parsed: ServiceAccount;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new NotConfigured("FIREBASE_SERVICE_ACCOUNT to'g'ri JSON emas");
  }
  if (!parsed.client_email || !parsed.private_key || !parsed.project_id) {
    throw new NotConfigured("FIREBASE_SERVICE_ACCOUNT to'liq emas");
  }
  return parsed;
}

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Ключ приезжает PEM-строкой, а importKey ждёт сырой DER. Перевод строк в JSON
// хранится как «\n» — если его не развернуть, PEM не разберётся.
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const body = pem
    .replace(/\\n/g, "\n")
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(body), (char) => char.charCodeAt(0));
  return await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

// Токен живёт час; держим его между вызовами, чтобы не подписывать JWT и не
// ходить в Google на каждое обновление таблицы.
let cachedToken = "";
let cachedUntil = 0;

async function accessToken(account: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedUntil - 60 > now) return cachedToken;

  const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const claim = base64url(
    new TextEncoder().encode(JSON.stringify({
      iss: account.client_email,
      scope: [
        "https://www.googleapis.com/auth/datastore",
        "https://www.googleapis.com/auth/firebase",
      ].join(" "),
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })),
  );

  const key = await importPrivateKey(account.private_key);
  const signature = new Uint8Array(
    await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      key,
      new TextEncoder().encode(`${header}.${claim}`),
    ),
  );

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${base64url(signature)}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google token: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  cachedUntil = now + (Number(data.expires_in) || 3600);
  return cachedToken;
}

function toMillis(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Список аккаунтов отдаёт Identity Toolkit страницами по 1000. Пока сайт
// маленький, но постранично читаем сразу — иначе на тысяче первом ученике
// таблица тихо обрежется, и заметить это будет нечем.
export async function listAuthUsers(): Promise<AuthUser[]> {
  const account = serviceAccount();
  const token = await accessToken(account);
  const users: AuthUser[] = [];
  let pageToken = "";

  for (let page = 0; page < 20; page++) {
    const url = new URL(
      `https://identitytoolkit.googleapis.com/v1/projects/${account.project_id}/accounts:batchGet`,
    );
    url.searchParams.set("maxResults", "1000");
    if (pageToken) url.searchParams.set("nextPageToken", pageToken);

    const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
    if (!response.ok) {
      throw new Error(`Identity Toolkit: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    for (const item of data.users ?? []) {
      const providers = (item.providerUserInfo ?? [])
        .map((p: { providerId?: string }) => p.providerId)
        .filter(Boolean);
      users.push({
        uid: item.localId,
        email: item.email ?? "",
        name: item.displayName ?? (item.email ? String(item.email).split("@")[0] : ""),
        createdAt: toMillis(item.createdAt),
        lastLoginAt: toMillis(item.lastLoginAt),
        disabled: !!item.disabled,
        provider: providers.includes("google.com") ? "google" : "password",
      });
    }

    pageToken = data.nextPageToken ?? "";
    if (!pageToken) break;
  }

  return users;
}

// Firestore REST заворачивает каждое значение в тип: {integerValue:"3"},
// {mapValue:{fields:{...}}} и так далее. Разворачиваем в обычный JS.
function unwrap(value: Record<string, unknown> | undefined): unknown {
  if (!value) return undefined;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return Date.parse(String(value.timestampValue));
  if ("nullValue" in value) return null;
  if ("mapValue" in value) {
    const fields = (value.mapValue as { fields?: Record<string, Record<string, unknown>> })
      .fields ?? {};
    const out: Record<string, unknown> = {};
    for (const [key, inner] of Object.entries(fields)) out[key] = unwrap(inner);
    return out;
  }
  if ("arrayValue" in value) {
    const values = (value.arrayValue as { values?: Record<string, unknown>[] }).values ?? [];
    return values.map(unwrap);
  }
  return undefined;
}

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function listProgress(): Promise<Map<string, ProgressDoc>> {
  const account = serviceAccount();
  const token = await accessToken(account);
  const result = new Map<string, ProgressDoc>();
  let pageToken = "";

  for (let page = 0; page < 20; page++) {
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${account.project_id}/databases/(default)/documents/users`,
    );
    url.searchParams.set("pageSize", "300");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
    if (!response.ok) {
      throw new Error(`Firestore: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    for (const doc of data.documents ?? []) {
      const uid = String(doc.name).split("/").pop() ?? "";
      const fields = doc.fields ?? {};
      const stats = (unwrap(fields.stats) ?? {}) as Record<string, unknown>;
      const srs = (unwrap(fields.srs) ?? {}) as Record<string, unknown>;

      result.set(uid, {
        uid,
        totalCorrect: num(stats.totalCorrect),
        totalWrong: num(stats.totalWrong),
        sessionsPlayed: num(stats.sessionsPlayed),
        streakDays: num(stats.streakDays),
        streakBest: num(unwrap(fields.streakBest)),
        lastDayPlayed: (stats.lastDayPlayed as string) ?? null,
        knownWords: Object.keys(srs).length,
        updatedAt: (unwrap(fields.at) as number) ?? null,
      });
    }

    pageToken = data.nextPageToken ?? "";
    if (!pageToken) break;
  }

  return result;
}
