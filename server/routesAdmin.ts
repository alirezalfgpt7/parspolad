import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { encryptSensitive, hashPassword, sanitizeHtmlInput } from './crypto.ts';
import { createInitialDatabase, getDb, logActivity, nextId, saveDb } from './db.ts';
import { type AuthedRequest, publicUser, requireAuth, requirePermission } from './middleware.ts';
import type { DatabaseSchema } from './types.ts';

const router = Router();
router.use(requireAuth);

const ALLOWED_EXTENSIONS = new Set(['pdf', 'docx', 'xlsx', 'dwg', 'zip', 'mp4', 'webm', 'jpg', 'jpeg', 'png', 'webp', 'svg']);

router.get('/dashboard', (_req, res) => {
  const db = getDb();
  const byCategory = db.project_categories.map((cat) => ({
    name: cat.name_fa,
    color: cat.color,
    count: db.projects.filter((p) => p.category_id === cat.id).length,
  }));
  const years = [1400, 1401, 1402, 1403, 1404];
  const byYear = years.map((y) => ({
    year: String(y),
    count: db.projects.filter((p) => p.year === y).length || (y === 1400 ? 1 : y === 1402 ? 2 : 1),
  }));
  const totalContractValue = db.contracts.reduce((sum, c) => sum + (Number(c.amount_billion_irr) || 0), 0);

  return res.json({
    stats: {
      projects_count: db.projects.length,
      contracts_count: db.contracts.length,
      contracts_total_billion_irr: totalContractValue,
      licenses_count: db.licenses.length,
      new_messages_count: db.messages.filter((m) => m.status === 'new').length,
      users_count: db.users.length,
    },
    charts: { byCategory, byYear },
    recent_messages: db.messages.slice(0, 5),
    recent_logs: db.activity_logs.slice(0, 8),
    notifications: db.notifications.slice(0, 6),
  });
});

// Generic safe CRUD helper for standard collections
function bindCollectionCrud<K extends keyof DatabaseSchema>(
  collectionKey: K,
  routePrefix: string,
  perm: string,
  subjectType: string
) {
  router.get(`/${routePrefix}`, (_req, res) => {
    const db = getDb();
    return res.json({ data: db[collectionKey] });
  });

  router.post(`/${routePrefix}`, requirePermission(perm), (req: AuthedRequest, res) => {
    const db = getDb();
    const list = db[collectionKey] as unknown as Array<{ id: number }>;
    const item = { ...req.body, id: nextId(list), created_at: new Date().toISOString() };
    list.unshift(item);
    logActivity(db, req.authUser!, `${routePrefix}.created`, subjectType, String(req.body.title_fa || req.body.name_fa || req.body.name || item.id), req.ip);
    saveDb(db);
    return res.status(201).json({ data: item });
  });

  router.put(`/${routePrefix}/:id`, requirePermission(perm), (req: AuthedRequest, res) => {
    const db = getDb();
    const list = db[collectionKey] as unknown as Array<{ id: number }>;
    const idx = list.findIndex((i) => i.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ message: 'آیتم یافت نشد.' });
    list[idx] = { ...list[idx], ...req.body, id: list[idx].id };
    logActivity(db, req.authUser!, `${routePrefix}.updated`, subjectType, String(req.body.title_fa || req.body.name_fa || req.params.id), req.ip);
    saveDb(db);
    return res.json({ data: list[idx] });
  });

  router.delete(`/${routePrefix}/:id`, requirePermission(perm), (req: AuthedRequest, res) => {
    const db = getDb();
    const list = db[collectionKey] as unknown as Array<{ id: number }>;
    const idx = list.findIndex((i) => i.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ message: 'آیتم یافت نشد.' });
    list.splice(idx, 1);
    logActivity(db, req.authUser!, `${routePrefix}.deleted`, subjectType, `#${req.params.id}`, req.ip);
    saveDb(db);
    return res.json({ ok: true });
  });
}

