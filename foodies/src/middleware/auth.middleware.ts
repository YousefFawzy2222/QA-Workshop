import { Request, Response, NextFunction } from 'express';
import { UserStore } from '../models/user.model';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  // Inject user email into the request for downstream use
  (req as any).userEmail = user.email;

  next();
}
