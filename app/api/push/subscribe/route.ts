import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const sub = await req.json();
  const { endpoint, keys } = sub;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Données subscription invalides' }, { status: 400 });
  }

  await query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_key)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint) DO UPDATE SET user_id = $1`,
    [user.id, endpoint, keys.p256dh, keys.auth]
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  await query(
    'DELETE FROM push_subscriptions WHERE user_id = $1',
    [user.id]
  );

  return NextResponse.json({ success: true });
}
