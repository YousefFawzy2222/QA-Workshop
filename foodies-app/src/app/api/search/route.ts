import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const sort = searchParams.get('sort') || 'name';

    const db = getDb();
    let restaurants;

    if (query.trim()) {
      // Syntax-tolerant search: match partial names case-insensitively
      const searchTerm = `%${query.trim()}%`;
      let orderClause = 'name ASC';
      if (sort === 'rating') orderClause = 'rating DESC, name ASC';
      else if (sort === 'delivery_time') orderClause = 'delivery_time ASC, name ASC';
      else if (sort === 'delivery_price') orderClause = 'delivery_price ASC, name ASC';
      
      restaurants = db.prepare(
        `SELECT * FROM Restaurant WHERE name LIKE ? ORDER BY ${orderClause}`
      ).all(searchTerm);
    } else {
      restaurants = db.prepare('SELECT * FROM Restaurant ORDER BY name').all();
    }

    return NextResponse.json({ restaurants });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
