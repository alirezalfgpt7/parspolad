import React, { useEffect, useState } from 'react';
import { ArrowUpRight, FileText, LayoutGrid, Newspaper, Package, PanelTop, Plus, Save, Sparkles, Wrench, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { PageContent } from '../../types/index.ts';
import { RichTextEditor } from '../../components/ui/RichTextEditor.tsx';
import { MediaUrlField } from '../../components/ui/MediaUrlField.tsx';
import { ContentRecordsAdminPage } from './ContentRecordsAdminPage.tsx';

type Tab = 'pages' | 'services' | 'products' | 'articles' | 'banners' | 'kpis';

const tabs: Array<{ key: Tab; label: string; description: string; icon: LucideIcon }> = [
  { key: 'pages', label: 'صفحات داینامیک', description: 'عنوان و محتوای معرفی صفحات عمومی', icon: FileText },
  { key: 'services', label: 'خدمات مهندسی', description: 'کارت‌های خدمات صفحهٔ اصلی و خدمات', icon: Wrench },
  { key: 'products', label: 'محصولات', description: 'کاتالوگ و فهرست محصولات سایت', icon: Package },
  { key: 'articles', label: 'اخبار و مقالات', description: 'مقالهٔ کامل، انتشار و تصویر کاور', icon: Newspaper },
  { key: 'banners', label: 'بنرها و CTA', description: 'انتخاب محل نمایش بنرهای سایت', icon: PanelTop },
  { key: 'kpis', label: 'شاخص‌های آماری', description: 'مقدار، آیکون و رنگ هر شاخص', icon: Sparkles },
];

const publicPagePaths: Record<string, string> = {
  about: '/about',
  'contracts-licenses': '/contracts-licenses',
  contact: '/contact',
  faq: '/faq',
  'home-spotlight': '/',
  legal: '/legal',
  news: '/news',
  'org-chart': '/org-chart',
  products: '/products',
  projects: '/projects',
  rfq: '/rfq',
  services: '/services',
  sitemap: '/sitemap',
};

export const ContentCmsAdminPage: React.FC = () => {
  const { addToast } = useAppStore();
  const [tab, setTab] = useState<Tab>('pages');
  const [pages, setPages] = useState<PageContent[]>([]);
  const [editPage, setEditPage] = useState<PageContent | null>(null);
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
    const pg = await apiRequest<{ data: PageContent[] }>('/admin/pages?per_page=100');
    setPages(pg.data);
    if (!editPage && pg.data[0]) setEditPage(pg.data[0]);
  };

  useEffect(() => {
    load().catch((error: unknown) => {
      addToast('error', error instanceof Error ? error.message : 'دریافت صفحات ناموفق بود.');
    });
  }, []);

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-linear-to-l from-white to-slate-50 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/70 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-(--theme-primary)/10 text-(--theme-primary)">
            <LayoutGrid className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-(--theme-primary)">Website content</p>
            <h1 className="mt-1 text-lg font-black text-slate-900 dark:text-white">مدیریت محتوای سایت</h1>
            <p className="mt-1.5 max-w-3xl text-xs leading-6 text-slate-500 dark:text-slate-400">
              از اینجا محتوای صفحات و بخش‌های اصلی سایت را مدیریت کنید. خدمات، محصولات، خبرها، بنرها و شاخص‌ها اکنون فهرست کامل، جست‌وجو، افزودن، ویرایش و حذف دارند.
            </p>
          </div>
        </div>
      </header>

      <nav aria-label="بخش‌های محتوای سایت" className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-3 xl:grid-cols-6">
        {tabs.map((t) => {
          const Icon = t.icon;
          const selected = tab === t.key;
          return (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-pressed={selected}
            className={`flex min-h-20 min-w-0 items-start gap-2 rounded-xl border p-2.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--theme-primary) ${
              selected
                ? 'border-(--theme-primary)/30 bg-(--theme-primary)/[0.07] text-(--theme-primary) dark:bg-(--theme-primary)/15'
                : 'border-transparent bg-slate-50/70 text-slate-600 hover:border-slate-200 hover:bg-white dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800'
            }`}
          >
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${selected ? 'bg-(--theme-primary) text-white' : 'bg-white text-slate-500 shadow-sm dark:bg-slate-900'}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold leading-5">{t.label}</span>
              <span className="mt-0.5 block text-[9px] leading-4 text-slate-400 dark:text-slate-500">{t.description}</span>
            </span>
          </button>
          );
        })}
      </nav>

      {tab === 'pages' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-3">
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-[11px] leading-5 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
              <strong className="block">صفحهٔ داینامیک یعنی چه؟</strong>
              عنوان و زیرعنوان اینجا در سربرگ معرفی همان صفحهٔ عمومی نمایش داده می‌شود؛ این بخش هدر اصلی سایت نیست.
            </div>
            {pages.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setEditPage(p)}
                className={`block w-full rounded-xl border p-3.5 text-start text-xs font-bold ${
                  editPage?.id === p.id ? 'border-(--theme-primary) bg-red-50/40 dark:bg-red-950/30' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <span className="block truncate">{p.title_fa}</span>
                <span className="mt-1 block truncate font-mono text-[10px] font-normal text-slate-400" dir="ltr">/{p.slug}</span>
              </button>
            ))}
            <Link
              to="/admin/content-records?resource=pages"
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-center text-[11px] font-bold text-slate-600 transition hover:border-(--theme-primary) hover:text-(--theme-primary) dark:border-slate-700 dark:text-slate-300"
            >
              <Plus className="h-4 w-4" />
              افزودن، حذف یا مدیریت همهٔ صفحات
            </Link>
          </div>
          {editPage && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 lg:col-span-9 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                <p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                  این رکورد محتوای معرفی مسیر موجود را تعیین می‌کند؛ ساخت رکورد جدید به‌تنهایی مسیر یا صفحهٔ تازه‌ای در سایت ایجاد نمی‌کند.
                </p>
                {publicPagePaths[editPage.slug] && (
                  <Link
                    to={publicPagePaths[editPage.slug]}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-(--theme-primary) hover:underline"
                  >
                    مشاهدهٔ صفحهٔ عمومی <ArrowUpRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 text-xs font-semibold">
                  عنوان سربرگ معرفی (فارسی)
                  <input value={editPage.title_fa} onChange={(e) => setEditPage({ ...editPage, title_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-800" />
                </label>
                <label className="space-y-1.5 text-xs font-semibold">
                  Page intro title (English)
                  <input dir="ltr" value={editPage.title_en} onChange={(e) => setEditPage({ ...editPage, title_en: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-800" />
                </label>
                <label className="space-y-1.5 text-xs font-semibold">
                  توضیح کوتاه سربرگ (فارسی)
                  <input value={editPage.subtitle_fa || ''} onChange={(e) => setEditPage({ ...editPage, subtitle_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
                </label>
                <label className="space-y-1.5 text-xs font-semibold">
                  Page intro subtitle (English)
                  <input dir="ltr" value={editPage.subtitle_en || ''} onChange={(e) => setEditPage({ ...editPage, subtitle_en: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
                </label>
              </div>
              {isHomeSpotlight && (
                <div className="space-y-2 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-[11px] leading-5 text-slate-600 dark:text-slate-300">
                  عنوان/نشان و لوگوی بخش ویژه در تنظیمات ظاهر است؛ تصاویر، توضیحات و دکمه‌های همین اسلاید در این فرم ویرایش می‌شوند.
                  <Link to="/admin/login-appearance" className="inline-flex items-center gap-1 font-bold text-(--theme-primary) hover:underline">
                    تنظیمات ظاهر و هدرهای صفحه <ArrowUpRight className="h-3 w-3" />
                  </Link>
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

      {tab !== 'pages' && (
        <>
          {tab === 'articles' && (
            <p className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-xs leading-6 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
              پیش از افزودن مقاله، دسته‌های فارسی و انگلیسی را تعریف کنید.
              {' '}
              <Link to="/admin/content-records?resource=article-categories" className="font-bold underline underline-offset-2">
                مدیریت دسته‌بندی اخبار و مقالات
              </Link>
            </p>
          )}
          <ContentRecordsAdminPage
            key={tab}
            initialResource={tab}
            lockedResource
            embedded
          />
        </>
      )}
    </div>
  );
};
