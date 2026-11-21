import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, MapPin, Phone, Search, UserCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.ts';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { PWAInstallButton } from '../common/PWAInstallButton.tsx';
import { ThemeModeToggle, WaveHeroEffect } from '../effects/index.ts';

export const PublicFooter: React.FC = () => {
  const { bootstrap, language, colorMode, previewMode, toggleColorMode, setLanguage, setSearchOpen, user } =
    useAppStore();
  const effectiveColorMode = previewMode || colorMode;

  const company = bootstrap?.company;
  const footerMenu = bootstrap?.menus?.find((m) => m.key === 'footer');

  return (
    <footer
      style={{
        backgroundColor: 'var(--theme-footer-bg)',
        borderColor: 'var(--theme-footer-border)',
        color: 'var(--theme-footer-text)',
      }}
      className="relative overflow-hidden border-t pt-14 pb-8"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 opacity-25">
        <WaveHeroEffect
          flipVertical
          bottomFill="var(--theme-footer-bg)"
          tintRgb="148 163 184"
          heightClassName="!h-9 sm:!h-12"
        />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BrandLogo
                placement="footer"
                alt={language === 'fa' ? company?.name_fa || '' : company?.name_en || ''}
                className="h-11 max-w-36 rounded bg-(--theme-footer-logo-bg) p-1"
              />
              <span className="text-base font-extrabold">
                {language === 'fa' ? company?.name_fa : company?.name_en}
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--theme-footer-muted)' }}>
              {language === 'fa' ? company?.slogan_fa : company?.slogan_en}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                style={{
                  borderColor: 'var(--theme-footer-border)',
                  backgroundColor: 'var(--theme-footer-surface)',
                  color: 'var(--theme-footer-text)',
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition hover:opacity-85"
              >
                <Search className="h-3.5 w-3.5" />
                <span>{language === 'fa' ? 'جستجو' : 'Search'}</span>
              </button>
              <ThemeModeToggle
                dark={effectiveColorMode === 'dark'}
                onToggle={toggleColorMode}
                label={effectiveColorMode === 'dark' ? (language === 'fa' ? 'حالت روشن' : 'Light') : (language === 'fa' ? 'حالت تاریک' : 'Dark')}
                className="rounded-lg border border-(--theme-footer-border) bg-(--theme-footer-surface) px-2.5 py-1 text-xs text-(--theme-footer-text) transition hover:opacity-85"
              />
              <button
                type="button"
                onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
                style={{
                  borderColor: 'var(--theme-footer-border)',
                  backgroundColor: 'var(--theme-footer-surface)',
                  color: 'var(--theme-footer-text)',
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition hover:opacity-85"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{language === 'fa' ? 'EN' : 'FA'}</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold">
              {language === 'fa' ? 'دسترسی سریع و پرتال' : 'Quick Links & Portal'}
            </h4>
            <ul className="space-y-2.5 text-xs" style={{ color: 'var(--theme-footer-muted)' }}>
              {(footerMenu?.items || []).map((item) => (
                <li key={item.id}>
                  <Link to={item.url} className="transition-colors hover:text-(--theme-footer-text) hover:underline">
                    {language === 'fa' ? item.title_fa : item.title_en}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={user ? '/admin' : '/login'}
                  style={{ color: 'var(--theme-footer-accent)' }}
                  className="inline-flex items-center gap-1.5 font-semibold hover:underline"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>
                    {user
                      ? language === 'fa' ? 'ورود به پنل مدیریت' : 'Admin Dashboard'
                      : language === 'fa' ? 'ورود همکاران و کارفرمایان' : 'Portal Login'}
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3 text-xs" style={{ color: 'var(--theme-footer-muted)' }}>
            <h4 className="mb-4 text-sm font-bold" style={{ color: 'var(--theme-footer-text)' }}>
              {language === 'fa' ? 'اطلاعات تماس اهواز' : 'Contact Information'}
            </h4>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--theme-footer-accent)' }} />
              <span>
                <strong style={{ color: 'var(--theme-footer-text)' }}>{language === 'fa' ? 'کارخانه:' : 'Plant:'}</strong>{' '}
                {language === 'fa' ? company?.factory_address_fa : company?.factory_address_en}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--theme-footer-accent)' }} />
              <span>
                <strong style={{ color: 'var(--theme-footer-text)' }}>{language === 'fa' ? 'دفتر مرکزی:' : 'HQ:'}</strong>{' '}
                {language === 'fa' ? company?.office_address_fa : company?.office_address_en}
              </span>
            </p>
            <p className="flex items-center gap-2 tabular-nums">
              <Phone className="h-4 w-4 shrink-0" style={{ color: 'var(--theme-footer-accent)' }} />
              <span dir="ltr">{company?.factory_phone} / {company?.office_phone}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" style={{ color: 'var(--theme-footer-accent)' }} />
              <span>{company?.office_email}</span>
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold">
              {language === 'fa' ? 'آخرین به‌روزرسانی و نصب اپلیکیشن' : 'Updates & Web App'}
            </h4>
            <div
              className="rounded-xl border p-3.5 text-xs leading-relaxed"
              style={{
                borderColor: 'var(--theme-footer-border)',
                backgroundColor: 'var(--theme-footer-surface)',
              }}
            >
              <div className="font-semibold" style={{ color: 'var(--theme-footer-accent)' }}>
                {language === 'fa' ? 'آخرین به‌روزرسانی کاتالوگ و سوابق:' : 'Latest Catalog Update:'}
              </div>
              <div className="mt-1" style={{ color: 'var(--theme-footer-muted)' }}>
                {language === 'fa' ? company?.last_updated_fa : company?.last_updated_en}
                {' · '}
                {language === 'fa' ? company?.standards_fa : company?.standards_en}
              </div>
              <div className="mt-3">
                <PWAInstallButton />
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row"
          style={{ borderColor: 'var(--theme-footer-border)', color: 'var(--theme-footer-muted)' }}
        >
          <p>{language === 'fa' ? company?.footer_note_fa : company?.footer_note_en}</p>
          <div className="flex items-center gap-4">
            <Link to="/sitemap" className="hover:text-(--theme-footer-text) hover:underline">{language === 'fa' ? 'نقشه سایت' : 'Sitemap'}</Link>
            <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-(--theme-footer-text) hover:underline">XML</a>
            <Link to="/legal" className="hover:text-(--theme-footer-text) hover:underline">{language === 'fa' ? 'حریم خصوصی' : 'Privacy'}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