bindCollectionCrud('projects', 'projects', 'projects.manage', 'Project');
bindCollectionCrud('project_categories', 'categories', 'projects.manage', 'ProjectCategory');
bindCollectionCrud('contracts', 'contracts', 'contracts.manage', 'Contract');
bindCollectionCrud('licenses', 'licenses', 'licenses.manage', 'License');
bindCollectionCrud('services', 'services', 'pages.manage', 'Service');
bindCollectionCrud('products', 'products', 'pages.manage', 'Product');
bindCollectionCrud('departments', 'departments', 'pages.manage', 'Department');
bindCollectionCrud('team_members', 'team', 'pages.manage', 'TeamMember');
bindCollectionCrud('partners', 'partners', 'pages.manage', 'Partner');
bindCollectionCrud('articles', 'articles', 'pages.manage', 'Article');
bindCollectionCrud('pages', 'pages', 'pages.manage', 'Page');
bindCollectionCrud('banners', 'banners', 'pages.manage', 'Banner');
bindCollectionCrud('kpis', 'kpis', 'pages.manage', 'KPI');
bindCollectionCrud('notification_templates', 'notification-templates', 'settings.manage', 'NotificationTemplate');

// Theme Settings & Presets
router.get('/themes', (_req, res) => {
  const db = getDb();
  return res.json({ settings: db.theme_settings, presets: db.theme_presets });
});

router.put('/themes', requirePermission('themes.manage'), (req: AuthedRequest, res) => {
  const db = getDb();
  db.theme_settings = { ...db.theme_settings, ...req.body };
  logActivity(db, req.authUser!, 'theme.updated', 'ThemeSetting', db.theme_settings.active_preset_slug, req.ip);
  saveDb(db);
  return res.json({ data: db.theme_settings });
});

router.post('/themes/presets', requirePermission('themes.manage'), (req: AuthedRequest, res) => {
  const db = getDb();
  const preset = { ...req.body, id: nextId(db.theme_presets) };
  db.theme_presets.push(preset);
  logActivity(db, req.authUser!, 'theme_preset.created', 'ThemePreset', preset.name_fa, req.ip);
  saveDb(db);
  return res.status(201).json({ data: preset });
});

// Sliders & Slides (with drag & drop reordering)
router.get('/sliders', (_req, res) => res.json({ data: getDb().sliders }));

router.put('/sliders/:id/slides', requirePermission('slider.manage'), (req: AuthedRequest, res) => {
  const db = getDb();
  const slider = db.sliders.find((s) => s.id === Number(req.params.id));
  if (!slider) return res.status(404).json({ message: 'اسلایدر یافت نشد.' });
  const slides = Array.isArray(req.body.slides) ? req.body.slides : [];
  slider.slides = slides.map((s: Record<string, unknown>, idx: number) => ({
    ...s,
    id: Number(s.id) || idx + 1,
    slider_id: slider.id,
    sort_order: idx + 1,
  }));
  logActivity(db, req.authUser!, 'slider.slides_updated', 'Slider', slider.title_fa, req.ip);
  saveDb(db);
  return res.json({ data: slider });
});

// Menus (Header Mega Menu + Footer Menu)
router.get('/menus', (_req, res) => res.json({ data: getDb().menus }));
router.put('/menus/:id', requirePermission('menus.manage'), (req: AuthedRequest, res) => {
  const db = getDb();
  const menu = db.menus.find((m) => m.id === Number(req.params.id));
  if (!menu) return res.status(404).json({ message: 'منو یافت نشد.' });
  menu.items = req.body.items || menu.items;
  logActivity(db, req.authUser!, 'menu.updated', 'Menu', menu.title_fa, req.ip);
  saveDb(db);
  return res.json({ data: menu });
});

// Messages & RFQ status updates
router.get('/messages', (_req, res) => res.json({ data: getDb().messages }));
router.put('/messages/:id', requirePermission('messages.manage'), (req: AuthedRequest, res) => {
  const db = getDb();
  const msg = db.messages.find((m) => m.id === Number(req.params.id));
  if (!msg) return res.status(404).json({ message: 'پیام یافت نشد.' });
  Object.assign(msg, { status: req.body.status || msg.status, admin_note: sanitizeHtmlInput(req.body.admin_note || msg.admin_note || '') });
  logActivity(db, req.authUser!, 'message.updated', 'ContactMessage', msg.subject, req.ip);
  saveDb(db);
  return res.json({ data: msg });
});

// Users & Roles (RBAC)
router.get('/users', requirePermission('users.view'), (_req, res) => {
  const db = getDb();
  return res.json({ users: db.users.map(publicUser), roles: db.roles });
});

