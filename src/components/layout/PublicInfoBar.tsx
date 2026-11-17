import React from 'react';
import { Clapperboard, Instagram, Linkedin, MessageCircle, Phone, Search, Send } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.ts';
import { ExpandingSearchEffect, ThemeModeToggle } from '../effects/index.ts';

const socialNetworks = [
  { key: 'instagram_url', label: 'Instagram', Icon: Instagram },
  { key: 'linkedin_url', label: 'LinkedIn', Icon: Linkedin },
  { key: 'aparat_url', label: 'Aparat', Icon: Clapperboard },
  { key: 'telegram_url', label: 'Telegram', Icon: Send },
  { key: 'whatsapp_url', label: 'WhatsApp', Icon: MessageCircle },
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
  const { bootstrap, language, colorMode, toggleColorMode, setLanguage, setSearchOpen } = useAppStore();
  const company = bootstrap?.company;
  const site = bootstrap?.site;
  const showContactInfo = site?.info_bar_enabled !== false;

  const phone = showContactInfo
    ? site?.info_bar_phone?.trim()
      || company?.commercial_phone?.trim()
      || company?.office_phone?.trim()
      || company?.factory_phone?.trim()
      || ''
    : '';
  const phoneHref = phone.replace(/[^\d+]/g, '');
  const links = showContactInfo
    ? socialNetworks
      .map(({ key, ...network }) => ({ ...network, href: safeSocialUrl(company?.[key]) }))
      .filter((network) => network.href)
    : [];

  return (
    <div
      className="border-b border-slate-200/70 dark:border-slate-800/80"
      style={{ backgroundColor: 'var(--theme-header-bg)', color: 'var(--theme-header-text)' }}
    >
      <div className="mx-auto flex min-h-9 max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-1 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 text-[11px]">
          {phoneHref && (
            <a
              href={`tel:${phoneHref}`}
              dir="ltr"
              className="inline-flex items-center gap-1.5 whitespace-nowrap opacity-85 transition-opacity hover:opacity-100"
              aria-label={language === 'fa' ? `تماس با ${phone}` : `Call ${phone}`}
            >
              <Phone className="h-3 w-3 text-(--theme-primary)" aria-hidden="true" />
              <span>{phone}</span>
            </a>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1.5">
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
            <ThemeModeToggle
              dark={colorMode === 'dark'}
              onToggle={toggleColorMode}
              compact
              label={language === 'fa' ? 'تغییر حالت روشن/تاریک' : 'Toggle light/dark mode'}
            />
            <button
              type="button"
              onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
              className="effect-navbar-control inline-flex h-7 min-w-7 items-center justify-center gap-1 px-1.5 text-[9px] font-bold"
              aria-label={language === 'fa' ? 'Switch to English' : 'Change language to Persian'}
            >
              {language === 'fa' ? (
                <>
                  <span aria-hidden="true">🇬🇧</span>
                  <span>EN</span>
                </>
              ) : (
                <>
                  <span aria-hidden="true">🇮🇷</span>
                  <span>FA</span>
                </>
              )}
            </button>
          </div>
          {links.length > 0 && (
            <nav className="flex shrink-0 items-center gap-1" aria-label={language === 'fa' ? 'شبکه‌های اجتماعی' : 'Social networks'}>
              {links.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full opacity-75 transition-all hover:text-(--theme-primary) hover:opacity-100"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};
