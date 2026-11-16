import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.ts';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export const Breadcrumb: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  const language = useAppStore((s) => s.language);
  const Sep = language === 'fa' ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <Link
        to="/"
        className="flex items-center gap-1 transition-colors hover:text-[var(--theme-primary)]"
      >
        <Home className="h-3.5 w-3.5" />
        <span>{language === 'fa' ? 'خانه' : 'Home'}</span>
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <Sep className="h-3.5 w-3.5 opacity-60" />
          {item.to ? (
            <Link to={item.to} className="transition-colors hover:text-[var(--theme-primary)]">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
