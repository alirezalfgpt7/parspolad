import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
import { Pagination } from './Pagination.tsx';

export type TableSortDirection = 'asc' | 'desc';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  align?: 'start' | 'end' | 'center';
  className?: string;
  sortKey?: string;
  sortValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: Array<(row: T) => string>;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (size: number) => void;
  currentPage?: number;
  lastPage?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  sortBy?: string;
  sortDirection?: TableSortDirection;
  onSortChange?: (sortBy: string, direction: TableSortDirection) => void;
  rowKey?: (row: T) => React.Key;
  loading?: boolean;
  emptyText?: React.ReactNode;
  actions?: React.ReactNode;
  mobileRenderer?: (row: T) => React.ReactNode;
  tableLabel?: string;
  showCount?: boolean;
}

const DEFAULT_PAGE_SIZES = [10, 20, 50] as const;

export function DataTable<T>({
  data,
  columns,
  searchKeys,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'جست‌وجو در جدول...',
  searchLabel = 'جست‌وجو در جدول',
  pageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  onPageSizeChange,
  currentPage,
  lastPage: remoteLastPage,
  total,
  onPageChange,
  sortBy,
  sortDirection,
  onSortChange,
  rowKey,
  loading = false,
  emptyText = 'داده‌ای برای نمایش وجود ندارد.',
  actions,
  mobileRenderer,
  tableLabel,
  showCount = true,
}: DataTableProps<T>) {
  const [uncontrolledSearch, setUncontrolledSearch] = useState('');
  const [uncontrolledSortBy, setUncontrolledSortBy] = useState<string | null>(null);
  const [uncontrolledSortDirection, setUncontrolledSortDirection] = useState<TableSortDirection>('asc');
  const [uncontrolledPage, setUncontrolledPage] = useState(1);
  const [uncontrolledPageSize, setUncontrolledPageSize] = useState(pageSize);
  const isRemote = Boolean(onPageChange);
  const query = onSearchChange ? (searchValue ?? '') : uncontrolledSearch;
  const activeSortBy = onSortChange ? sortBy ?? null : uncontrolledSortBy;
  const activeSortDirection = onSortChange ? sortDirection ?? 'asc' : uncontrolledSortDirection;
  const activePage = onPageChange ? currentPage ?? 1 : uncontrolledPage;
  const activePageSize = onPageSizeChange ? pageSize : uncontrolledPageSize;

  const filtered = useMemo(() => {
    let rows = data;
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!isRemote && normalizedQuery && searchKeys?.length) {
      rows = rows.filter((row) =>
        searchKeys.some((searchKey) => searchKey(row).toLocaleLowerCase().includes(normalizedQuery)),
      );
    }

    if (!isRemote && activeSortBy) {
      const column = columns.find((item) => item.key === activeSortBy || item.sortKey === activeSortBy);
      if (column?.sortValue) {
        rows = [...rows].sort((first, second) => {
          const firstValue = column.sortValue!(first);
          const secondValue = column.sortValue!(second);
          if (firstValue < secondValue) return activeSortDirection === 'asc' ? -1 : 1;
          if (firstValue > secondValue) return activeSortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    return rows;
  }, [data, query, isRemote, searchKeys, activeSortBy, activeSortDirection, columns]);

  const localLastPage = Math.max(1, Math.ceil(filtered.length / activePageSize));
  const lastPage = isRemote ? Math.max(1, remoteLastPage ?? 1) : localLastPage;
  const safePage = Math.min(activePage, lastPage);
  const visible = isRemote
    ? data
    : filtered.slice((safePage - 1) * activePageSize, safePage * activePageSize);
  const totalRows = isRemote ? (total ?? data.length) : filtered.length;
  const firstRow = totalRows === 0 ? 0 : (safePage - 1) * activePageSize + 1;
  const lastRow = Math.min(safePage * activePageSize, totalRows);
  const hasSearch = Boolean(onSearchChange || searchKeys?.length);
  const hasToolbar = hasSearch || Boolean(actions) || pageSizeOptions.length > 0;

  const handlePageChange = (nextPage: number) => {
    if (onPageChange) onPageChange(nextPage);
    else setUncontrolledPage(nextPage);
  };

  const handleSort = (column: Column<T>) => {
    if (onSortChange) {
      const key = column.sortKey ?? column.key;
      const direction = activeSortBy === key && activeSortDirection === 'asc' ? 'desc' : 'asc';
      onSortChange(key, direction);
      return;
    }
    if (!column.sortValue) return;
    const key = column.sortKey ?? column.key;
    if (activeSortBy === key) {
      setUncontrolledSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc');
    } else {
      setUncontrolledSortBy(key);
      setUncontrolledSortDirection('asc');
    }
    setUncontrolledPage(1);
  };

  const renderTable = (rows: T[], responsive = false) => (
    <div className={responsive ? 'hidden overflow-x-auto md:block' : 'overflow-x-auto'}>
      <table aria-label={tableLabel} className="w-full border-collapse text-start text-sm tabular-nums">
        <thead>
          <tr className="border-b border-(--theme-border) bg-(--theme-surface-muted) text-xs font-semibold text-(--theme-text-muted)">
            {columns.map((column) => {
              const sortKey = column.sortKey ?? column.key;
              const sortable = onSortChange ? Boolean(column.sortKey || column.sortValue) : Boolean(column.sortValue);
              const sorted = activeSortBy === sortKey;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={sortable && sorted ? activeSortDirection === 'asc' ? 'ascending' : 'descending' : undefined}
                  className={`whitespace-nowrap px-4 py-3 text-${column.align || 'start'} ${column.className || ''}`}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column)}
                      className="inline-flex items-center gap-1.5 transition-colors hover:text-(--theme-text)"
                    >
                      <span>{column.header}</span>
                      {sorted
                        ? activeSortDirection === 'asc'
                          ? <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                          : <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                        : <ArrowUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />}
                    </button>
                  ) : column.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-(--theme-border)">
          {loading ? (
            Array.from({ length: Math.min(activePageSize, 5) }, (_, index) => (
              <tr key={index} className="animate-pulse">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3.5">
                    <div className="h-4 w-3/4 rounded bg-(--theme-surface-muted)" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-(--theme-text-muted)">
                {emptyText}
              </td>
            </tr>
          ) : rows.map((row, index) => (
            <tr
              key={rowKey ? rowKey(row) : index}
              className="transition-colors duration-150 hover:bg-(--theme-surface-muted)/70"
            >
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-3.5 text-${column.align || 'start'} ${column.className || ''}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) text-(--theme-text) shadow-(--theme-card-shadow)">
      {hasToolbar && (
        <div className="flex flex-col gap-3 border-b border-(--theme-border) p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {hasSearch && (
              <label className="relative min-w-0 flex-1 sm:max-w-md">
                <Search className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--theme-placeholder)" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => {
                    if (onSearchChange) onSearchChange(event.target.value);
                    else {
                      setUncontrolledSearch(event.target.value);
                      setUncontrolledPage(1);
                    }
                  }}
                  placeholder={searchPlaceholder}
                  aria-label={searchLabel}
                  className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) py-2.5 pe-3 ps-10 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary) focus:ring-2 focus:ring-(--theme-primary)/15"
                />
              </label>
            )}
            {pageSizeOptions.length > 0 && (
              <label className="flex shrink-0 items-center gap-2 text-xs text-(--theme-text-muted)">
                <span>ردیف در صفحه</span>
                <select
                  value={activePageSize}
                  onChange={(event) => {
                    const nextPageSize = Number(event.target.value);
                    if (onPageSizeChange) onPageSizeChange(nextPageSize);
                    else setUncontrolledPageSize(nextPageSize);
                    handlePageChange(1);
                  }}
                  className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5 py-2 font-semibold text-(--theme-input-text) outline-none focus:border-(--theme-primary)"
                  aria-label="تعداد ردیف در هر صفحه"
                >
                  {pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </label>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}

      {showCount && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs text-(--theme-text-muted) sm:px-5">
          <span>
            {totalRows > 0
              ? `نمایش ${firstRow.toLocaleString('fa-IR')} تا ${lastRow.toLocaleString('fa-IR')} از ${totalRows.toLocaleString('fa-IR')}`
              : 'رکوردی برای نمایش نیست'}
          </span>
          {loading && <span aria-live="polite">در حال بارگذاری...</span>}
        </div>
      )}

      {mobileRenderer ? (
        <>
          {renderTable(visible, true)}
          <div className="space-y-3 p-3 md:hidden">
            {loading ? (
              Array.from({ length: Math.min(activePageSize, 4) }, (_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-xl bg-(--theme-surface-muted)" />
              ))
            ) : visible.length === 0 ? (
              <div className="px-3 py-10 text-center text-sm text-(--theme-text-muted)">{emptyText}</div>
            ) : visible.map((row, index) => (
              <React.Fragment key={rowKey ? rowKey(row) : index}>
                {mobileRenderer(row)}
              </React.Fragment>
            ))}
          </div>
        </>
      ) : renderTable(visible)}

      {lastPage > 1 && (
        <div className="border-t border-(--theme-border) px-4 pb-4 pt-1">
          <Pagination page={safePage} lastPage={lastPage} onChange={handlePageChange} />
        </div>
      )}
    </section>
  );
}
