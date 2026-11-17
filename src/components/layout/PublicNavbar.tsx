import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.ts';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';
import { AnimatedHamburger, EffectAction, EffectNavLink } from '../effects/index.ts';
import type { MenuItem } from '../../types/index.ts';

export const PublicNavbar: React.FC = () => {
  const { bootstrap, language, user, toggleColorMode, setLanguage, setSearchOpen } = useAppStore();
  const { pathname } = useLocation();
  const [activeMegaId, setActiveMegaId] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrolledState = () => {
      const next = window.scrollY > 8;
      setScrolled((current) => current === next ? current : next);
    };

    updateScrolledState();
    window.addEventListener('scroll', updateScrolledState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrolledState);
  }, []);

  const headerMenu = bootstrap?.menus?.find((m) => m.key === 'header');
  const navItems: MenuItem[] = (headerMenu?.items || []).filter((i) => i.is_active);
  const companyName = language === 'fa' ? bootstrap?.company?.name_fa : bootstrap?.company?.name_en;
  const configuredCtaUrl = bootstrap?.site?.header_cta_url || '/rfq';
  const ctaUrl = configuredCtaUrl.startsWith('/') && !configuredCtaUrl.startsWith('//')
    ? configuredCtaUrl
    : /^https?:\/\//i.test(configuredCtaUrl) ? configuredCtaUrl : '/rfq';
  const ctaLabel = user
    ? language === 'fa' ? 'پنل مدیریت' : 'Dashboard'
    : language === 'fa'
      ? bootstrap?.site?.header_cta_text_fa || 'درخواست همکاری'
      : bootstrap?.site?.header_cta_text_en || 'Request Quote';
  const ctaClassName = 'rounded-lg px-4 py-2 text-xs font-semibold shadow-xs transition-opacity hover:opacity-90 whitespace-nowrap';
  const ctaStyle = { backgroundColor: 'var(--theme-btn-bg)', color: 'var(--theme-btn-text)' };
  const renderCta = () => ctaUrl.startsWith('/')
    ? <EffectAction as={Link} to={user ? '/admin' : ctaUrl} style={ctaStyle} className={ctaClassName}>{ctaLabel}</EffectAction>
    : <EffectAction as="a" href={user ? '/admin' : ctaUrl} rel="noreferrer" style={ctaStyle} className={ctaClassName}>{ctaLabel}</EffectAction>;

  const activeMegaItem = navItems.find((i) => i.id === activeMegaId && i.children?.length);

  return (
    <header
      onMouseLeave={() => setActiveMegaId(null)}
      style={{
        backgroundColor: 'var(--theme-header-bg)',
        color: 'var(--theme-header-text)',
      }}
      data-scrolled={scrolled}
      className={`sticky top-0 z-40 border-b border-slate-200/80 backdrop-blur-md transition-shadow duration-300 dark:border-slate-800 ${
        scrolled ? 'shadow-lg shadow-slate-950/5' : 'shadow-none'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark (single line, clean) */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight whitespace-nowrap shrink-0"
        >
          <ZeroBrokenImage
            src={bootstrap?.company?.logo_small_url || '/storage/logos/logo-small.png'}
            alt={companyName ?? ''}
            className="h-8 w-8 object-contain"
          />
          <span>{companyName}</span>
        </Link>

        {/* Zone 2: 4–5 Clean Single-Line Nav Links with Dynamic Mega Menu */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => {
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const label = language === 'fa' ? item.title_fa : item.title_en;
            return (
              <div
                key={item.id}
                onMouseEnter={() => setActiveMegaId(hasChildren ? item.id : null)}
                className="relative py-4"
              >
                <EffectNavLink
                  to={item.url}
                  aria-current={pathname === item.url ? 'page' : undefined}
                >
                  <span>{label}</span>
                  {hasChildren && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
                </EffectNavLink>
              </div>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action CTA */}
        <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="effect-search-toggle hidden rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:inline-flex dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label={language === 'fa' ? 'جستجو در سایت' : 'Search the site'}
            >
              <Search className="h-4 w-4 shrink-0" />
              <span>{language === 'fa' ? 'جستجو' : 'Search'}</span>
            </button>
          {!user && (
            <Link
              to="/login"
              className="hidden rounded-lg px-3 py-2 text-xs font-semibold opacity-80 transition-opacity hover:opacity-100 sm:inline-flex whitespace-nowrap"
            >
              {language === 'fa' ? 'ورود' : 'Login'}
            </Link>
          )}
          <div className="hidden sm:inline-flex">{renderCta()}</div>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 lg:hidden dark:border-slate-700"
            aria-label="منو"
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-menu"
          >
            <AnimatedHamburger open={mobileOpen} />
          </button>
        </div>
      </div>

      {/* Dynamic Mega Menu with Images */}
      {activeMegaItem && activeMegaItem.children && (
        <div
          key={activeMegaItem.id}
          className="effect-dropdown-enter hidden border-t border-slate-200 bg-white shadow-xl lg:block dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-8 py-6 sm:grid-cols-2 lg:grid-cols-4">
            {activeMegaItem.children.map((child, index) => (
              <div
                key={child.id}
                className="effect-dropdown-item"
                style={{ animationDelay: `${index * 35}ms` }}
              >
                  <Link
                    to={child.url}
                    onClick={() => setActiveMegaId(null)}
                    className="group flex items-start gap-3.5 rounded-xl border border-slate-100 p-3 transition-colors hover:border-(--theme-primary) hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  >
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                      <ZeroBrokenImage
                        src={child.image}
                        alt={language === 'fa' ? child.title_fa : child.title_en}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 group-hover:text-(--theme-primary) dark:text-slate-100">
                        {language === 'fa' ? child.title_fa : child.title_en}
                      </div>
                      {(child.description_fa || child.description_en) && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                          {language === 'fa' ? child.description_fa : child.description_en}
                        </p>
                      )}
                    </div>
                  </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      <div
        id="public-mobile-menu"
        className="effect-mobile-menu border-t border-slate-200 bg-white px-4 lg:hidden dark:border-slate-800 dark:bg-slate-900"
        data-open={mobileOpen}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <div
          className="overflow-hidden py-0 transition-[padding] duration-200"
          data-open={mobileOpen}
        >
          <div className="space-y-2">
            {navItems.map((item) => (
              <div key={item.id} className="border-b border-slate-100 pb-2 dark:border-slate-800">
                <Link
                  to={item.url}
                  onClick={() => setMobileOpen(false)}
                  className="block py-1.5 text-sm font-semibold"
                >
                  {language === 'fa' ? item.title_fa : item.title_en}
                </Link>
                {item.children && (
                  <div className="mt-1 space-y-1 ps-3">
                    {item.children.map((ch) => (
                      <Link
                        key={ch.id}
                        to={ch.url}
                        onClick={() => setMobileOpen(false)}
                        className="block py-1 text-xs text-slate-500 dark:text-slate-400"
                      >
                        {language === 'fa' ? ch.title_fa : ch.title_en}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700"
            >
              {language === 'fa' ? 'جستجو' : 'Search'}
            </button>
            <button
              type="button"
              onClick={toggleColorMode}
              className="effect-theme-toggle rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700"
            >
              {language === 'fa' ? 'تغییر تم تیره/روشن' : 'Dark / Light'}
            </button>
            <button
              type="button"
              onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700"
            >
              {language === 'fa' ? 'English' : 'فارسی'}
            </button>
            <Link
              to={user ? '/admin' : '/login'}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg bg-(--theme-primary) px-3 py-1.5 text-xs font-semibold text-white"
            >
              {user ? (language === 'fa' ? 'پنل مدیریت' : 'Admin') : (language === 'fa' ? 'ورود' : 'Login')}
            </Link>
            {!user && renderCta()}
          </div>
        </div>
      </div>
    </header>
  );
};
