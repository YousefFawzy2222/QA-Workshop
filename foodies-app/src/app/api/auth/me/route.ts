import { NextResponse } from 'next/server';
import { getCurrentUser, getUserFromDb } from '@/lib/auth';

export async function GET() {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    const user = getUserFromDb(payload.email);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({
      user: { email: user.email, name: user.name, role: user.role, loyalty_points: user.loyalty_points }
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
