import React from 'react';
import { Breadcrumb } from '../ui/Breadcrumb.tsx';
import { BrandLogo } from './BrandLogo.tsx';
import { SeoHead } from './SeoHead.tsx';
import { useCmsPage } from '../../hooks/useCmsPage.ts';
import { sanitizeHtml } from '../../utils/sanitizeHtml.ts';
import { WaveHeroEffect } from '../effects/WaveHeroEffect.tsx';
import { DynamicLucideIcon } from '../ui/LucideIconMap.tsx';
import { useAppStore } from '../../store/useAppStore.ts';
import { DEFAULT_PUBLIC_PAGE_TITLE_SETTINGS } from '../../utils/brandingDefaults.ts';

interface CmsPageIntroProps {
  slug: string;
  className?: string;
  titleClassName?: string;
  showContent?: boolean;
}

export const CmsPageIntro: React.FC<CmsPageIntroProps> = ({
  slug,
  className = 'mb-10',
  titleClassName = 'text-3xl font-extrabold',
  showContent = true,
}) => {
  const { page, title, subtitle, content, metaTitle, metaDescription, language, badge, logoUrl } = useCmsPage(slug);
  const theme = useAppStore((state) => state.previewTheme || state.bootstrap?.theme);
  const titleSettings = {
    ...DEFAULT_PUBLIC_PAGE_TITLE_SETTINGS,
    ...theme?.public_page_title_settings,
  };
  if (!page) return null;

  return (
    <>
      <SeoHead
        title={metaTitle}
        description={metaDescription}
        image={page.meta_image || undefined}
        canonicalUrl={page.canonical_url || undefined}
        language={language}
      />
      <Breadcrumb items={[{ label: title }]} />
      <header className={className}>
        <div
          className="relative overflow-hidden border"
          style={{
            backgroundColor: titleSettings.background_color,
            borderColor: titleSettings.border_color,
            borderRadius: `${titleSettings.radius}px`,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-6 px-6 pt-8 pb-16 sm:px-10">
            <div className="flex min-w-0 items-center gap-5">
              <div
                className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border p-1 shadow-xl"
                style={{
                  backgroundColor: titleSettings.icon_background_color,
                  borderColor: titleSettings.border_color,
                }}
              >
                <BrandLogo
                  placement="about"
                  overrideUrl={logoUrl || undefined}
                  alt={title}
                  className="h-full w-full"
                />
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold" style={{ color: titleSettings.wave_color }}>
                  {badge || (language === 'fa' ? 'درباره ما' : 'About Us')}
                </p>
                <h1 className={titleClassName} style={{ color: titleSettings.title_color }}>{title}</h1>
                {subtitle && (
                  <p className="mt-1.5 text-sm leading-7" style={{ color: titleSettings.subtitle_color }}>{subtitle}</p>
                )}
              </div>
            </div>
            <div
              className="hidden h-20 w-20 shrink-0 place-items-center rounded-2xl border sm:grid"
              style={{
                color: titleSettings.icon_color,
                backgroundColor: titleSettings.icon_background_color,
                borderColor: titleSettings.border_color,
              }}
            >
              <DynamicLucideIcon name={titleSettings.icon_name} className="h-9 w-9" />
            </div>
          </div>
          {titleSettings.wave_enabled && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0">
              <WaveHeroEffect
                bottomFill="transparent"
                tintColor={titleSettings.wave_color}
                heightClassName="!h-12"
              />
            </div>
          )}
        </div>
        {showContent && content && (
          <div
            className="prose mt-5 max-w-none text-sm leading-relaxed text-(--theme-text-muted) dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
          />
        )}
      </header>
    </>
  );
};
