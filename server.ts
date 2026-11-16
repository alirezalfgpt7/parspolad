import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDb } from './server/db.ts';
import { attachAuth, securityHeaders } from './server/middleware.ts';
import adminRoutes from './server/routesAdmin.ts';
import authRoutes from './server/routesAuth.ts';
import publicRoutes from './server/routesPublic.ts';

dotenv.config();

const NOOP_VITE_CLIENT = `
const sheetsMap = new Map();
export function updateStyle(id, content) {
  if (typeof document === 'undefined') return;
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
    sheetsMap.set(id, style);
  } else if (style.textContent !== content) {
    style.textContent = content;
  }
}
export function removeStyle(id) {
  if (typeof document === 'undefined') return;
  const style = sheetsMap.get(id);
  if (style && style.parentNode) {
    style.parentNode.removeChild(style);
    sheetsMap.delete(id);
  }
}
export function createHotContext() {
  return {
    accept() {},
    prune() {},
    dispose() {},
    decline() {},
    invalidate() {},
    on() {},
    off() {},
    send() {},
  };
}
export function injectQuery(url) { return url; }
export class ErrorOverlay extends HTMLElement {}
`;

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
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
    const disableHmr =
      process.env.DISABLE_HMR === 'true' ||
      Boolean(process.env.K_SERVICE || process.env.APP_URL?.includes('.run.app'));

    if (disableHmr) {
      app.get('/@vite/client', (_req, res) => {
        res.type('application/javascript').send(NOOP_VITE_CLIENT);
      });
    }

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: disableHmr ? false : { server: httpServer },
        ws: disableHmr ? false : { server: httpServer },
        watch: disableHmr ? null : {},
      },
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

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Pars Poolad Aghaee full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
