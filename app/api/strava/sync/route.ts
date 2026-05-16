import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { syncStravaActivities } from '@/lib/strava';

export async function POST(_req: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const imported = await syncStravaActivities(user.id);
  return NextResponse.json({ success: true, imported });
}
