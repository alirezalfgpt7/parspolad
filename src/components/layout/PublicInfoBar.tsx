import React from 'react';
import { Globe, Moon, Search, Sun } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.ts';
import { ExpandingSearchEffect } from '../effects/index.ts';
import { DynamicLucideIcon } from '../ui/LucideIconMap.tsx';
import { PersianClockBadge } from '../common/PersianClockBadge.tsx';

const socialNetworks = [
  { key: 'instagram_url', name: 'Instagram', icon: 'Instagram' },
  { key: 'linkedin_url', name: 'LinkedIn', icon: 'Linkedin' },
  { key: 'aparat_url', name: 'Aparat', icon: 'Clapperboard' },
  { key: 'telegram_url', name: 'Telegram', icon: 'Send' },
  { key: 'whatsapp_url', name: 'WhatsApp', icon: 'WhatsApp' },
] as const;

function safeSocialUrl(value: string | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

export const PublicInfoBar: React.FC = () => {
  const { bootstrap, language, colorMode, previewMode, toggleColorMode, setLanguage, setSearchOpen } = useAppStore();
  const effectiveColorMode = previewMode || colorMode;
  const company = bootstrap?.company;
  const site = bootstrap?.site;
  const showContactInfo = site?.info_bar_enabled !== false;

  const phone = showContactInfo && site?.info_bar_phone_enabled !== false
    ? site?.info_bar_phone?.trim()
      || company?.commercial_phone?.trim()
      || company?.office_phone?.trim()
      || company?.factory_phone?.trim()
      || ''
    : '';
  const phoneHref = phone.replace(/[^\d+]/g, '');
  const legacyLinks = socialNetworks.flatMap(({ key, ...network }, index) => {
    const url = company?.[key];
    return url ? [{ id: index + 1, ...network, url, is_active: true }] : [];
  });
  const configuredLinks = site?.social_links?.length ? site.social_links : legacyLinks;
  const links = showContactInfo
    ? configuredLinks.flatMap((network) => {
      const href = safeSocialUrl(network.url);
      return network.is_active && href ? [{ ...network, href }] : [];
    })
    : [];

  return (
    <div
      className="public-info-bar"
      style={{ color: 'var(--theme-header-text)' }}
    >
      <div className="mx-auto flex min-h-9 max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-1 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 text-[11px]">
          {phoneHref && (
            <a
              href={`tel:${phoneHref}`}
              className="public-info-phone inline-flex items-center gap-1.5 whitespace-nowrap opacity-95 transition-opacity hover:opacity-100"
              aria-label={language === 'fa' ? `تماس با ${phone}` : `Call ${phone}`}
            >
              <DynamicLucideIcon name={site?.info_bar_phone_icon || 'Phone'} fallback="Phone" className="h-3 w-3 text-(--theme-header-ink)" />
              <span dir="ltr">{phone}</span>
            </a>
          )}
          {phoneHref && links.length > 0 && (
            <span aria-hidden="true" className="mx-1 h-4 border-s border-current opacity-30" />
          )}
          {links.length > 0 && (
            <nav className="flex shrink-0 items-center gap-1" aria-label={language === 'fa' ? 'شبکه‌های اجتماعی' : 'Social networks'}>
              {links.map(({ id, name, icon, href }) => (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  title={name}
                  className="public-info-social inline-flex h-7 w-7 items-center justify-center rounded-full opacity-90 transition-all hover:opacity-100"
                >
                  <DynamicLucideIcon name={icon} fallback="Globe" className="h-3.5 w-3.5" />
                </a>
              ))}
            </nav>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1.5">
            <PersianClockBadge className="text-(--theme-header-text)" />
            <div className="hidden lg:block">
              <ExpandingSearchEffect
                placeholder={language === 'fa' ? 'جستجو در سایت...' : 'Search site...'}
                onTriggerSearch={() => setSearchOpen(true)}
              />
            </div>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="effect-navbar-control inline-flex h-7 min-w-7 items-center justify-center lg:hidden"
              aria-label={language === 'fa' ? 'جستجو' : 'Search'}
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={toggleColorMode}
              className="effect-navbar-control effect-theme-toggle inline-flex h-8 w-8 items-center justify-center"
              title="تغییر تم"
              aria-label="تغییر تم روشن و تیره"
            >
              {effectiveColorMode === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
              className="effect-navbar-control inline-flex h-8 w-8 items-center justify-center"
              aria-label={language === 'fa' ? 'Switch to English' : 'Change language to Persian'}
            >
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
