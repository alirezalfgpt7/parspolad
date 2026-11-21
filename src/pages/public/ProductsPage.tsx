import React, { useEffect, useMemo, useState } from 'react';
import { Download, Layers } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Product } from '../../types/index.ts';
import { CmsPageIntro } from '../../components/common/CmsPageIntro.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';
import { AnimatedTabsEffect } from '../../components/effects/index.ts';

export const ProductsPage: React.FC = () => {
  const { language, addToast } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<Array<{ category_fa: string; category_en: string }>>([]);
  const [catFilter, setCatFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    apiRequest<{ data: Array<{ category_fa: string; category_en: string }> }>('/products/filters')
      .then((response) => setCategoryFilters(response.data))
      .catch((error: unknown) => addToast('error', error instanceof Error ? error.message : 'دریافت دسته‌های محصولات ناموفق بود.'));
  }, [addToast]);

  useEffect(() => {
    const query = new URLSearchParams({ page: String(page), per_page: '9' });
    if (catFilter) query.set('category', catFilter);
    apiRequest<{ data: Product[]; meta: { last_page: number } }>(`/products?${query.toString()}`)
      .then((response) => {
        setProducts(response.data);
        setLastPage(response.meta.last_page);
      })
      .catch((error: unknown) => addToast('error', error instanceof Error ? error.message : 'دریافت محصولات ناموفق بود.'));
  }, [catFilter, page, addToast]);

  const categories = useMemo(() => {
    return [
      { value: '', label: language === 'fa' ? 'همه دسته‌های تجهیزاتی' : 'All Categories' },
      ...categoryFilters.map((category) => ({
        value: language === 'fa' ? category.category_fa : category.category_en,
        label: language === 'fa' ? category.category_fa : category.category_en,
      })),
    ];
  }, [categoryFilters, language]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <CmsPageIntro slug="products" />

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="overflow-x-auto pb-1">
          <AnimatedTabsEffect
            items={categories.map((cat) => ({
              id: cat.value,
              label: cat.label,
              icon: <Layers className="h-3.5 w-3.5" />,
            }))}
            activeId={catFilter}
            onChange={(next) => {
              setCatFilter(next);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full shrink-0 sm:w-64">
          <SearchableSelect
            options={categories}
            value={catFilter}
            onChange={(value) => {
              setCatFilter(value);
              setPage(1);
            }}
            placeholder={language === 'fa' ? 'فیلتر بر اساس دسته فنی...' : 'Filter by category...'}
            allowClear
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((pr) => {
          const specs = language === 'fa' ? pr.specs || {} : pr.specs_en || pr.specs || {};
          return (
          <div
            key={pr.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) shadow-(--theme-card-shadow) transition hover:border-(--theme-card-border-hover) hover:shadow-(--theme-card-shadow-hover)"
          >
            <div className="h-56 bg-(--theme-surface-muted) p-4">
              <ZeroBrokenImage
                src={pr.image_url}
                alt={pr.name_fa}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-(--theme-text-muted)">
                  <span>{language === 'fa' ? pr.category_fa : pr.category_en}</span>
                  {pr.model_code && <span className="font-mono font-semibold">{pr.model_code}</span>}
                </div>
                <h2 className="mt-2 text-base font-bold text-(--theme-text)">
                  {language === 'fa' ? pr.name_fa : pr.name_en}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-(--theme-text-muted)">
                  {language === 'fa' ? pr.summary_fa : pr.summary_en}
                </p>
                {Object.keys(specs).length > 0 && (
                  <dl className="mt-4 space-y-1.5 border-t border-(--theme-border) pt-3 text-xs">
                    {Object.entries(specs).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-2">
                        <dt className="text-(--theme-text-muted)">{k}</dt>
                        <dd className="font-medium text-(--theme-text) tabular-nums">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
              {pr.catalog_url && (
                <a
                  href={pr.catalog_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) py-2 text-xs font-semibold text-(--theme-text) transition hover:border-(--theme-primary-ink) hover:text-(--theme-primary-ink)"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>دریافت کاتالوگ فنی PDF</span>
                </a>
              )}
            </div>
          </div>
          );
        })}
      </div>
      <Pagination page={page} lastPage={lastPage} onChange={setPage} />
    </div>
  );
};
