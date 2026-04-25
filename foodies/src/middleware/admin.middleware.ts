import { Request, Response, NextFunction } from 'express';

// ─── Admin Guard Middleware ───────────────────────────────────────────────────
// Flowchart: every Admin action starts with "isAdmin == true?" check.
// We use a simple session header (X-User-Email) set by the client after login.
// The guard looks up the user in UserStore and rejects non-admins.

import { UserStore } from '../models/user.model';

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const email = req.headers['x-user-email'];

  if (typeof email !== 'string' || !email) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const user = await UserStore.findByEmail(email);

  if (!user) {
    res.status(401).json({ success: false, error: 'User not found' });
    return;
  }

  // Flowchart: isAdmin == true? → No → access denied (loop back)
  if (!user.isAdmin) {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }

  next();
}
