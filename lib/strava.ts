import { query, queryOne } from './db';

interface StravaToken {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  athlete_id: number;
}

export async function getStravaToken(userId: string): Promise<StravaToken | null> {
  return queryOne<StravaToken>(
    'SELECT * FROM strava_tokens WHERE user_id = $1',
    [userId]
  );
}

export async function refreshStravaToken(token: StravaToken): Promise<StravaToken | null> {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token,
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();

  await query(
    `UPDATE strava_tokens SET access_token = $1, refresh_token = $2, expires_at = $3
     WHERE user_id = $4`,
    [data.access_token, data.refresh_token, new Date(data.expires_at * 1000).toISOString(), token.user_id]
  );

  return { ...token, access_token: data.access_token, refresh_token: data.refresh_token };
}

export async function getValidStravaToken(userId: string): Promise<StravaToken | null> {
  const token = await getStravaToken(userId);
  if (!token) return null;

  const expiresAt = new Date(token.expires_at).getTime();
  if (Date.now() < expiresAt - 60000) return token;

  return refreshStravaToken(token);
}

export async function syncStravaActivities(userId: string): Promise<number> {
  const token = await getValidStravaToken(userId);
  if (!token) return 0;

  const after = Math.floor(Date.now() / 1000) - 7 * 24 * 3600;
  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?per_page=30&after=${after}`,
    { headers: { Authorization: `Bearer ${token.access_token}` } }
  );

  if (!res.ok) return 0;

  const activities = await res.json();
  let imported = 0;

  for (const act of activities) {
    if (act.type !== 'Run') continue;

    const allure = act.moving_time / (act.distance / 1000);
    const date = act.start_date_local.substring(0, 10);

    await query(
      `INSERT INTO strava_activites (user_id, strava_id, date, distance_m, duree_secondes, allure_moyenne, type_activite)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (strava_id) DO NOTHING`,
      [userId, act.id, date, act.distance, act.moving_time, allure, act.type]
    );
    imported++;
  }

  return imported;
}
