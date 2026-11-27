import React, { useEffect, useMemo, useState } from 'react';
import { Layers } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Product } from '../../types/index.ts';
import { CmsPageIntro } from '../../components/common/CmsPageIntro.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { AnimatedTabsEffect } from '../../components/effects/index.ts';
import { ProductCard } from '../../components/public/ProductCard.tsx';

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
    const query = new URLSearchParams({ page: String(page), per_page: '12' });
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

      <div
        className="mb-8 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]"
        dir={language === 'fa' ? 'rtl' : 'ltr'}
      >
        <aside className="min-w-0 space-y-3">
          <SearchableSelect
            options={categories}
            value={catFilter}
            onChange={(value) => {
              setCatFilter(value);
              setPage(1);
            }}
            placeholder={language === 'fa' ? 'همه دسته‌های تجهیزاتی' : 'All equipment categories'}
            searchPlaceholder={language === 'fa' ? 'جستجوی دسته...' : 'Search categories...'}
            label={language === 'fa' ? 'فیلتر سریع' : 'Quick filter'}
            allowClear
          />
          <AnimatedTabsEffect
            ariaLabel={language === 'fa' ? 'دسته‌بندی محصولات' : 'Product categories'}
            dir={language === 'fa' ? 'rtl' : 'ltr'}
            orientation="vertical"
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
        </aside>

        <section className="min-w-0">
          <div id="products-list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} language={language} />
            ))}
          </div>
          <Pagination page={page} lastPage={lastPage} onChange={setPage} />
        </section>
      </div>
    </div>
  );
};
