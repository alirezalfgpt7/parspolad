import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/i18n.ts';

interface PaginationProps {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, lastPage, onChange }) => {
  if (lastPage <= 1) return null;
  const pages: Array<number | 'left-ellipsis' | 'right-ellipsis'> = lastPage <= 7
    ? Array.from({ length: lastPage }, (_, i) => i + 1)
    : page <= 4
      ? [1, 2, 3, 4, 5, 'right-ellipsis', lastPage]
      : page >= lastPage - 3
        ? [1, 'left-ellipsis', lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage]
        : [1, 'left-ellipsis', page - 1, page, page + 1, 'right-ellipsis', lastPage];

  return (
    <div className="mt-6 flex items-center justify-center gap-1.5 tabular-nums">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        aria-label="صفحه قبل"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      {pages.map((p) => p === 'left-ellipsis' || p === 'right-ellipsis' ? (
        <span key={p} className="px-1 text-slate-500" aria-hidden="true">…</span>
      ) : (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={cn(
            'flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-colors',
            p === page
              ? 'border-(--theme-primary) bg-(--theme-primary) text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
          )}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= lastPage}
        onClick={() => onChange(page + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        aria-label="صفحه بعد"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    </div>
  );
};
