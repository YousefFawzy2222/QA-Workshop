import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { comparePassword, createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Check email and password again' }, { status: 401 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM User WHERE email = ?').get(email) as {
      email: string; hashed_password: string; name: string; role: string; loyalty_points: number;
    } | undefined;

    if (!user || !comparePassword(password, user.hashed_password)) {
      return NextResponse.json({ error: 'Check email and password again' }, { status: 401 });
    }

    const token = createToken({ email: user.email, name: user.name, role: user.role });

    const response = NextResponse.json({
      user: { email: user.email, name: user.name, role: user.role, loyalty_points: user.loyalty_points }
    });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
