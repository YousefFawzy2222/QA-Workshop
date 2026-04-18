import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const addresses = db.prepare('SELECT * FROM Address WHERE user_email = ?').all(user.email);
    return NextResponse.json({ addresses });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { phone_number, building_name, apartment, floor_number, street, nearby_landmark } = await request.json();

    // Phone validation per AC-FR-02.1.1
    if (!phone_number || !/^\d+$/.test(phone_number)) {
      return NextResponse.json({ error: 'Only numbers are allowed.' }, { status: 400 });
    }
    if (phone_number.length !== 11) {
      return NextResponse.json({ error: 'Phone number must be exactly 11 digits.' }, { status: 400 });
    }

    if (!building_name || !apartment || !floor_number || !street) {
      return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare(
      'INSERT INTO Address (user_email, phone_number, building_name, apartment, floor_number, street, nearby_landmark) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(user.email, phone_number, building_name, apartment, floor_number, street, nearby_landmark || null);

    const address = db.prepare('SELECT * FROM Address WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ address }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, phone_number, building_name, apartment, floor_number, street, nearby_landmark } = await request.json();

    if (!phone_number || !/^\d+$/.test(phone_number)) {
      return NextResponse.json({ error: 'Only numbers are allowed.' }, { status: 400 });
    }
    if (phone_number.length !== 11) {
      return NextResponse.json({ error: 'Phone number must be exactly 11 digits.' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(
      'UPDATE Address SET phone_number=?, building_name=?, apartment=?, floor_number=?, street=?, nearby_landmark=? WHERE id=? AND user_email=?'
    ).run(phone_number, building_name, apartment, floor_number, street, nearby_landmark || null, id, user.email);

    const address = db.prepare('SELECT * FROM Address WHERE id = ?').get(id);
    return NextResponse.json({ address });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
