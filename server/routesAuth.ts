import { Router } from 'express';
import { generateToken, hashPassword, sanitizeHtmlInput, verifyPassword } from './crypto.ts';
import { getDb, logActivity, nextId, saveDb } from './db.ts';
import { type AuthedRequest, publicUser, rateLimit, requireAuth } from './middleware.ts';

const router = Router();
const pending2FA = new Map<string, { userId: number; code: string; expiresAt: number }>();

router.post('/login', rateLimit(20, 60_000), (req, res) => {
  const { email, password, two_factor_code, challenge_token } = req.body || {};
  const db = getDb();

  if (challenge_token && two_factor_code) {
    const pending = pending2FA.get(challenge_token);
    if (!pending || pending.expiresAt < Date.now() || pending.code !== String(two_factor_code).trim()) {
      return res.status(422).json({ message: 'کد تایید دو مرحله‌ای نامعتبر یا منقضی شده است.' });
    }
    const user = db.users.find((u) => u.id === pending.userId && u.is_active);
    if (!user) return res.status(401).json({ message: 'کاربر یافت نشد.' });
    pending2FA.delete(challenge_token);
    const token = generateToken();
    db.tokens.push({ token, user_id: user.id, expires_at: Date.now() + 7 * 86_400_000 });
    logActivity(db, user, 'auth.login_2fa', 'User', user.email, req.ip);
    saveDb(db);
    return res.json({ token, user: publicUser(user) });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === String(email || '').toLowerCase());
  if (!user || !user.is_active || !verifyPassword(String(password || ''), user.password_hash)) {
    return res.status(401).json({ message: 'ایمیل یا رمز عبور اشتباه است.' });
  }

  if (user.two_factor_enabled) {
    const challenge = generateToken().slice(0, 24);
    const code = '482910';
    pending2FA.set(challenge, { userId: user.id, code, expiresAt: Date.now() + 300_000 });
    return res.json({
      requires_2fa: true,
      challenge_token: challenge,
      demo_hint: 'کد تایید دمو: 482910',
    });
  }

  const token = generateToken();
  db.tokens.push({ token, user_id: user.id, expires_at: Date.now() + 7 * 86_400_000 });
  logActivity(db, user, 'auth.login', 'User', user.email, req.ip);
  saveDb(db);
  return res.json({ token, user: publicUser(user) });
});

router.post('/register', rateLimit(10, 60_000), (req, res) => {
  const db = getDb();
  if (!db.settings.site.allow_registration) {
    return res.status(403).json({ message: 'ثبت‌نام عمومی در حال حاضر غیرفعال است.' });
  }
  const { name, email, phone, password } = req.body || {};
  if (!name || !email || !password || String(password).length < 6) {
    return res.status(422).json({ message: 'نام، ایمیل معتبر و رمز عبور حداقل ۶ کاراکتری الزامی است.' });
  }
  const exists = db.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (exists) {
    return res.status(422).json({ message: 'این ایمیل قبلاً ثبت شده است.' });
  }
  const userRole = db.roles.find((r) => r.name === 'user');
  const newUser = {
    id: nextId(db.users),
    name: sanitizeHtmlInput(String(name)),
    email: String(email).trim().toLowerCase(),
    phone: sanitizeHtmlInput(String(phone || '')),
    avatar: '/storage/logos/logo-small.png',
    role: 'user',
    permissions: userRole?.permissions || ['profile.manage', 'notifications.view'],
    two_factor_enabled: false,
    is_active: true,
    created_at: new Date().toISOString(),
    password_hash: hashPassword(String(password)),
  };
  db.users.push(newUser);
  const token = generateToken();
  db.tokens.push({ token, user_id: newUser.id, expires_at: Date.now() + 7 * 86_400_000 });
  logActivity(db, newUser, 'auth.register', 'User', newUser.email, req.ip);
  saveDb(db);
  return res.status(201).json({ token, user: publicUser(newUser) });
});

router.post('/logout', requireAuth, (req: AuthedRequest, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  const db = getDb();
  db.tokens = db.tokens.filter((t) => t.token !== token);
  logActivity(db, req.authUser!, 'auth.logout', 'User', req.authUser!.email, req.ip);
  saveDb(db);
  return res.json({ message: 'خروج با موفقیت انجام شد.' });
});

router.get('/me', requireAuth, (req: AuthedRequest, res) => {
  return res.json({ user: publicUser(req.authUser!) });
});

router.put('/profile', requireAuth, (req: AuthedRequest, res) => {
  const db = getDb();
  const user = db.users.find((u) => u.id === req.authUser!.id);
  if (!user) return res.status(404).json({ message: 'کاربر یافت نشد.' });

  const { name, phone, avatar, two_factor_enabled, current_password, new_password } = req.body || {};
  if (name) user.name = sanitizeHtmlInput(String(name));
  if (phone !== undefined) user.phone = sanitizeHtmlInput(String(phone));
  if (avatar) user.avatar = String(avatar);
  if (typeof two_factor_enabled === 'boolean') user.two_factor_enabled = two_factor_enabled;

  if (new_password) {
    if (!current_password || !verifyPassword(String(current_password), user.password_hash)) {
      return res.status(422).json({ message: 'رمز عبور فعلی صحیح نیست.' });
    }
    if (String(new_password).length < 6) {
      return res.status(422).json({ message: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.' });
    }
    user.password_hash = hashPassword(String(new_password));
  }

  logActivity(db, user, 'profile.updated', 'User', user.email, req.ip);
  saveDb(db);
  return res.json({ user: publicUser(user) });
});

export default router;
