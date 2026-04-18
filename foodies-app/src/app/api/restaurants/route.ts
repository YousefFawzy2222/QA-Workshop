import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const db = getDb();
    const restaurants = db.prepare('SELECT * FROM Restaurant ORDER BY name').all();
    return NextResponse.json({ restaurants });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, rating, delivery_time, delivery_price, open_time, close_time } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Restaurant name is required' }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare(
      'INSERT INTO Restaurant (name, rating, delivery_time, delivery_price, open_time, close_time) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, rating || 0, delivery_time || 30, delivery_price || 0, open_time || '08:00', close_time || '23:00');

    const restaurant = db.prepare('SELECT * FROM Restaurant WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ restaurant }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
