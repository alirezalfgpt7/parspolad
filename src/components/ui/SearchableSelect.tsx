import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, LoaderCircle, Search, X } from 'lucide-react';
import { cn } from '../../utils/i18n.ts';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  allowClear?: boolean;
  className?: string;
  disabled?: boolean;
  serverSearch?: boolean;
  onSearchChange?: (query: string) => void;
  searchLoading?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'انتخاب کنید...',
  searchPlaceholder = 'جستجو در گزینه‌ها...',
  label,
  allowClear = false,
  className,
  disabled = false,
  serverSearch = false,
  onSearchChange,
  searchLoading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  const filtered = useMemo(() => {
    if (serverSearch) return options;
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel && o.sublabel.toLowerCase().includes(q))
    );
  }, [options, query, serverSearch]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 20);
      onSearchChange?.('');
    } else {
      setQuery('');
      onSearchChange?.('');
    }
  }, [open, onSearchChange]);

  return (
    <div ref={containerRef} className={cn('relative min-w-0 w-full', className)}>
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-(--theme-text)">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex min-h-10.5 min-w-0 w-full items-center justify-between gap-2 rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-start text-sm text-(--theme-input-text) transition-colors hover:border-(--theme-border-strong) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--theme-primary)',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <span className={cn('min-w-0 flex-1 truncate', !selected && 'text-(--theme-placeholder)')}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {allowClear && value && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                  onChange('');
                }
              }}
              className="rounded p-0.5 text-(--theme-text-muted) hover:bg-(--theme-surface-muted) hover:text-(--theme-text)"
              aria-label="پاک کردن"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown className={cn('h-4 w-4 text-(--theme-text-muted) transition-transform', open && 'rotate-180')} />
        </span>
      </button>

      {open && (
        <div
          className="theme-popover absolute inset-x-0 z-50 mt-1.5 min-w-0 overflow-hidden rounded-lg border border-(--theme-border) bg-(--theme-surface) text-(--theme-text) shadow-lg"
        >
          {/* Mandatory Search Box on the First Row */}
          <div className="flex items-center gap-2 border-b border-(--theme-border) bg-(--theme-surface-muted) px-3 py-2">
            {searchLoading
              ? <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-(--theme-placeholder)" />
              : <Search className="h-4 w-4 shrink-0 text-(--theme-placeholder)" />}
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onSearchChange?.(e.target.value);
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs text-(--theme-input-text) placeholder:text-(--theme-placeholder) focus:outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {searchLoading ? (
              <li className="px-3 py-3 text-center text-xs text-(--theme-text-muted)" role="status">
                در حال جست‌وجو...
              </li>
            ) : filtered.length === 0 ? (
              <li className="px-3 py-3 text-center text-xs text-(--theme-text-muted)">
                موردی یافت نشد
              </li>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm text-(--theme-text) transition-colors hover:bg-(--theme-surface-muted)',
                        isSelected && 'bg-(--theme-surface-muted) font-semibold text-(--theme-primary-ink)'
                      )}
                    >
                      <span className="min-w-0 truncate">
                        {opt.label}
                        {opt.sublabel && (
                          <span className="ms-2 inline-block max-w-[45%] truncate align-bottom text-xs font-normal text-(--theme-text-muted)">
                            {opt.sublabel}
                          </span>
                        )}
                      </span>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-(--theme-primary-ink)" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
