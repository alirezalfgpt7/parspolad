import React, { useMemo, useState } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';
import { Pagination } from './Pagination.tsx';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'start' | 'end' | 'center';
  sortValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: Array<(row: T) => string>;
  searchPlaceholder?: string;
  pageSize?: number;
  loading?: boolean;
  emptyText?: string;
  actions?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  searchKeys,
  searchPlaceholder = 'جستجو در جدول...',
  pageSize = 8,
  loading = false,
  emptyText = 'داده‌ای برای نمایش وجود ندارد.',
  actions,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = data;
    if (q && searchKeys?.length) {
      list = data.filter((row) =>
        searchKeys.some((fn) => (fn(row) || '').toLowerCase().includes(q))
      );
    }
    if (sortCol) {
      const col = columns.find((c) => c.key === sortCol);
      if (col?.sortValue) {
        list = [...list].sort((a, b) => {
          const va = col.sortValue!(a);
          const vb = col.sortValue!(b);
          if (va < vb) return sortAsc ? -1 : 1;
          if (va > vb) return sortAsc ? 1 : -1;
          return 0;
        });
      }
    }
    return list;
  }, [data, query, searchKeys, sortCol, sortAsc, columns]);

  const lastPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, lastPage);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
        {searchKeys?.length ? (
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pe-3 ps-9 text-sm text-slate-900 focus:border-(--theme-primary) focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        ) : <div />}
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm tabular-nums">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-${col.align || 'start'} whitespace-nowrap`}
                >
                  {col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (sortCol === col.key) setSortAsc((s) => !s);
                        else {
                          setSortCol(col.key);
                          setSortAsc(true);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>{col.header}</span>
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                    </td>
                  ))}
                </tr>
              ))
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-slate-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              visible.map((row, idx) => (
                <tr
                  key={idx}
                  className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-${col.align || 'start'}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {lastPage > 1 && (
        <div className="border-t border-slate-200 px-4 pb-4 pt-1 dark:border-slate-800">
          <Pagination page={safePage} lastPage={lastPage} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
