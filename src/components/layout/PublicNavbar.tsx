import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Globe, Search, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.ts';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';
import { DynamicLucideIcon } from '../ui/LucideIconMap.tsx';
import {
  AnimatedHamburger,
  EffectAction,
  EffectNavLink,
  ExpandingSearchEffect,
  ThemeModeToggle,
} from '../effects/index.ts';
import type { MenuItem } from '../../types/index.ts';

export const PublicNavbar: React.FC = () => {
  const { bootstrap, language, user, colorMode, previewMode, toggleColorMode, setLanguage, setSearchOpen } = useAppStore();
  const effectiveColorMode = previewMode || colorMode;
  const { pathname } = useLocation();
  const [activeMegaId, setActiveMegaId] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMobileMenuId, setExpandedMobileMenuId] = useState<number | null>(null);
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

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileOpen]);

  const headerMenu = bootstrap?.menus?.find((m) => m.key === 'header');
  const navItems: MenuItem[] = (headerMenu?.items || []).filter((i) => i.is_active);
  const companyName = language === 'fa' ? bootstrap?.company?.name_fa : bootstrap?.company?.name_en;
  const menuBrandName = companyName || (language === 'fa' ? 'شرکت پارس پولاد آقایی' : 'PARS POOLAD AGHAEE');
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
  const closeMobileMenu = () => {
    setMobileOpen(false);
    setExpandedMobileMenuId(null);
  };

  const activeMegaItem = navItems.find((i) => i.id === activeMegaId && i.children?.length);

  return (
    <>
    <header
      onMouseLeave={() => setActiveMegaId(null)}
      style={{ color: 'var(--theme-header-text)' }}
      data-scrolled={scrolled}
      className={`public-navbar ${pathname === '/' ? 'public-navbar--landing' : ''} transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled ? 'is-scrolled shadow-lg shadow-slate-950/10' : 'shadow-none'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 xl:gap-8 lg:px-8">
        {/* Zone 1: Menu control and brand */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5 lg:flex-none" dir={language === 'fa' ? 'rtl' : 'ltr'}>
          <button
            type="button"
            onClick={() => {
              setMobileOpen((open) => !open);
              setExpandedMobileMenuId(null);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--theme-header-ink)"
            style={{ color: 'var(--theme-header-ink)' }}
            aria-label={language === 'fa' ? 'منو' : 'Menu'}
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-menu"
          >
            <AnimatedHamburger open={mobileOpen} />
          </button>
          <Link
            to="/"
            dir={language === 'fa' ? 'rtl' : 'ltr'}
            className="flex min-w-0 items-center gap-2.5 text-lg font-extrabold tracking-tight"
          >
            <BrandLogo
              placement="about"
              alt={companyName ?? ''}
              className="h-9 w-9 shrink-0 rounded-lg"
            />
            <span className="max-w-[34vw] truncate text-xs sm:max-w-[42vw] sm:text-sm lg:max-w-none lg:text-lg">
              {companyName}
            </span>
          </Link>
        </div>

        {/* Zone 2: 4–5 Clean Single-Line Nav Links with Dynamic Mega Menu */}
        <nav className="hidden items-center gap-4 lg:flex">
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
                  className="!gap-1.5 !py-1 !text-[13px]"
                >
                  {item.icon && <DynamicLucideIcon name={item.icon} className="h-4 w-4 opacity-75" />}
                  <span>{label}</span>
                  {hasChildren && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
                </EffectNavLink>
              </div>
            );
          })}
        </nav>

        {/* Zone 3: Search, Theme Toggle, Login & Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          {pathname !== '/' && (
            <>
              <div className="hidden lg:block">
                <ExpandingSearchEffect
                  placeholder={language === 'fa' ? 'جستجو در سایت...' : 'Search site...'}
                  onTriggerSearch={() => setSearchOpen(true)}
                />
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="effect-navbar-control inline-flex h-8 w-8 items-center justify-center lg:hidden"
                aria-label={language === 'fa' ? 'جستجو' : 'Search'}
              >
                <Search className="h-4 w-4" aria-hidden="true" />
              </button>
              <ThemeModeToggle
                dark={effectiveColorMode === 'dark'}
                onToggle={toggleColorMode}
                compact
                label={language === 'fa' ? 'تغییر حالت روشن/تاریک' : 'Toggle light/dark mode'}
              />
              <button
                type="button"
                onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
                className="effect-navbar-control inline-flex h-8 w-8 items-center justify-center"
                aria-label={language === 'fa' ? 'Switch to English' : 'Change language to Persian'}
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          )}
          {!user && (
            <Link
              to="/login"
              className="hidden rounded-lg px-3 py-2 text-xs font-semibold opacity-85 transition-opacity hover:opacity-100 sm:inline-flex whitespace-nowrap"
            >
              {language === 'fa' ? 'ورود' : 'Login'}
            </Link>
          )}
          <div className="hidden sm:inline-flex">{renderCta()}</div>
        </div>
      </div>

      {/* Dynamic Mega Menu with Images */}
      {activeMegaItem && activeMegaItem.children && (
        <div
          key={activeMegaItem.id}
          className="theme-popover effect-dropdown-enter hidden border-t border-(--theme-header-border) bg-(--theme-surface) text-(--theme-text) shadow-xl lg:block"
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
                    className="group flex items-start gap-3.5 rounded-xl border border-(--theme-border) bg-(--theme-surface) p-3 transition-colors hover:border-(--theme-primary) hover:bg-(--theme-surface-muted)"
                  >
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-(--theme-surface-muted)">
                      <ZeroBrokenImage
                        src={child.image}
                        alt={language === 'fa' ? child.title_fa : child.title_en}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-(--theme-text) group-hover:text-(--theme-primary-ink)">
                        {language === 'fa' ? child.title_fa : child.title_en}
                      </div>
                      {(child.description_fa || child.description_en) && (
                        <p className="mt-1 line-clamp-2 text-xs text-(--theme-text-muted)">
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

    </header>
    {typeof document !== 'undefined' && createPortal(
      <>
        <button
          type="button"
          className="effect-mobile-menu-backdrop"
          data-open={mobileOpen}
          aria-label={language === 'fa' ? 'بستن منو' : 'Close menu'}
          aria-hidden={!mobileOpen}
          disabled={!mobileOpen}
          onClick={closeMobileMenu}
        />
        <aside
          id="public-mobile-menu"
          className="effect-mobile-menu"
          style={{ color: 'var(--theme-header-text)' }}
          data-open={mobileOpen}
          aria-hidden={!mobileOpen}
          inert={!mobileOpen}
        >
          <div className="effect-mobile-menu-header">
            <div className="effect-mobile-menu-brand">
              <BrandLogo
                placement="about"
                alt={menuBrandName}
                className="h-9 w-9 shrink-0 rounded-lg"
              />
              <span>{menuBrandName}</span>
            </div>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="effect-mobile-menu-close"
              aria-label={language === 'fa' ? 'بستن منو' : 'Close menu'}
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <nav className="effect-mobile-menu-nav" aria-label={language === 'fa' ? 'فهرست اصلی' : 'Main menu'}>
            {navItems.map((item) => {
              const label = language === 'fa' ? item.title_fa : item.title_en;
              const hasChildren = Boolean(item.children?.length);
              const expanded = expandedMobileMenuId === item.id;

              return (
                <div key={item.id} className="effect-mobile-menu-item">
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        className="effect-mobile-menu-link effect-mobile-menu-group"
                        onClick={() => setExpandedMobileMenuId(expanded ? null : item.id)}
                        aria-expanded={expanded}
                        aria-controls={`public-mobile-group-${item.id}`}
                      >
                        <span className="flex items-center gap-2">
                          {item.icon && <DynamicLucideIcon name={item.icon} className="h-4 w-4" />}
                          <span>{label}</span>
                        </span>
                        <ChevronDown className="effect-mobile-menu-chevron" aria-hidden="true" />
                      </button>
                      <div
                        id={`public-mobile-group-${item.id}`}
                        className="effect-mobile-submenu"
                        data-open={expanded}
                        aria-hidden={!expanded}
                        inert={!expanded}
                      >
                        <div className="effect-mobile-submenu-inner">
                          {item.children?.map((child) => (
                            <Link
                              key={child.id}
                              to={child.url}
                              onClick={closeMobileMenu}
                              aria-current={pathname === child.url ? 'page' : undefined}
                              className="effect-mobile-menu-link effect-mobile-menu-child"
                            >
                              {language === 'fa' ? child.title_fa : child.title_en}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      to={item.url}
                      onClick={closeMobileMenu}
                      aria-current={pathname === item.url ? 'page' : undefined}
                      className="effect-mobile-menu-link"
                    >
                      <span className="flex items-center gap-2">
                        {item.icon && <DynamicLucideIcon name={item.icon} className="h-4 w-4" />}
                        <span>{label}</span>
                      </span>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="effect-mobile-menu-footer">
            <Link
              to={user ? '/admin' : '/login'}
              onClick={closeMobileMenu}
              className="effect-mobile-menu-action effect-mobile-menu-action-primary"
            >
              {user ? (language === 'fa' ? 'پنل مدیریت' : 'Admin') : (language === 'fa' ? 'ورود' : 'Login')}
            </Link>
            {!user && renderCta()}
          </div>
        </aside>
      </>,
      document.body,
    )}
    </>
  );
};
