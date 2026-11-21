import React from 'react';
import { Breadcrumb } from '../ui/Breadcrumb.tsx';
import { BrandLogo } from './BrandLogo.tsx';
import { SeoHead } from './SeoHead.tsx';
import { useCmsPage } from '../../hooks/useCmsPage.ts';
import { sanitizeHtml } from '../../utils/sanitizeHtml.ts';
import { DecorativeCube, EffectText, WaveHeroEffect } from '../effects/index.ts';

interface CmsPageIntroProps {
  slug: string;
  className?: string;
  titleClassName?: string;
  showContent?: boolean;
}

export const CmsPageIntro: React.FC<CmsPageIntroProps> = ({
  slug,
  className = 'mb-10',
  titleClassName = 'text-3xl font-extrabold text-white',
  showContent = true,
}) => {
  const { page, title, subtitle, content, metaTitle, metaDescription, language, badge, logoUrl } = useCmsPage(slug);
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
        <div className="relative overflow-hidden rounded-3xl border border-(--theme-border) bg-slate-900 text-white">
          <div className="flex flex-wrap items-center justify-between gap-6 px-6 pt-8 pb-16 sm:px-10">
            <div className="flex min-w-0 items-center gap-5">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-slate-950 p-1 shadow-xl">
                <BrandLogo
                  placement="about"
                  overrideUrl={logoUrl || undefined}
                  alt={title}
                  className="h-full w-full"
                />
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold text-amber-400">
                  {badge || (language === 'fa' ? 'درباره ما' : 'About Us')}
                </p>
                <h1 className={titleClassName}>
                  <EffectText inverse>{title}</EffectText>
                </h1>
                {subtitle && (
                  <p className="mt-1.5 text-sm leading-7 text-slate-300">{subtitle}</p>
                )}
              </div>
            </div>
            <DecorativeCube
              size="lg"
              className="hidden h-20 w-20 shrink-0 rounded-2xl border border-white/15 bg-white/5 sm:block"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0">
            <WaveHeroEffect bottomFill="transparent" tintRgb="220 38 38" heightClassName="!h-12" />
          </div>
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