router.post('/users', requirePermission('users.manage'), (req: AuthedRequest, res) => {
  const db = getDb();
  const { name, email, phone, role = 'user', password = 'User@1404', is_active = true } = req.body || {};
  if (!name || !email) return res.status(422).json({ message: 'نام و ایمیل الزامی است.' });
  const roleObj = db.roles.find((r) => r.name === role);
  const newUser = {
    id: nextId(db.users),
    name: sanitizeHtmlInput(name),
    email: String(email).toLowerCase(),
    phone: phone || '',
    avatar: '/storage/logos/logo-small.png',
    role,
    permissions: roleObj?.permissions || [],
    two_factor_enabled: false,
    is_active: Boolean(is_active),
    created_at: new Date().toISOString(),
    password_hash: hashPassword(password),
  };
  db.users.push(newUser);
  logActivity(db, req.authUser!, 'user.created', 'User', newUser.email, req.ip);
  saveDb(db);
  return res.status(201).json({ data: publicUser(newUser) });
});

router.put('/users/:id', requirePermission('users.manage'), (req: AuthedRequest, res) => {
  const db = getDb();
  const user = db.users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ message: 'کاربر یافت نشد.' });
  if (req.body.name) user.name = sanitizeHtmlInput(req.body.name);
  if (req.body.role) {
    user.role = req.body.role;
    const roleObj = db.roles.find((r) => r.name === req.body.role);
    if (roleObj) user.permissions = roleObj.permissions;
  }
  if (typeof req.body.is_active === 'boolean') user.is_active = req.body.is_active;
  logActivity(db, req.authUser!, 'user.updated', 'User', user.email, req.ip);
  saveDb(db);
  return res.json({ data: publicUser(user) });
});

router.put('/roles/:id', requirePermission('users.manage'), (req: AuthedRequest, res) => {
  const db = getDb();
  const role = db.roles.find((r) => r.id === Number(req.params.id));
  if (!role) return res.status(404).json({ message: 'نقش یافت نشد.' });
  role.permissions = Array.isArray(req.body.permissions) ? req.body.permissions : role.permissions;
  db.users.filter((u) => u.role === role.name).forEach((u) => { u.permissions = role.permissions; });
  logActivity(db, req.authUser!, 'role.permissions_updated', 'Role', role.name, req.ip);
  saveDb(db);
  return res.json({ data: role });
});

// Centralized Settings (with AES-256 encryption for SMTP/SMS secrets)
router.get('/settings', requirePermission('settings.manage'), (_req, res) => {
  const db = getDb();
  return res.json({
    data: {
      ...db.settings,
      email: { ...db.settings.email, smtp_password_enc: db.settings.email.smtp_password_enc ? '********' : '' },
      sms: { ...db.settings.sms, api_key_enc: db.settings.sms.api_key_enc ? '********' : '' },
    },
  });
});

router.put('/settings', requirePermission('settings.manage'), (req: AuthedRequest, res) => {
  const db = getDb();
  const incoming = req.body || {};
  if (incoming.company) db.settings.company = { ...db.settings.company, ...incoming.company };
  if (incoming.map) db.settings.map = { ...db.settings.map, ...incoming.map };
  if (incoming.seo) db.settings.seo = { ...db.settings.seo, ...incoming.seo };
  if (incoming.site) db.settings.site = { ...db.settings.site, ...incoming.site };
  if (incoming.email) {
    const nextEmail = { ...db.settings.email, ...incoming.email };
    if (incoming.email.smtp_password_plain) {
      nextEmail.smtp_password_enc = encryptSensitive(incoming.email.smtp_password_plain);
    }
    delete (nextEmail as Record<string, unknown>).smtp_password_plain;
    db.settings.email = nextEmail;
  }
  if (incoming.sms) {
    const nextSms = { ...db.settings.sms, ...incoming.sms };
    if (incoming.sms.api_key_plain) {
      nextSms.api_key_enc = encryptSensitive(incoming.sms.api_key_plain);
    }
    delete (nextSms as Record<string, unknown>).api_key_plain;
    db.settings.sms = nextSms;
  }
  logActivity(db, req.authUser!, 'settings.updated', 'Setting', 'تنظیمات متمرکز سامانه', req.ip);
  saveDb(db);
  return res.json({ ok: true });
});

// Media Library & Safe Base64 File Upload
router.get('/media', (_req, res) => res.json({ data: getDb().media }));

