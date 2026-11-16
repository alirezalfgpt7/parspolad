import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDb } from './server/db.ts';
import { attachAuth, securityHeaders } from './server/middleware.ts';
import adminRoutes from './server/routesAdmin.ts';
import authRoutes from './server/routesAuth.ts';
import publicRoutes from './server/routesPublic.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // Initialize database on startup (creates initial seed + super admin if empty)
  getDb();

  app.use(securityHeaders);
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));
  app.use(attachAuth);

  // Serve public/storage statically in both dev and prod
  const storageDir = path.resolve(process.cwd(), 'public/storage');
  if (fs.existsSync(storageDir)) {
    app.use('/storage', express.static(storageDir));
  }

  // API v1 routes (mirroring Laravel api/v1 structure)
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1', publicRoutes);

  // Dynamic XML Sitemap & Robots.txt
  app.get('/sitemap.xml', (req, res) => {
    const db = getDb();
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const staticPaths = ['/', '/about', '/services', '/products', '/projects', '/contracts-licenses', '/org-chart', '/news', '/contact', '/rfq', '/faq', '/legal', '/sitemap'];
    const urls = [
      ...staticPaths.map((p) => `${baseUrl}${p}`),
      ...db.projects.map((p) => `${baseUrl}/projects/${p.slug}`),
      ...db.articles.map((a) => `${baseUrl}/news/${a.slug}`),
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${u}</loc><changefreq>weekly</changefreq></url>`)
      .join('\n')}\n</urlset>`;
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  });

  app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.setHeader('Content-Type', 'text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${baseUrl}/sitemap.xml\n`);
  });

  // Vite middleware in dev, static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pars Poolad Aghaee full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
