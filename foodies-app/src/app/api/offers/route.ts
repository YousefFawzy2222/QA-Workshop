import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const offers = db.prepare(`
      SELECT o.*, m.name as item_name, m.price as item_price, m.category, m.restaurant_id,
             r.name as restaurant_name, r.delivery_time, r.delivery_price, r.rating
      FROM Offers o
      JOIN Menu_item m ON o.menu_item_id = m.id
      JOIN Restaurant r ON m.restaurant_id = r.id
      WHERE o.expires_at > datetime('now') AND o.starts_at <= datetime('now')
      ORDER BY o.discount_percentage DESC
    `).all();
    return NextResponse.json({ offers });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
