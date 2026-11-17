import React from 'react';
import { Breadcrumb } from '../ui/Breadcrumb.tsx';
import { BrandLogo } from './BrandLogo.tsx';
import { SeoHead } from './SeoHead.tsx';
import { useCmsPage } from '../../hooks/useCmsPage.ts';
import { sanitizeHtml } from '../../utils/sanitizeHtml.ts';

interface CmsPageIntroProps {
  slug: string;
  className?: string;
  titleClassName?: string;
  showContent?: boolean;
}

export const CmsPageIntro: React.FC<CmsPageIntroProps> = ({
  slug,
  className = 'mb-10',
  titleClassName = 'text-3xl font-extrabold text-slate-900 dark:text-white',
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
        <div className="flex flex-wrap items-center gap-4">
          {logoUrl && (
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <BrandLogo overrideUrl={logoUrl} alt={title} className="h-full w-full" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            {badge && (
              <span className="mb-1.5 inline-block rounded-md bg-(--theme-primary)/10 px-2.5 py-0.5 text-xs font-bold text-(--theme-primary)">
                {badge}
              </span>
            )}
            <h1 className={titleClassName}>{title}</h1>
          </div>
        </div>
        {subtitle && <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{subtitle}</p>}
        {showContent && content && (
          <div
            className="prose mt-3 max-w-none text-sm leading-relaxed text-slate-600 dark:prose-invert dark:text-slate-300"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
          />
        )}
      </header>
    </>
  );
};
