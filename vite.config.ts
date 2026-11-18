import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'storage/logos/preloader.gif',
        ],
        manifest: {
          id: '/',
          name: 'شرکت پارس پولاد آقایی | Pars Poolad Aghaee',
          short_name: 'پارس پولاد',
          description: 'طراحی، ساخت، تأمین و اجرای تجهیزات سرچاهی و درون‌چاهی صنعت نفت، گاز و پتروشیمی',
          theme_color: '#B91C1C',
          background_color: '#F8FAFC',
          display: 'standalone',
          dir: 'rtl',
          lang: 'fa',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,gif,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          runtimeCaching: [
            // Uploaded media uses unique UUID URLs; only those are safe for CacheFirst.
            {
              urlPattern: ({ url }) =>
                url.origin === self.location.origin
                && /^\/(?:storage|images)\//.test(url.pathname)
                && /\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(url.pathname),
              handler: 'CacheFirst',
              options: {
                cacheName: 'public-media-immutable-images-v1',
                cacheableResponse: { statuses: [200] },
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                  purgeOnQuotaError: true,
                },
              },
            },
            {
              urlPattern: ({ url }) =>
                url.origin === self.location.origin
                && /^\/(?:storage|images)\//.test(url.pathname)
                && /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(url.pathname),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'public-media-images-v1',
                networkTimeoutSeconds: 3,
                fetchOptions: { cache: 'no-cache' },
                cacheableResponse: { statuses: [200] },
                expiration: {
                  maxEntries: 40,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                  purgeOnQuotaError: true,
                },
              },
            },
            {
              urlPattern: ({ url }) =>
                url.origin === self.location.origin
                && /^\/(?:storage|images)\//.test(url.pathname)
                && /\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:mp4|webm|ogv|ogg)$/i.test(url.pathname),
              handler: 'CacheFirst',
              options: {
                cacheName: 'public-media-immutable-videos-v1',
                cacheableResponse: { statuses: [200] },
                expiration: {
                  maxEntries: 2,
                  maxAgeSeconds: 7 * 24 * 60 * 60,
                  purgeOnQuotaError: true,
                },
                // Cache only full responses; this plugin serves video Range requests from them.
                rangeRequests: true,
              },
            },
            {
              urlPattern: ({ url }) =>
                url.origin === self.location.origin
                && /^\/(?:storage|images)\//.test(url.pathname)
                && /\.(?:mp4|webm|ogv|ogg)$/i.test(url.pathname),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'public-media-videos-v1',
                networkTimeoutSeconds: 3,
                fetchOptions: { cache: 'no-cache' },
                cacheableResponse: { statuses: [200] },
                expiration: {
                  maxEntries: 2,
                  maxAgeSeconds: 7 * 24 * 60 * 60,
                  purgeOnQuotaError: true,
                },
                rangeRequests: true,
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(import.meta.dirname, 'dist');
          const srcAssets = path.resolve(import.meta.dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          for (const entrypoint of ['index.php', '.htaccess']) {
            const backendEntrypoint = path.resolve(distDir, entrypoint);
            if (fs.existsSync(backendEntrypoint)) {
              fs.rmSync(backendEntrypoint);
            }
          }
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': process.env.LARAVEL_URL || 'http://127.0.0.1:8000',
        '/captcha': process.env.LARAVEL_URL || 'http://127.0.0.1:8000',
        '/storage': process.env.LARAVEL_URL || 'http://127.0.0.1:8000',
        '/sitemap.xml': process.env.LARAVEL_URL || 'http://127.0.0.1:8000',
        '/robots.txt': process.env.LARAVEL_URL || 'http://127.0.0.1:8000',
      },
    },
  };
});
