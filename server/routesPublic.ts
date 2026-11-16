import { Router } from 'express';
import { sanitizeHtmlInput } from './crypto.ts';
import { getDb, logActivity, nextId, saveDb } from './db.ts';
import { type AuthedRequest, rateLimit, requireAuth } from './middleware.ts';

const router = Router();

router.get('/bootstrap', (req: AuthedRequest, res) => {
  const db = getDb();
  return res.json({
    theme: db.theme_settings,
    presets: db.theme_presets,
    menus: db.menus,
    sliders: db.sliders.filter((s) => s.is_active),
    kpis: [...db.kpis].sort((a, b) => a.sort_order - b.sort_order),
    banners: db.banners.filter((b) => b.is_active),
    categories: db.project_categories,
    partners: db.partners.filter((p) => p.is_active),
    services: [...db.services].sort((a, b) => a.sort_order - b.sort_order),
    company: db.settings.company,
    map: db.settings.map,
    seo: db.settings.seo,
    site: db.settings.site,
    is_authenticated: Boolean(req.authUser),
  });
});

router.get('/projects', (req, res) => {
  const db = getDb();
  const { category, year, client, location, contract_type, status, q, page = '1', per_page = '12' } = req.query;
  let list = db.projects.map((p) => ({
    ...p,
    category: db.project_categories.find((c) => c.id === p.category_id),
  }));

  if (category) list = list.filter((p) => p.category?.slug === category || String(p.category_id) === String(category));
  if (year) list = list.filter((p) => String(p.year) === String(year));
  if (client) list = list.filter((p) => p.client_name_fa.includes(String(client)) || p.client_name_en.toLowerCase().includes(String(client).toLowerCase()));
  if (location) list = list.filter((p) => p.location_fa.includes(String(location)));
  if (contract_type) list = list.filter((p) => p.contract_type_fa.includes(String(contract_type)));
  if (status) list = list.filter((p) => p.status === status);
  if (q) {
    const term = String(q).toLowerCase();
    list = list.filter((p) =>
      p.title_fa.toLowerCase().includes(term) ||
      p.title_en.toLowerCase().includes(term) ||
      p.client_name_fa.toLowerCase().includes(term) ||
      p.contract_number.toLowerCase().includes(term)
    );
  }

  const pageNum = Math.max(1, Number(page));
  const limit = Math.max(1, Number(per_page));
  const total = list.length;
  const items = list.slice((pageNum - 1) * limit, pageNum * limit);

  return res.json({ data: items, meta: { total, page: pageNum, per_page: limit, last_page: Math.ceil(total / limit) || 1 } });
});

router.get('/projects/:slug', (req, res) => {
  const db = getDb();
  const project = db.projects.find((p) => p.slug === req.params.slug || String(p.id) === req.params.slug);
  if (!project) return res.status(404).json({ message: 'پروژه مورد نظر یافت نشد.' });
  return res.json({
    data: {
      ...project,
      category: db.project_categories.find((c) => c.id === project.category_id),
    },
  });
});

router.get('/products', (_req, res) => res.json({ data: getDb().products }));
router.get('/services', (_req, res) => res.json({ data: getDb().services }));
router.get('/contracts', (_req, res) => res.json({ data: getDb().contracts }));
router.get('/licenses', (_req, res) => res.json({ data: getDb().licenses }));
router.get('/partners', (_req, res) => res.json({ data: getDb().partners }));
router.get('/departments', (_req, res) => {
  const db = getDb();
  return res.json({ data: { departments: db.departments, team: db.team_members } });
});
router.get('/articles', (_req, res) => res.json({ data: getDb().articles }));
router.get('/articles/:slug', (req, res) => {
  const article = getDb().articles.find((a) => a.slug === req.params.slug);
  if (!article) return res.status(404).json({ message: 'مقاله یافت نشد.' });
  return res.json({ data: article });
});
router.get('/pages/:slug', (req, res) => {
  const page = getDb().pages.find((p) => p.slug === req.params.slug);
  if (!page) return res.status(404).json({ message: 'صفحه یافت نشد.' });
  return res.json({ data: page });
});

router.get('/search', (req, res) => {
  const term = String(req.query.q || '').trim().toLowerCase();
  if (!term) return res.json({ projects: [], products: [], services: [], articles: [], licenses: [] });
  const db = getDb();
  return res.json({
    projects: db.projects.filter((p) => p.title_fa.toLowerCase().includes(term) || p.title_en.toLowerCase().includes(term) || p.client_name_fa.toLowerCase().includes(term)),
    products: db.products.filter((p) => p.name_fa.toLowerCase().includes(term) || p.name_en.toLowerCase().includes(term) || p.model_code.toLowerCase().includes(term)),
    services: db.services.filter((s) => s.title_fa.toLowerCase().includes(term) || s.title_en.toLowerCase().includes(term)),
    articles: db.articles.filter((a) => a.title_fa.toLowerCase().includes(term) || a.title_en.toLowerCase().includes(term)),
    licenses: db.licenses.filter((l) => l.title_fa.toLowerCase().includes(term) || l.code.toLowerCase().includes(term)),
  });
});

router.post('/contact', rateLimit(10, 60_000), (req: AuthedRequest, res) => {
  const { name, email, phone, company, subject, message, type = 'contact', attachment_url } = req.body || {};
  if (!name || !email || !subject || !message) {
    return res.status(422).json({ message: 'تکمیل فیلدهای نام، ایمیل، موضوع و شرح پیام الزامی است.' });
  }
  const db = getDb();
  const entry = {
    id: nextId(db.messages),
    name: sanitizeHtmlInput(String(name)),
    email: sanitizeHtmlInput(String(email)),
    phone: sanitizeHtmlInput(String(phone || '')),
    company: sanitizeHtmlInput(String(company || '')),
    subject: sanitizeHtmlInput(String(subject)),
    message: sanitizeHtmlInput(String(message)),
    type: (['contact', 'rfq', 'ticket'].includes(type) ? type : 'contact') as 'contact' | 'rfq' | 'ticket',
    attachment_url: attachment_url ? String(attachment_url) : undefined,
    status: 'new' as const,
    created_at: new Date().toISOString(),
  };
  db.messages.unshift(entry);
  db.notifications.unshift({
    id: nextId(db.notifications),
    user_id: 1,
    title_fa: entry.type === 'rfq' ? 'استعلام فنی (RFQ) جدید' : 'پیام تماس جدید',
    title_en: 'New Inquiry Received',
    body_fa: `${entry.name} (${entry.company || 'مهمان'}): ${entry.subject}`,
    body_en: `${entry.name}: ${entry.subject}`,
    channel: 'in_app',
    is_read: false,
    created_at: new Date().toISOString(),
  });
  logActivity(db, req.authUser || null, `message.${entry.type}_created`, 'ContactMessage', entry.subject, req.ip);
  saveDb(db);
  return res.status(201).json({ data: entry, message: 'درخواست شما با موفقیت ثبت شد.' });
});

router.get('/notifications', requireAuth, (req: AuthedRequest, res) => {
  const db = getDb();
  const items = db.notifications.filter((n) => n.user_id === null || n.user_id === req.authUser!.id);
  return res.json({ data: items });
});

router.post('/notifications/:id/read', requireAuth, (req: AuthedRequest, res) => {
  const db = getDb();
  const item = db.notifications.find((n) => n.id === Number(req.params.id));
  if (item) {
    item.is_read = true;
    saveDb(db);
  }
  return res.json({ ok: true });
});

export default router;
