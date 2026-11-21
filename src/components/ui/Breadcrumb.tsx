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
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-(--theme-text-muted)">
      <Link
        to="/"
        className="flex items-center gap-1 transition-colors hover:text-(--theme-primary-ink)"
      >
        <Home className="h-3.5 w-3.5" />
        <span>{language === 'fa' ? 'خانه' : 'Home'}</span>
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <Sep className="h-3.5 w-3.5 opacity-60" />
          {item.to ? (
            <Link to={item.to} className="transition-colors hover:text-(--theme-primary-ink)">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-(--theme-text)">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
