import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Language } from '../../../types/index.ts';

interface HomeSectionHeadingProps {
  eyebrow: string;
  title: string;
  actionLabel?: string;
  actionTo?: string;
  language: Language;
  align?: 'start' | 'between';
}

export const HomeSectionHeading: React.FC<HomeSectionHeadingProps> = ({
  eyebrow,
  title,
  actionLabel,
  actionTo,
  language,
  align = 'between',
}) => {
  const ArrowIcon = language === 'fa' ? ArrowLeft : ArrowRight;

  return (
    <div className={`mb-10 flex flex-wrap items-end gap-4 ${align === 'between' ? 'justify-between' : 'justify-start'}`}>
      <div>
        <p className="text-xs font-semibold text-(--theme-primary-ink)">{eyebrow}</p>
        <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-(--theme-text) sm:text-3xl" style={{ textWrap: 'balance' }}>
          {title}
        </h2>
      </div>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--theme-link) hover:underline whitespace-nowrap"
        >
          <span>{actionLabel}</span>
          <ArrowIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
};
