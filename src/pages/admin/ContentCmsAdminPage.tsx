import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Article, Banner, KPI, PageContent, Product, Service } from '../../types/index.ts';
import { RichTextEditor } from '../../components/ui/RichTextEditor.tsx';

type Tab = 'pages' | 'services' | 'products' | 'articles' | 'banners' | 'kpis';

export const ContentCmsAdminPage: React.FC = () => {
  const { addToast, fetchBootstrap } = useAppStore();
  const [tab, setTab] = useState<Tab>('pages');
  const [pages, setPages] = useState<PageContent[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [editPage, setEditPage] = useState<PageContent | null>(null);
  const [newArticleTitle, setNewArticleTitle] = useState('');

  const load = async () => {
    const [pg, sv, pr, ar, bn, kp] = await Promise.all([
      apiRequest<{ data: PageContent[] }>('/admin/pages'),
      apiRequest<{ data: Service[] }>('/admin/services'),
      apiRequest<{ data: Product[] }>('/admin/products'),
      apiRequest<{ data: Article[] }>('/admin/articles'),
      apiRequest<{ data: Banner[] }>('/admin/banners'),
      apiRequest<{ data: KPI[] }>('/admin/kpis'),
    ]);
    setPages(pg.data);
    setServices(sv.data);
    setProducts(pr.data);
    setArticles(ar.data);
    setBanners(bn.data);
    setKpis(kp.data);
    if (!editPage && pg.data[0]) setEditPage(pg.data[0]);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'pages', label: 'صفحات داینامیک' },
    { key: 'services', label: 'خدمات مهندسی' },
    { key: 'products', label: 'محصولات' },
    { key: 'articles', label: 'اخبار و مقالات' },
    { key: 'banners', label: 'بنرها و CTA' },
    { key: 'kpis', label: 'شمارنده‌های آماری' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold ${
              tab === t.key ? 'bg-[var(--theme-primary)] text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pages' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-3">
            {pages.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setEditPage(p)}
                className={`block w-full rounded-xl border p-3.5 text-start text-xs font-bold ${
                  editPage?.id === p.id ? 'border-[var(--theme-primary)] bg-red-50/40 dark:bg-red-950/30' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                {p.title_fa}
              </button>
            ))}
          </div>
          {editPage && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 lg:col-span-9 dark:border-slate-800 dark:bg-slate-900">
              <input value={editPage.title_fa} onChange={(e) => setEditPage({ ...editPage, title_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-800" />
              <input value={editPage.subtitle_fa} onChange={(e) => setEditPage({ ...editPage, subtitle_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
              <RichTextEditor label="محتوای صفحه" value={editPage.content_fa} onChange={(html) => setEditPage({ ...editPage, content_fa: html })} />
              <button
                type="button"
                onClick={async () => {
                  await apiRequest(`/admin/pages/${editPage.id}`, { method: 'PUT', body: JSON.stringify(editPage) });
                  addToast('success', 'صفحه ذخیره شد.');
                  load();
                }}
                style={{ backgroundColor: 'var(--theme-primary)' }}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white"
              >
                <Save className="h-4 w-4" />
                <span>ذخیره تغییرات صفحه</span>
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'articles' && (
        <div className="space-y-4">
          <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <input value={newArticleTitle} onChange={(e) => setNewArticleTitle(e.target.value)} placeholder="عنوان مقاله یا خبر جدید..." className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <button
              type="button"
              onClick={async () => {
                if (!newArticleTitle.trim()) return;
                await apiRequest('/admin/articles', {
                  method: 'POST',
                  body: JSON.stringify({
                    slug: `news-${Date.now()}`,
                    title_fa: newArticleTitle,
                    title_en: newArticleTitle,
                    excerpt_fa: 'گزارش فنی شرکت پارس پولاد آقایی',
                    excerpt_en: 'Pars Poolad Technical Report',
                    content_fa: `<p>${newArticleTitle}</p>`,
                    content_en: `<p>${newArticleTitle}</p>`,
                    category_fa: 'اخبار شرکت',
                    category_en: 'Corporate News',
                    cover_image: '/storage/hero/hero-rig.jpg',
                    author_fa: 'روابط عمومی و مهندسی',
                    published_at: '1404/08/25',
                    read_minutes: 3,
                  }),
                });
                setNewArticleTitle('');
                load();
                addToast('success', 'مقاله منتشر شد.');
              }}
              style={{ backgroundColor: 'var(--theme-primary)' }}
              className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              <span>انتشار</span>
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <div key={a.id} className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <div className="text-sm font-bold">{a.title_fa}</div>
                  <div className="mt-1 text-xs text-slate-500">{a.published_at}</div>
                </div>
                <button type="button" onClick={async () => { await apiRequest(`/admin/articles/${a.id}`, { method: 'DELETE' }); load(); }} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(tab === 'services' || tab === 'products' || tab === 'banners' || tab === 'kpis') && (
        <div className="grid gap-4 sm:grid-cols-2">
          {((tab === 'services' ? services : tab === 'products' ? products : tab === 'banners' ? banners : kpis) as unknown as Array<Record<string, unknown>>).map((item) => (
            <div key={Number(item.id)} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-sm font-bold">{String(item.title_fa || item.name_fa || item.label_fa)}</div>
              <div className="mt-1 text-xs text-slate-500">
                {String(item.summary_fa || item.model_code || item.subtitle_fa || `مقدار فعلی: ${item.value} ${item.suffix_fa}`)}
              </div>
              {tab === 'kpis' && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={Number(item.value)}
                    id={`kpi-input-${item.id}`}
                    className="w-28 rounded-lg border border-slate-200 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const el = document.getElementById(`kpi-input-${item.id}`) as HTMLInputElement | null;
                      const nextVal = el ? Number(el.value) : Number(item.value);
                      if (!Number.isNaN(nextVal)) {
                        await apiRequest(`/admin/kpis/${item.id}`, { method: 'PUT', body: JSON.stringify({ value: nextVal }) });
                        await fetchBootstrap();
                        load();
                        addToast('success', 'آمار داشبورد بروزرسانی شد.');
                      }
                    }}
                    className="rounded-lg bg-[var(--theme-primary)] px-3 py-1 text-xs font-semibold text-white"
                  >
                    ذخیره KPI
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
