import React from 'react';
import { Breadcrumb } from '../ui/Breadcrumb.tsx';
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
  const { page, title, subtitle, content, metaTitle, metaDescription } = useCmsPage(slug);
  if (!page) return null;

  return (
    <>
      <SeoHead title={metaTitle} description={metaDescription} />
      <Breadcrumb items={[{ label: title }]} />
      <header className={className}>
        <h1 className={titleClassName}>{title}</h1>
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
