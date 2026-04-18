import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    const restaurant = db.prepare('SELECT * FROM Restaurant WHERE id = ?').get(id);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }
    const menuItems = db.prepare('SELECT * FROM Menu_item WHERE restaurant_id = ? ORDER BY category, name').all(id);
    const offers = db.prepare(`
      SELECT o.*, m.name as item_name, m.restaurant_id 
      FROM Offers o 
      JOIN Menu_item m ON o.menu_item_id = m.id 
      WHERE m.restaurant_id = ? AND o.expires_at > datetime('now')
    `).all(id);
    return NextResponse.json({ restaurant, menuItems, offers });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;
    const { name, rating, delivery_time, delivery_price, open_time, close_time } = await request.json();
    const db = getDb();
    db.prepare(
      'UPDATE Restaurant SET name=?, rating=?, delivery_time=?, delivery_price=?, open_time=?, close_time=? WHERE id=?'
    ).run(name, rating, delivery_time, delivery_price, open_time, close_time, id);
    const restaurant = db.prepare('SELECT * FROM Restaurant WHERE id = ?').get(id);
    return NextResponse.json({ restaurant });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;
    const db = getDb();
    db.prepare('DELETE FROM Restaurant WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
