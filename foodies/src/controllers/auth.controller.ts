import { Request, Response } from 'express';
import { register, login } from '../services/auth.service';

// ─── Register Controller ──────────────────────────────────────────────────────
// UA-FR-01: POST /api/auth/register
export async function registerController(
  req: Request,
  res: Response
): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ success: false, error: 'Invalid request body' });
    return;
  }

  const result = await register(email, password);

  if (result.success) {
    res.status(201).json({ success: true });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
}

// ─── Login Controller ─────────────────────────────────────────────────────────
// LG-FR-01: POST /api/auth/login
export async function loginController(
  req: Request,
  res: Response
): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ success: false, error: 'Invalid request body' });
    return;
  }

  const result = await login(email, password);

  if (result.success) {
    res.status(200).json({ success: true, isAdmin: result.isAdmin });
  } else {
    // LG-FR-02, 03, 04: All login errors use the same generic message
    res.status(401).json({ success: false, error: result.error });
  }
}
