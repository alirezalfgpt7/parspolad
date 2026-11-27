import React, { useEffect, useState } from 'react';
import { ArrowUpRight, FileText, LayoutGrid, ListFilter, PanelTop, Plus, Save, Sparkles, Wrench, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { PageContent } from '../../types/index.ts';
import { RichTextEditor } from '../../components/ui/RichTextEditor.tsx';
import { MediaUrlField } from '../../components/ui/MediaUrlField.tsx';
import { ContentRecordsAdminPage } from './ContentRecordsAdminPage.tsx';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.tsx';
import { HomepageSectionsSettingsEditor } from '../../components/admin/HomepageSectionsSettingsEditor.tsx';
import { normalizeHomepageSectionsSettings } from '../../utils/homepageSections.ts';

type Tab = 'pages' | 'services' | 'banners' | 'kpis' | 'sections';

const tabs: Array<{ key: Tab; label: string; description: string; icon: LucideIcon }> = [
  { key: 'pages', label: 'صفحات داینامیک', description: 'عنوان و محتوای معرفی صفحات عمومی', icon: FileText },
  { key: 'services', label: 'خدمات مهندسی', description: 'کارت‌های خدمات صفحهٔ اصلی و خدمات', icon: Wrench },
  { key: 'banners', label: 'بنرها و CTA', description: 'انتخاب محل نمایش بنرهای سایت', icon: PanelTop },
  { key: 'kpis', label: 'شاخص‌های آماری', description: 'مقدار، آیکون و رنگ هر شاخص', icon: Sparkles },
  { key: 'sections', label: 'منبع و تعداد نمایش', description: 'منابع و چیدمان بخش‌های صفحهٔ خانه', icon: ListFilter },
];

const publicPagePaths: Record<string, string> = {
  about: '/about',
  'contracts-licenses': '/contracts-licenses',
  contact: '/contact',
  faq: '/faq',
  'home-spotlight': '/#home-spotlight',
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
  const { addToast, bootstrap } = useAppStore();
  const [tab, setTab] = useState<Tab>('pages');
  const [pages, setPages] = useState<PageContent[]>([]);
  const [editPage, setEditPage] = useState<PageContent | null>(null);
  const [homeSpotlightPage, setHomeSpotlightPage] = useState<PageContent | null>(null);
  const [homeSections, setHomeSections] = useState(() => normalizeHomepageSectionsSettings(null));
  const [savingPage, setSavingPage] = useState(false);
  const isHomeSpotlight = editPage?.slug === 'home-spotlight';
  const getPageMetadataText = (key: string, fallback = ''): string => {
    const value = editPage?.metadata?.[key];
    return typeof value === 'string' ? value : fallback;
  };
  const updatePageMetadataValue = (key: string, value: unknown) => {
    setEditPage((current) =>
      current
        ? {
            ...current,
            metadata: { ...(current.metadata || {}), [key]: value },
          }
        : current,
    );
  };
  const updatePageMetadata = (key: string, value: string) => {
    updatePageMetadataValue(key, value);
  };

  const load = async () => {
    const pg = await apiRequest<{ data: PageContent[] }>('/admin/pages?per_page=100');
    setPages(pg.data);
    setEditPage((current) => current
      ? pg.data.find((page) => page.id === current.id) || current
      : pg.data[0] || null);
    const homePage = pg.data.find((page) => page.slug === 'home-spotlight') || null;
    setHomeSpotlightPage(homePage);
    setHomeSections(normalizeHomepageSectionsSettings(homePage?.metadata?.home_sections));
  };

  useEffect(() => {
    load().catch((error: unknown) => {
      addToast('error', error instanceof Error ? error.message : 'دریافت صفحات ناموفق بود.');
    });
  }, []);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        icon={LayoutGrid}
        eyebrow="Website content"
        title="مدیریت محتوای سایت"
        description="از اینجا صفحات، خدمات و بخش‌های اصلی سایت را مدیریت کنید. محصولات و اخبار در صفحه‌های مستقل خودشان قرار دارند."
      />

      <nav aria-label="بخش‌های محتوای سایت" className="grid grid-cols-2 gap-2 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-2.5 shadow-(--theme-card-shadow) md:grid-cols-3 xl:grid-cols-5">
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
                ? 'border-(--theme-primary)/35 bg-(--theme-primary)/10 text-(--theme-primary-ink)'
                : 'border-transparent bg-(--theme-surface-muted) text-(--theme-text-muted) hover:border-(--theme-border) hover:bg-(--theme-surface) hover:text-(--theme-text)'
            }`}
          >
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${selected ? 'bg-(--theme-primary) text-(--theme-primary-foreground)' : 'border border-(--theme-border) bg-(--theme-surface) text-(--theme-text-muted)'}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold leading-5">{t.label}</span>
              <span className="mt-0.5 block text-[9px] leading-4 text-(--theme-text-muted)">{t.description}</span>
            </span>
          </button>
          );
        })}
      </nav>

      {tab === 'pages' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-3">
            {pages.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setEditPage(p)}
                className={`block w-full rounded-xl border p-3.5 text-start text-xs font-bold transition-colors ${
                  editPage?.id === p.id
                    ? 'border-(--theme-primary) bg-(--theme-primary)/10 text-(--theme-primary-ink)'
                    : 'border-(--theme-card-border) bg-(--theme-card-surface) text-(--theme-text) hover:border-(--theme-card-border-hover)'
                }`}
              >
                <span className="block truncate">{p.title_fa}</span>
                <span className="mt-1 block truncate font-mono text-[10px] font-normal text-(--theme-text-muted)" dir="ltr">/{p.slug}</span>
              </button>
            ))}
            <Link
              to="/admin/content-records?resource=pages"
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-(--theme-border-strong) px-3 py-2.5 text-center text-[11px] font-bold text-(--theme-text-muted) transition hover:border-(--theme-primary) hover:text-(--theme-primary-ink)"
            >
              <Plus className="h-4 w-4" />
              افزودن، حذف یا مدیریت همهٔ صفحات
            </Link>
          </div>
          {editPage && (
            <div className="space-y-4 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow) lg:col-span-9">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) px-3 py-2">
                <p className="text-[11px] leading-5 text-(--theme-text-muted)">
                  این رکورد محتوای معرفی مسیر موجود را تعیین می‌کند؛ ساخت رکورد جدید به‌تنهایی مسیر یا صفحهٔ تازه‌ای در سایت ایجاد نمی‌کند.
                </p>
                {publicPagePaths[editPage.slug] && (
                  <Link
                    to={publicPagePaths[editPage.slug]}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-(--theme-link) hover:underline"
                  >
                    مشاهدهٔ صفحهٔ عمومی <ArrowUpRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
                  عنوان سربرگ معرفی (فارسی)
                  <input value={editPage.title_fa} onChange={(e) => setEditPage({ ...editPage, title_fa: e.target.value })} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm font-bold text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
                  Page intro title (English)
                  <input dir="ltr" value={editPage.title_en} onChange={(e) => setEditPage({ ...editPage, title_en: e.target.value })} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm font-bold text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
                  توضیح کوتاه سربرگ (فارسی)
                  <input value={editPage.subtitle_fa || ''} onChange={(e) => setEditPage({ ...editPage, subtitle_fa: e.target.value })} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-xs text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
                  Page intro subtitle (English)
                  <input dir="ltr" value={editPage.subtitle_en || ''} onChange={(e) => setEditPage({ ...editPage, subtitle_en: e.target.value })} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-xs text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
                </label>
              </div>
              {!isHomeSpotlight && (
                <section className="space-y-3 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-4">
                  <div>
                    <h3 className="text-xs font-bold text-(--theme-text)">نشان و لوگوی سربرگ این صفحه</h3>
                    <p className="mt-1 text-[11px] leading-5 text-(--theme-text-muted)">
                      تنظیمات سربرگ را همراه عنوان و محتوای همین صفحه در یک بخش مدیریت کنید.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
                      نشان صفحه (فارسی)
                      <input
                        value={getPageMetadataText('badge_fa', bootstrap?.pages_config?.[editPage.slug]?.badge_fa || '')}
                        onChange={(event) => updatePageMetadata('badge_fa', event.target.value)}
                        className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
                      Page badge (English)
                      <input
                        dir="ltr"
                        value={getPageMetadataText('badge_en', bootstrap?.pages_config?.[editPage.slug]?.badge_en || '')}
                        onChange={(event) => updatePageMetadata('badge_en', event.target.value)}
                        className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)"
                      />
                    </label>
                    <div className="sm:col-span-2">
                      <MediaUrlField
                        label="لوگوی اختصاصی سربرگ (ثابت یا متحرک)"
                        value={getPageMetadataText('logo_url', bootstrap?.pages_config?.[editPage.slug]?.logo_url || '')}
                        onChange={(url) => updatePageMetadata('logo_url', url)}
                        folder="logos"
                        showAnimatedPresets
                      />
                    </div>
                  </div>
                </section>
              )}
              {isHomeSpotlight && (
                <div className="space-y-2 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-[11px] leading-5 text-(--theme-text-muted)">
                  عنوان/نشان و لوگوی بخش ویژه در تنظیمات ظاهر است؛ تصاویر، توضیحات و دکمه‌های همین اسلاید در این فرم ویرایش می‌شوند.
                  <Link to="/admin/login-appearance" className="inline-flex items-center gap-1 font-bold text-(--theme-link) hover:underline">
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
              <section className="space-y-3 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-4">
                <div>
                  <h3 className="text-xs font-bold text-(--theme-text)">تنظیمات اختیاری SEO این صفحه</h3>
                  <p className="mt-1 text-[11px] leading-5 text-(--theme-text-muted)">
                    در صورت خالی بودن، عنوان و زیرعنوان صفحه و تنظیمات عمومی سایت به‌صورت خودکار استفاده می‌شوند.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
                    عنوان SEO (فارسی)
                    <input
                      value={editPage.meta_title || ''}
                      onChange={(event) => setEditPage({ ...editPage, meta_title: event.target.value })}
                      className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
                    SEO title (English)
                    <input
                      dir="ltr"
                      value={editPage.meta_title_en || ''}
                      onChange={(event) => setEditPage({ ...editPage, meta_title_en: event.target.value })}
                      className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
                    توضیحات SEO (فارسی)
                    <textarea
                      rows={3}
                      value={editPage.meta_description || ''}
                      onChange={(event) => setEditPage({ ...editPage, meta_description: event.target.value })}
                      className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
                    SEO description (English)
                    <textarea
                      dir="ltr"
                      rows={3}
                      value={editPage.meta_description_en || ''}
                      onChange={(event) => setEditPage({ ...editPage, meta_description_en: event.target.value })}
                      className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)"
                    />
                  </label>
                </div>
                <label className="block space-y-1.5 text-xs font-semibold text-(--theme-text)">
                  Canonical URL (اختیاری)
                  <input
                    dir="ltr"
                    value={editPage.canonical_url || ''}
                    onChange={(event) => setEditPage({ ...editPage, canonical_url: event.target.value })}
                    placeholder={publicPagePaths[editPage.slug] || `/${editPage.slug}`}
                    className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)"
                  />
                </label>
              </section>
              {isHomeSpotlight && (
                <div className="space-y-4 rounded-xl border border-(--theme-border) p-4">
                  <h3 className="text-sm font-bold text-(--theme-text)">محتوای بخش ویژه صفحه اصلی</h3>
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
                        <span className="text-[11px] font-semibold text-(--theme-text-muted)">{label}</span>
                        <input
                          type="text"
                          dir={key.endsWith('_en') || key.endsWith('_link') ? 'ltr' : 'rtl'}
                          value={getPageMetadataText(key)}
                          onChange={(event) => updatePageMetadata(key, event.target.value)}
                          className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-xs text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)"
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
                  <label className="block space-y-1 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-3">
                    <span className="flex items-center justify-between text-[11px] font-semibold text-(--theme-text)">
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
                  <section className="space-y-3 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-4">
                    <div>
                      <h3 className="text-xs font-bold text-(--theme-text)">بخش زنجیرهٔ محصولات صفحهٔ اصلی</h3>
                      <p className="mt-1 text-[11px] leading-5 text-(--theme-text-muted)">
                        متن‌ها و پس‌زمینهٔ سکشن را اینجا تنظیم کنید؛ انتخاب و تعداد کارت‌ها از تب «منبع و تعداد نمایش» و اطلاعات واقعی هر کارت از «مدیریت محصولات» دریافت می‌شود.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {([
                        ['products_eyebrow_fa', 'برچسب بالای عنوان (فارسی)'],
                        ['products_eyebrow_en', 'Section eyebrow (English)'],
                        ['products_title_fa', 'عنوان سکشن (فارسی)'],
                        ['products_title_en', 'Section title (English)'],
                      ] as const).map(([key, label]) => (
                        <label key={key} className="space-y-1 text-[11px] font-semibold text-(--theme-text-muted)">
                          {label}
                          <input
                            dir={key.endsWith('_en') ? 'ltr' : 'rtl'}
                            value={getPageMetadataText(key)}
                            onChange={(event) => updatePageMetadata(key, event.target.value)}
                            className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)"
                          />
                        </label>
                      ))}
                    </div>
                    <MediaUrlField
                      label="تصویر پس‌زمینه سکشن محصولات"
                      value={getPageMetadataText('products_background_url')}
                      onChange={(url) => updatePageMetadata('products_background_url', url)}
                      folder="pages"
                      accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
                      placeholder="/storage/pages/home-products-background.jpg"
                      hint="اگر خالی باشد، رنگ پایه و تصویرسازی گرافیکی سکشن استفاده می‌شود."
                    />
                    <label className="block space-y-1 rounded-xl border border-(--theme-border) bg-(--theme-surface) p-3">
                      <span className="flex items-center justify-between text-[11px] font-semibold text-(--theme-text)">
                        <span>تیرگی روی پس‌زمینهٔ سکشن محصولات</span>
                        <span>{getPageMetadataText('products_overlay_opacity') || '0'}%</span>
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={getPageMetadataText('products_overlay_opacity') || '0'}
                        onChange={(event) => updatePageMetadata('products_overlay_opacity', event.target.value)}
                        className="w-full accent-(--theme-primary)"
                      />
                    </label>
                  </section>
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-(--theme-btn-bg) px-4 py-2 text-xs font-semibold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover) disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                <span>{savingPage ? 'در حال ذخیره...' : 'ذخیره تغییرات صفحه'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'sections' && (
        <section className="space-y-4">
          {!homeSpotlightPage ? (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-(--theme-text)">
              صفحهٔ «تولید بومی تجهیزات حیاتی نفت و گاز» پیدا نشد؛ ابتدا رکورد صفحهٔ خانه را در بخش صفحات ایجاد یا بازیابی کنید.
            </p>
          ) : (
            <>
              <HomepageSectionsSettingsEditor settings={homeSections} onChange={setHomeSections} />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={savingPage}
                  onClick={async () => {
                    setSavingPage(true);
                    try {
                      const updatedPage: PageContent = {
                        ...homeSpotlightPage,
                        metadata: { ...(homeSpotlightPage.metadata || {}), home_sections: homeSections },
                      };
                      await apiRequest(`/admin/pages/${homeSpotlightPage.id}`, {
                        method: 'PUT',
                        body: JSON.stringify(updatedPage),
                      });
                      setHomeSpotlightPage(updatedPage);
                      addToast('success', 'منبع و تعداد نمایش بخش‌های صفحهٔ خانه ذخیره شد.');
                      await load();
                    } catch (error) {
                      addToast('error', error instanceof Error ? error.message : 'ذخیرهٔ تنظیمات بخش‌های صفحهٔ خانه ناموفق بود.');
                    } finally {
                      setSavingPage(false);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-(--theme-btn-bg) px-4 py-2.5 text-xs font-bold text-(--theme-btn-text) disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {savingPage ? 'در حال ذخیره...' : 'ذخیرهٔ تنظیمات بخش‌ها'}
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {tab !== 'pages' && tab !== 'sections' && (
        <>
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
