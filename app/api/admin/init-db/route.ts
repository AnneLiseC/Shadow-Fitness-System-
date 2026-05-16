import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  const results: string[] = [];
  for (const stmt of statements) {
    try {
      await db.query(stmt);
      results.push(`OK: ${stmt.substring(0, 50)}...`);
    } catch (err: any) {
      results.push(`ERR: ${err.message}`);
    }
  }

  return NextResponse.json({ success: true, results });
}
