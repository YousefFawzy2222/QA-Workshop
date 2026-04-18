import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { menu_item_id, discount_percentage, starts_at, expires_at } = await request.json();

    const db = getDb();
    const menuItem = db.prepare('SELECT * FROM Menu_item WHERE id = ?').get(menu_item_id) as { price: number } | undefined;
    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    const originalPrice = menuItem.price;
    const discountedPrice = originalPrice * (1 - discount_percentage / 100);

    const result = db.prepare(
      'INSERT INTO Offers (menu_item_id, discount_percentage, original_price, discounted_price, starts_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(menu_item_id, discount_percentage, originalPrice, discountedPrice, starts_at, expires_at);

    const offer = db.prepare('SELECT * FROM Offers WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ offer }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, discount_percentage, starts_at, expires_at } = await request.json();

    const db = getDb();
    const existingOffer = db.prepare('SELECT * FROM Offers WHERE id = ?').get(id) as { original_price: number } | undefined;
    if (!existingOffer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    const discountedPrice = existingOffer.original_price * (1 - discount_percentage / 100);

    db.prepare(
      'UPDATE Offers SET discount_percentage=?, discounted_price=?, starts_at=?, expires_at=? WHERE id=?'
    ).run(discount_percentage, discountedPrice, starts_at, expires_at, id);

    const offer = db.prepare('SELECT * FROM Offers WHERE id = ?').get(id);
    return NextResponse.json({ offer });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const db = getDb();
    db.prepare('DELETE FROM Offers WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
