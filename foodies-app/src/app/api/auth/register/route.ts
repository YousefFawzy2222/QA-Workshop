import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, validatePassword, validateEmail, createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, confirmPassword } = await request.json();
    const errors: Record<string, string> = {};

    if (!email || email.trim() === '') {
      errors.email = "Email can't be empty";
    } else if (!validateEmail(email)) {
      errors.email = 'Invalid email';
    }

    if (!password || password.trim() === '') {
      errors.password = "Password field can't be empty";
    } else {
      const validation = validatePassword(password);
      if (!validation.valid) {
        errors.password = validation.errors[0];
      }
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT email FROM User WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ errors: { email: 'Email already registered' } }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);
    db.prepare('INSERT INTO User (email, hashed_password, name, role, loyalty_points) VALUES (?, ?, ?, ?, ?)').run(email, hashedPassword, '', 'user', 0);

    return NextResponse.json({ message: 'Registration successful' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
