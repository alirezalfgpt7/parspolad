import React from 'react';
import { Clapperboard, Instagram, Linkedin, MessageCircle, Phone, Send } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.ts';

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
  const { bootstrap, language } = useAppStore();
  const company = bootstrap?.company;
  const site = bootstrap?.site;

  if (site?.info_bar_enabled === false) return null;

  const phone = site?.info_bar_phone?.trim()
    || company?.commercial_phone?.trim()
    || company?.office_phone?.trim()
    || company?.factory_phone?.trim()
    || '';
  const phoneHref = phone.replace(/[^\d+]/g, '');
  const links = socialNetworks
    .map(({ key, ...network }) => ({ ...network, href: safeSocialUrl(company?.[key]) }))
    .filter((network) => network.href);

  if (!phoneHref && links.length === 0) return null;

  return (
    <div
      className="border-b border-slate-200/70 dark:border-slate-800/80"
      style={{ backgroundColor: 'var(--theme-header-bg)', color: 'var(--theme-header-text)' }}
    >
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
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
      </div>
    </div>
  );
};
