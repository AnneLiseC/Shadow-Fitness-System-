import { NextRequest, NextResponse } from 'next/server';
import { syncStravaActivities } from '@/lib/strava';

const USER_ID = 'anne-lise';

export async function POST(_req: NextRequest) {
  const imported = await syncStravaActivities(USER_ID);
  return NextResponse.json({ success: true, imported });
}
