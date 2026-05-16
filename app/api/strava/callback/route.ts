export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const USER_ID = 'anne-lise';

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shadow-fitness-system.vercel.app';
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/profil?strava=error`);
  }

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) return NextResponse.redirect(`${baseUrl}/profil?strava=error`);

  const data = await res.json();

  await query(
    `INSERT INTO strava_tokens (user_id, access_token, refresh_token, expires_at, athlete_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE SET
       access_token = $2, refresh_token = $3, expires_at = $4, athlete_id = $5`,
    [
      USER_ID,
      data.access_token,
      data.refresh_token,
      new Date(data.expires_at * 1000).toISOString(),
      data.athlete.id,
    ]
  );

  return NextResponse.redirect(`${baseUrl}/profil?strava=success`);
}
