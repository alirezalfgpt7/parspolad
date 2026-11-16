import type { NextFunction, Request, Response } from 'express';
import { getDb } from './db.ts';
import type { StoredUser } from './types.ts';

export interface AuthedRequest extends Request {
  authUser?: StoredUser;
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxRequests = 60, windowMs = 60_000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const bucket = rateBuckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > maxRequests) {
      return res.status(429).json({
        message: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید.',
      });
    }
    return next();
  };
}

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

export function attachAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return next();
  const db = getDb();
  const session = db.tokens.find((t) => t.token === token && t.expires_at > Date.now());
  if (!session) return next();
  const user = db.users.find((u) => u.id === session.user_id && u.is_active);
  if (user) {
    req.authUser = user;
  }
  next();
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.authUser) {
    return res.status(401).json({ message: 'احراز هویت الزامی است.' });
  }
  return next();
}

export function requirePermission(permission: string) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.authUser) {
      return res.status(401).json({ message: 'احراز هویت الزامی است.' });
    }
    const perms = req.authUser.permissions || [];
    if (perms.includes('*') || perms.includes(permission) || req.authUser.role === 'super-admin') {
      return next();
    }
    return res.status(403).json({ message: 'شما مجوز دسترسی به این بخش را ندارید.' });
  };
}

export function publicUser(user: StoredUser) {
  const { password_hash: _p, two_factor_secret: _t, ...safe } = user;
  return safe;
}
