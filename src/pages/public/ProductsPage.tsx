import React, { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Product } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';

export const ProductsPage: React.FC = () => {
  const language = useAppStore((s) => s.language);
  const [products, setProducts] = useState<Product[]>([]);
  const [catFilter, setCatFilter] = useState('');

  useEffect(() => {
    apiRequest<{ data: Product[] }>('/products').then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  const categories = useMemo(() => {
    const uniq = Array.from(new Set(products.map((p) => p.category_fa)));
    return [{ value: '', label: 'همه دسته‌های تجهیزاتی' }, ...uniq.map((c) => ({ value: c, label: c }))];
  }, [products]);

  const filtered = useMemo(
    () => (catFilter ? products.filter((p) => p.category_fa === catFilter) : products),
    [products, catFilter]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoHead title={language === 'fa' ? 'محصولات و توانمندی‌های تجهیزاتی' : 'Products'} />
      <Breadcrumb items={[{ label: language === 'fa' ? 'محصولات و تجهیزات' : 'Products' }]} />

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {language === 'fa' ? 'محصولات و تجهیزات استراتژیک نفت و گاز' : 'Strategic Oilfield Products'}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {language === 'fa'
              ? 'تجهیزات سرچاهی API 6A، انواع لاینر هنگر، پکرهای تولیدی و ادوات تمیزکاری چاه'
              : 'API 6A Wellheads, Liner Hangers, Production Packers & Cleanout Tools'}
          </p>
        </div>
        <div className="w-full sm:w-72">
          <SearchableSelect
            options={categories}
            value={catFilter}
            onChange={setCatFilter}
            placeholder="فیلتر بر اساس دسته فنی..."
            allowClear
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((pr) => (
          <div
            key={pr.id}
            className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="h-56 bg-slate-50 p-4 dark:bg-slate-800/50">
              <ZeroBrokenImage
                src={pr.image_url}
                alt={pr.name_fa}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>{language === 'fa' ? pr.category_fa : pr.category_en}</span>
                  <span className="font-mono font-semibold">{pr.model_code}</span>
                </div>
                <h2 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                  {language === 'fa' ? pr.name_fa : pr.name_en}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {language === 'fa' ? pr.summary_fa : pr.summary_en}
                </p>
                <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                  {Object.entries(pr.specs).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-2">
                      <dt className="text-slate-500">{k}</dt>
                      <dd className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {pr.catalog_url && (
                <a
                  href={pr.catalog_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] dark:border-slate-700 dark:text-slate-200"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>دریافت کاتالوگ فنی PDF</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
