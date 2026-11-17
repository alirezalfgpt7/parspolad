import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, MapPin, Moon, Phone, Search, Sun, UserCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.ts';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';
import { PWAInstallButton } from '../common/PWAInstallButton.tsx';

export const PublicFooter: React.FC = () => {
  const { bootstrap, language, colorMode, toggleColorMode, setLanguage, setSearchOpen, user } =
    useAppStore();

  const company = bootstrap?.company;
  const footerMenu = bootstrap?.menus?.find((m) => m.key === 'footer');

  return (
    <footer
      style={{
        backgroundColor: 'var(--theme-footer-bg)',
        color: 'var(--theme-footer-text)',
      }}
      className="border-t border-slate-800 pt-12 pb-8"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ZeroBrokenImage
                src={company?.logo_url || company?.logo_small_url || '/storage/logos/logo-small.png'}
                alt={language === 'fa' ? company?.name_fa || '' : company?.name_en || ''}
                className="h-10 max-w-36 rounded bg-white p-1 object-contain"
              />
              <span className="text-base font-extrabold">
                {language === 'fa' ? company?.name_fa : company?.name_en}
              </span>
            </div>
            <p className="text-xs leading-relaxed opacity-80">
              {language === 'fa' ? company?.slogan_fa : company?.slogan_en}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10"
              >
                <Search className="h-3.5 w-3.5" />
                <span>{language === 'fa' ? 'جستجو' : 'Search'}</span>
              </button>
              <button
                type="button"
                onClick={toggleColorMode}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10"
              >
                {colorMode === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                <span>{colorMode === 'dark' ? (language === 'fa' ? 'حالت روشن' : 'Light') : (language === 'fa' ? 'حالت تاریک' : 'Dark')}</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10"
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
            <ul className="space-y-2.5 text-xs opacity-85">
              {(footerMenu?.items || []).map((item) => (
                <li key={item.id}>
                  <Link to={item.url} className="transition-opacity hover:opacity-100 hover:underline">
                    {language === 'fa' ? item.title_fa : item.title_en}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={user ? '/admin' : '/login'}
                  className="inline-flex items-center gap-1.5 font-semibold text-amber-400 hover:underline"
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

          <div className="space-y-3 text-xs opacity-85">
            <h4 className="mb-4 text-sm font-bold opacity-100">
              {language === 'fa' ? 'اطلاعات تماس اهواز' : 'Contact Information'}
            </h4>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-(--theme-primary)" />
              <span>
                <strong>{language === 'fa' ? 'کارخانه:' : 'Plant:'}</strong>{' '}
                {language === 'fa' ? company?.factory_address_fa : company?.factory_address_en}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <span>
                <strong>{language === 'fa' ? 'دفتر مرکزی:' : 'HQ:'}</strong>{' '}
                {language === 'fa' ? company?.office_address_fa : company?.office_address_en}
              </span>
            </p>
            <p className="flex items-center gap-2 tabular-nums">
              <Phone className="h-4 w-4 shrink-0" />
              <span dir="ltr">{company?.factory_phone} / {company?.office_phone}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <span>{company?.office_email}</span>
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold">
              {language === 'fa' ? 'آخرین به‌روزرسانی و نصب اپلیکیشن' : 'Updates & Web App'}
            </h4>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs leading-relaxed">
              <div className="font-semibold text-amber-300">
                {language === 'fa' ? 'آخرین به‌روزرسانی کاتالوگ و سوابق:' : 'Latest Catalog Update:'}
              </div>
              <div className="mt-1 opacity-85">
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

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs opacity-70 sm:flex-row">
          <p>{language === 'fa' ? company?.footer_note_fa : company?.footer_note_en}</p>
          <div className="flex items-center gap-4">
            <Link to="/sitemap" className="hover:underline">{language === 'fa' ? 'نقشه سایت' : 'Sitemap'}</Link>
            <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:underline">XML</a>
            <Link to="/legal" className="hover:underline">{language === 'fa' ? 'حریم خصوصی' : 'Privacy'}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
