// Congix English — данные для админки.
//
// Отдаёт список учеников: кто зарегистрировался, когда заходил последний раз
// и сколько прошёл. Ходит в Firebase сервисным аккаунтом, потому что правила
// Firestore не дают одному пользователю читать чужой прогресс — и не должны.

import { listAuthUsers, listProgress, NotConfigured } from "./lib/firebase-admin.ts";
import { requestIsAuthorized } from "./lib/admin-session.ts";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, private",
    },
  });
}

export default async function handler(request: Request): Promise<Response> {
  // Проверка та же, что и у страницы. Без неё адрес /api/admin/users стал бы
  // чёрным ходом: панель под паролем, а данные из неё — нет.
  if (!(await requestIsAuthorized(request))) {
    return json({ error: "unauthorized" }, 401);
  }

  try {
    // Оба запроса независимы, поэтому идут разом: последовательно это лишняя
    // секунда ожидания на каждом открытии панели.
    const [authUsers, progress] = await Promise.all([listAuthUsers(), listProgress()]);

    const users = authUsers.map((user) => {
      const stats = progress.get(user.uid);
      const answered = (stats?.totalCorrect ?? 0) + (stats?.totalWrong ?? 0);
      return {
        uid: user.uid,
        email: user.email,
        name: user.name,
        provider: user.provider,
        disabled: user.disabled,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        knownWords: stats?.knownWords ?? 0,
        totalCorrect: stats?.totalCorrect ?? 0,
        totalWrong: stats?.totalWrong ?? 0,
        sessionsPlayed: stats?.sessionsPlayed ?? 0,
        streakDays: stats?.streakDays ?? 0,
        streakBest: stats?.streakBest ?? 0,
        lastDayPlayed: stats?.lastDayPlayed ?? null,
        // Точность считаем здесь, а не в браузере: одна формула на всех,
        // и таблицу можно сортировать по ней без пересчёта.
        accuracy: answered ? Math.round((stats!.totalCorrect / answered) * 100) : null,
        answered,
      };
    });

    // Профиль в Firestore может пережить удаление аккаунта из Auth. Такие
    // строки не выбрасываем молча — иначе «пропавший» прогресс не объяснить.
    const orphans = [...progress.values()]
      .filter((p) => !authUsers.some((u) => u.uid === p.uid))
      .map((p) => ({ ...p, email: "", name: "(o'chirilgan akkaunt)", orphan: true }));

    return json({ users, orphans, fetchedAt: Date.now() });
  } catch (error) {
    if (error instanceof NotConfigured) {
      return json({ error: "not_configured", message: error.message }, 503);
    }
    return json({ error: "upstream", message: String(error) }, 502);
  }
}

export const config = { path: "/api/admin/users" };
