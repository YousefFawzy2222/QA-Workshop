import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { items, restaurant_id, address_id, manual_address, use_points } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Validate address
    if (!address_id && !manual_address) {
      return NextResponse.json({ error: "Can't place an order without specifying the address" }, { status: 400 });
    }

    if (manual_address) {
      const { phone, building, apartment, floor, street } = manual_address;
      if (!phone || !building || !apartment || !floor || !street) {
        return NextResponse.json({ error: "Can't place an order without specifying the address" }, { status: 400 });
      }
    }

    const db = getDb();
    const restaurant = db.prepare('SELECT * FROM Restaurant WHERE id = ?').get(restaurant_id) as { delivery_price: number } | undefined;
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Calculate subtotal
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }

    const deliveryPrice = restaurant.delivery_price;
    let totalPrice = subtotal + deliveryPrice;
    let pointsRedeemed = 0;

    // Handle loyalty point redemption
    if (use_points) {
      const userRecord = db.prepare('SELECT loyalty_points FROM User WHERE email = ?').get(user.email) as { loyalty_points: number };
      if (userRecord.loyalty_points >= 1000) {
        const pointValue = userRecord.loyalty_points * 0.01; // 1000 points = 10 EGP
        const discount = Math.min(pointValue, totalPrice);
        totalPrice = Math.max(0, totalPrice - discount);
        pointsRedeemed = userRecord.loyalty_points;
        db.prepare('UPDATE User SET loyalty_points = 0 WHERE email = ?').run(user.email);
      }
    }

    // Create order
    const result = db.prepare(`
      INSERT INTO "Order" (user_email, restaurant_id, address_id, sub_total, delivery_price, total_price, points_redeemed, order_status, created_at,
        delivery_phone, delivery_building, delivery_apartment, delivery_floor, delivery_street, delivery_landmark)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', datetime('now'), ?, ?, ?, ?, ?, ?)
    `).run(
      user.email,
      restaurant_id,
      address_id || null,
      subtotal,
      deliveryPrice,
      totalPrice,
      pointsRedeemed,
      manual_address?.phone || null,
      manual_address?.building || null,
      manual_address?.apartment || null,
      manual_address?.floor || null,
      manual_address?.street || null,
      manual_address?.landmark || null
    );

    const orderId = result.lastInsertRowid;

    // Insert order items
    const insertItem = db.prepare('INSERT INTO Order_item (order_id, menu_item_id, quantity, unit_price) VALUES (?, ?, ?, ?)');
    for (const item of items) {
      insertItem.run(orderId, item.menu_item_id, item.quantity, item.price);
    }

    // Accrue loyalty points: 0.1 point per 1 EGP on subtotal (floor rounding)
    const pointsEarned = Math.floor(subtotal * 0.1);
    if (pointsEarned > 0) {
      db.prepare('UPDATE User SET loyalty_points = loyalty_points + ? WHERE email = ?').run(pointsEarned, user.email);
    }

    const updatedUser = db.prepare('SELECT loyalty_points FROM User WHERE email = ?').get(user.email) as { loyalty_points: number };

    return NextResponse.json({
      order: { id: orderId, subtotal, delivery_price: deliveryPrice, total_price: totalPrice, points_redeemed: pointsRedeemed, points_earned: pointsEarned },
      loyalty_points: updatedUser.loyalty_points
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const orders = db.prepare(`
      SELECT o.*, r.name as restaurant_name 
      FROM "Order" o 
      JOIN Restaurant r ON o.restaurant_id = r.id 
      WHERE o.user_email = ? 
      ORDER BY o.created_at DESC
    `).all(user.email);

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
