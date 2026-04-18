import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const userRecord = db.prepare('SELECT email, name, role, loyalty_points FROM User WHERE email = ?').get(user.email);
    return NextResponse.json({ user: userRecord });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, password } = await request.json();
    const db = getDb();

    if (name !== undefined) {
      db.prepare('UPDATE User SET name = ? WHERE email = ?').run(name, user.email);
    }

    if (password) {
      const { hashPassword, validatePassword } = await import('@/lib/auth');
      const validation = validatePassword(password);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.errors[0] }, { status: 400 });
      }
      const hashed = hashPassword(password);
      db.prepare('UPDATE User SET hashed_password = ? WHERE email = ?').run(hashed, user.email);
    }

    const updated = db.prepare('SELECT email, name, role, loyalty_points FROM User WHERE email = ?').get(user.email);
    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
