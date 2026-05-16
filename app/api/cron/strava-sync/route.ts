import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { syncStravaActivities } from '@/lib/strava';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await query<{ user_id: string }>(
    'SELECT DISTINCT user_id FROM strava_tokens'
  );

  let totalImported = 0;
  for (const u of users) {
    try {
      const n = await syncStravaActivities(u.user_id);
      totalImported += n;
    } catch {
      // continue
    }
  }

  return NextResponse.json({ success: true, totalImported });
}
