import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Article, Banner, KPI, PageContent, Product, Service } from '../../types/index.ts';
import { RichTextEditor } from '../../components/ui/RichTextEditor.tsx';
import { PersianDatePicker, gregorianToJalali } from '../../components/ui/PersianDatePicker.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { MediaUrlField } from '../../components/ui/MediaUrlField.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';

type Tab = 'pages' | 'services' | 'products' | 'articles' | 'banners' | 'kpis';

const getTodayJalali = (): string => {
  const date = new Date();
  const localDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

  return gregorianToJalali(localDate);
};

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
  const [newArticleDate, setNewArticleDate] = useState(getTodayJalali);
  const [deleteArticle, setDeleteArticle] = useState<Article | null>(null);
  const [deletingArticle, setDeletingArticle] = useState(false);
  const [savingPage, setSavingPage] = useState(false);
  const isHomeSpotlight = editPage?.slug === 'home-spotlight';
  const getPageMetadataText = (key: string): string => {
    const value = editPage?.metadata?.[key];
    return typeof value === 'string' ? value : '';
  };
  const updatePageMetadata = (key: string, value: string) => {
    setEditPage((current) =>
      current
        ? {
            ...current,
            metadata: { ...(current.metadata || {}), [key]: value },
          }
        : current,
    );
  };

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

  const confirmDeleteArticle = async () => {
    if (!deleteArticle) return;

    setDeletingArticle(true);
    try {
      await apiRequest(`/admin/articles/${deleteArticle.id}`, { method: 'DELETE' });
      setDeleteArticle(null);
      await load();
      addToast('success', 'مقاله حذف شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف مقاله ناموفق بود.');
    } finally {
      setDeletingArticle(false);
    }
  };

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
              tab === t.key ? 'bg-(--theme-primary) text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
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
                  editPage?.id === p.id ? 'border-(--theme-primary) bg-red-50/40 dark:bg-red-950/30' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                {p.title_fa}
              </button>
            ))}
          </div>
          {editPage && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 lg:col-span-9 dark:border-slate-800 dark:bg-slate-900">
              <input aria-label="عنوان فارسی صفحه" value={editPage.title_fa} onChange={(e) => setEditPage({ ...editPage, title_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-800" />
              <input aria-label="عنوان انگلیسی صفحه" dir="ltr" value={editPage.title_en} onChange={(e) => setEditPage({ ...editPage, title_en: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-800" />
              <input aria-label="زیرعنوان فارسی صفحه" value={editPage.subtitle_fa} onChange={(e) => setEditPage({ ...editPage, subtitle_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
              <input aria-label="زیرعنوان انگلیسی صفحه" dir="ltr" value={editPage.subtitle_en} onChange={(e) => setEditPage({ ...editPage, subtitle_en: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
              {isHomeSpotlight && (
                <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-[11px] leading-5 text-slate-600 dark:text-slate-300">
                  عنوان و نشان اصلی این بخش و لوگوی آن از «تنظیمات ظاهر ← متون و لوگوها ← بخش ویژه صفحه اصلی» تنظیم می‌شوند. تصاویر اسلایدی، متن توضیحات و دکمه‌ها را در همین فرم ویرایش کنید.
                </div>
              )}
              <MediaUrlField
                label="تصویر کاور / پیش‌نمایش صفحه (Meta Image)"
                value={editPage.meta_image || ''}
                onChange={(url) => setEditPage({ ...editPage, meta_image: url })}
                folder="pages"
                accept=".jpg,.jpeg,.png,.webp,.gif"
                placeholder="/storage/hero/hero-banner.jpg"
              />
              {isHomeSpotlight && (
                <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <h3 className="text-sm font-bold">محتوای بخش ویژه صفحه اصلی</h3>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <MediaUrlField
                      label="تصویر اسلاید اول"
                      value={getPageMetadataText('image_url')}
                      onChange={(url) => updatePageMetadata('image_url', url)}
                      folder="pages"
                      accept=".jpg,.jpeg,.png,.webp,.gif"
                      placeholder="/storage/hero/home-spotlight-1.jpg"
                    />
                    <MediaUrlField
                      label="تصویر اسلاید دوم"
                      value={getPageMetadataText('secondary_image_url')}
                      onChange={(url) => updatePageMetadata('secondary_image_url', url)}
                      folder="pages"
                      accept=".jpg,.jpeg,.png,.webp,.gif"
                      placeholder="/storage/hero/home-spotlight-2.jpg"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {([
                      ['primary_link', 'پیوند دکمه اصلی'],
                      ['primary_label_fa', 'متن دکمه اصلی (فارسی)'],
                      ['primary_label_en', 'متن دکمه اصلی (انگلیسی)'],
                      ['secondary_link', 'پیوند دکمه دوم'],
                      ['secondary_label_fa', 'متن دکمه دوم (فارسی)'],
                      ['secondary_label_en', 'متن دکمه دوم (انگلیسی)'],
                    ] as const).map(([key, label]) => (
                      <label key={key} className="block space-y-1">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{label}</span>
                        <input
                          type="text"
                          dir={key.endsWith('_en') || key.endsWith('_link') ? 'ltr' : 'rtl'}
                          value={getPageMetadataText(key)}
                          onChange={(event) => updatePageMetadata(key, event.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800"
                        />
                      </label>
                    ))}
                  </div>
                  <MediaUrlField
                    label="تصویر پس‌زمینه بخش معرفی"
                    value={getPageMetadataText('section_background_url')}
                    onChange={(url) => updatePageMetadata('section_background_url', url)}
                    folder="pages"
                    accept=".jpg,.jpeg,.png,.webp"
                    placeholder="/storage/hero/home-spotlight-background.jpg"
                    hint="در صورت خالی بودن، رنگ پس‌زمینه انتخاب‌شده نمایش داده می‌شود."
                  />
                  <label className="block space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                    <span className="flex items-center justify-between text-[11px] font-semibold">
                      <span>تیرگی روی تصویر پس‌زمینه</span>
                      <span>{getPageMetadataText('section_background_overlay_opacity') || '35'}%</span>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={getPageMetadataText('section_background_overlay_opacity') || '35'}
                      onChange={(event) => updatePageMetadata('section_background_overlay_opacity', event.target.value)}
                      className="w-full accent-(--theme-primary)"
                    />
                  </label>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <RichTextEditor
                      label="توضیحات بخش (فارسی)"
                      value={editPage.content_fa}
                      onChange={(html) => setEditPage({ ...editPage, content_fa: html })}
                    />
                    <RichTextEditor
                      label="Section description (English)"
                      value={editPage.content_en}
                      onChange={(html) => setEditPage({ ...editPage, content_en: html })}
                    />
                  </div>
                </div>
              )}
              {!isHomeSpotlight && (
                <RichTextEditor
                  label="محتوای صفحه"
                  value={editPage.content_fa}
                  onChange={(html) => setEditPage({ ...editPage, content_fa: html })}
                />
              )}
              <button
                type="button"
                disabled={savingPage}
                onClick={async () => {
                  setSavingPage(true);
                  try {
                    await apiRequest(`/admin/pages/${editPage.id}`, { method: 'PUT', body: JSON.stringify(editPage) });
                    addToast('success', 'صفحه ذخیره شد.');
                    await load();
                  } catch (error) {
                    addToast('error', error instanceof Error ? error.message : 'ذخیره صفحه ناموفق بود.');
                  } finally {
                    setSavingPage(false);
                  }
                }}
                style={{ backgroundColor: 'var(--theme-primary)' }}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                <span>{savingPage ? 'در حال ذخیره...' : 'ذخیره تغییرات صفحه'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'articles' && (
        <div className="space-y-4">
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[1fr_220px_auto]">
            <input value={newArticleTitle} onChange={(e) => setNewArticleTitle(e.target.value)} placeholder="عنوان مقاله یا خبر جدید..." className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <label className="text-xs">
              تاریخ انتشار
              <PersianDatePicker value={newArticleDate} onChange={setNewArticleDate} className="mt-1" />
            </label>
            <button
              type="button"
              onClick={async () => {
                if (!newArticleTitle.trim() || !newArticleDate) {
                  addToast('error', 'عنوان و تاریخ انتشار را وارد کنید.');
                  return;
                }
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
                    published_at: newArticleDate,
                    read_minutes: 3,
                  }),
                });
                setNewArticleTitle('');
                setNewArticleDate(getTodayJalali());
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
              <div key={a.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3 min-w-0">
                  {a.cover_image && (
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                      <ZeroBrokenImage src={a.cover_image} alt={a.title_fa} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">{a.title_fa}</div>
                    <div className="mt-1 text-xs text-slate-500">{a.published_at}</div>
                  </div>
                </div>
                <button type="button" onClick={() => setDeleteArticle(a)} className="shrink-0 text-red-600" aria-label="حذف مقاله"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(tab === 'services' || tab === 'products' || tab === 'banners' || tab === 'kpis') && (
        <div className="grid gap-4 sm:grid-cols-2">
          {((tab === 'services' ? services : tab === 'products' ? products : tab === 'banners' ? banners : kpis) as unknown as Array<Record<string, unknown>>).map((item) => {
            const thumb = typeof item.image_url === 'string' ? item.image_url : '';
            return (
              <div key={Number(item.id)} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3">
                  {thumb && (
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
                      <ZeroBrokenImage src={thumb} alt={String(item.title_fa || item.name_fa || '')} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{String(item.title_fa || item.name_fa || item.label_fa)}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {String(item.summary_fa || item.model_code || item.subtitle_fa || `مقدار فعلی: ${item.value} ${item.suffix_fa}`)}
                    </div>
                  </div>
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
                    className="rounded-lg bg-(--theme-primary) px-3 py-1 text-xs font-semibold text-white"
                  >
                    ذخیره KPI
                  </button>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleteArticle)}
        onClose={() => setDeleteArticle(null)}
        onConfirm={confirmDeleteArticle}
        message="آیا از حذف این مقاله اطمینان دارید؟"
        loading={deletingArticle}
      />
    </div>
  );
};