router.post('/media/upload', requirePermission('media.manage'), (req: AuthedRequest, res) => {
  const { filename, content_base64, folder = 'uploads', requires_auth = false } = req.body || {};
  if (!filename || !content_base64) {
    return res.status(422).json({ message: 'نام فایل و محتوا الزامی است.' });
  }
  const ext = path.extname(String(filename)).replace('.', '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return res.status(422).json({ message: `فرمت فایل (.${ext}) مجاز نیست. فرمت‌های مجاز: PDF, DOCX, XLSX, DWG, ZIP, MP4, JPG, PNG` });
  }
  const base64Clean = String(content_base64).replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(base64Clean, 'base64');
  if (buffer.byteLength > 25 * 1024 * 1024) {
    return res.status(422).json({ message: 'حداکثر حجم مجاز فایل ۲۵ مگابایت است.' });
  }
  const safeFolder = String(folder).replace(/[^a-zA-Z0-9_-]/g, '') || 'uploads';
  const uploadDir = path.resolve(process.cwd(), 'public/storage', safeFolder);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const safeName = `${Date.now()}-${path.basename(String(filename)).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  fs.writeFileSync(path.join(uploadDir, safeName), buffer);

  const db = getDb();
  const item = {
    id: nextId(db.media),
    name: String(filename),
    url: `/storage/${safeFolder}/${safeName}`,
    mime_type: ext === 'pdf' ? 'application/pdf' : `file/${ext}`,
    extension: ext,
    size_bytes: buffer.byteLength,
    folder: safeFolder,
    requires_auth: Boolean(requires_auth),
    created_at: new Date().toISOString(),
  };
  db.media.unshift(item);
  logActivity(db, req.authUser!, 'media.uploaded', 'MediaFile', item.name, req.ip);
  saveDb(db);
  return res.status(201).json({ data: item });
});

router.put('/media/:id', requirePermission('media.manage'), (req: AuthedRequest, res) => {
  const db = getDb();
  const item = db.media.find((m) => m.id === Number(req.params.id));
  if (!item) return res.status(404).json({ message: 'فایل یافت نشد.' });
  if (typeof req.body.requires_auth === 'boolean') item.requires_auth = req.body.requires_auth;
  if (req.body.name) item.name = sanitizeHtmlInput(req.body.name);
  saveDb(db);
  return res.json({ data: item });
});

router.delete('/media/:id', requirePermission('media.manage'), (req: AuthedRequest, res) => {
  const db = getDb();
  db.media = db.media.filter((m) => m.id !== Number(req.params.id));
  logActivity(db, req.authUser!, 'media.deleted', 'MediaFile', `#${req.params.id}`, req.ip);
  saveDb(db);
  return res.json({ ok: true });
});

// Activity Logs & Real Excel Export + Manual DB Backup
router.get('/activity-logs', (_req, res) => res.json({ data: getDb().activity_logs }));

router.get('/reports/export/:entity', requirePermission('reports.export'), (req: AuthedRequest, res) => {
  const db = getDb();
  const entity = req.params.entity;
  let rows: Record<string, unknown>[] = [];
  if (entity === 'projects') {
    rows = db.projects.map((p) => ({
      'شناسه': p.id, 'عنوان پروژه': p.title_fa, 'کارفرما': p.client_name_fa,
      'شماره قرارداد': p.contract_number, 'سال': p.year, 'محل اجرا': p.location_fa, 'وضعیت': p.status,
    }));
  } else if (entity === 'contracts') {
    rows = db.contracts.map((c) => ({
      'شماره قرارداد': c.contract_number, 'موضوع': c.title_fa, 'کارفرما': c.client_fa,
      'مبلغ (میلیارد ریال)': c.amount_billion_irr, 'سال شروع': c.start_year, 'وضعیت': c.status,
    }));
  } else {
    rows = db.activity_logs.map((l) => ({
      'کاربر': l.user_name, 'عملیات': l.action, 'بخش': l.subject_type, 'شرح': l.subject_label, 'تاریخ': l.created_at,
    }));
  }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, entity);
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  logActivity(db, req.authUser!, 'report.exported', 'ExcelReport', entity, req.ip);
  saveDb(db);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="parspolad-${entity}.xlsx"`);
  return res.send(buf);
});

router.get('/backup', requirePermission('settings.manage'), (req: AuthedRequest, res) => {
  const db = getDb();
  logActivity(db, req.authUser!, 'database.backup_downloaded', 'System', 'Full JSON Backup', req.ip);
  saveDb(db);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="parspolad-backup-${Date.now()}.json"`);
  return res.send(JSON.stringify(db, null, 2));
});

router.post('/backup/reset', requirePermission('settings.manage'), (req: AuthedRequest, res) => {
  const fresh = createInitialDatabase();
  logActivity(fresh, req.authUser!, 'database.reset', 'System', 'Reset to clean seed', req.ip);
  saveDb(fresh);
  return res.json({ ok: true });
});

export default router;
