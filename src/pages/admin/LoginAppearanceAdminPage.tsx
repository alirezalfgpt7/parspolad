import React, { useEffect, useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Type,
} from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type {
  AppearanceSettings,
  BrandLogosSettings,
  FontFamilyKey,
  LoginPageSettings,
  LogoPlacement,
  PageOverrideEntry,
  PagesConfigSettings,
  SiteSettings,
} from '../../types/index.ts';
import {
  BUNDLED_FONTS,
  DEFAULT_APPEARANCE_SETTINGS,
  DEFAULT_BRAND_LOGOS,
  DEFAULT_LOGIN_SETTINGS,
  DEFAULT_PAGES_CONFIG,
  FONT_CSS_MAP,
} from '../../utils/brandingDefaults.ts';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { PagePreloader } from '../../components/common/PagePreloader.tsx';
import { AnimatedTabsEffect, DecorativeCube, EffectAction, EffectText } from '../../components/effects/index.ts';
import { IconPicker } from '../../components/ui/IconPicker.tsx';
import { DynamicLucideIcon } from '../../components/ui/LucideIconMap.tsx';
import { MediaUrlField } from '../../components/ui/MediaUrlField.tsx';
import { ColorPicker } from '../../components/ui/ColorPicker.tsx';
import { pickReadableForeground } from '../../utils/themeContrast.ts';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.tsx';

type StudioTab = 'login' | 'fonts' | 'logos' | 'pages';

const SYSTEM_PAGE_CARDS: Array<{ key: string; label: string; hasBadge?: boolean; hasCta?: boolean }> = [
  { key: 'home_spotlight', label: 'بخش اسپات‌لایت صفحه اصلی', hasBadge: true },
  { key: 'maintenance', label: 'صفحه حالت تعمیرات فنی' },
  { key: 'error_404', label: 'صفحه خطای ۴۰۴ (یافت نشد)', hasCta: true },
  { key: 'error_403', label: 'صفحه خطای ۴۰۳ (عدم دسترسی)', hasCta: true },
  { key: 'error_500', label: 'صفحه خطای ۵۰۰ (سرور)', hasCta: true },
];

const LOGO_FIELDS: Array<{ key: LogoPlacement; label: string; hint: string }> = [
  { key: 'navbar', label: 'لوگوی نوبار بالایی (Navbar)', hint: 'نمایش در هدر تمام صفحات عمومی (پشتیبانی از PNG/GIF/MP4)' },
  { key: 'footer', label: 'لوگوی فوتر سایت (Footer)', hint: 'نمایش در ستون معرفی فوتر پایین سایت' },
  { key: 'admin_sidebar', label: 'لوگوی سایدبار پنل مدیریت', hint: 'فقط آرم بالای سایدبار را تغییر می‌دهد؛ تنظیم پیش‌بارگذاری مستقل است.' },
  { key: 'login', label: 'لوگوی صفحه ورود (Login)', hint: 'روی کارت ورود نمایش داده می‌شود' },
  { key: 'register', label: 'لوگوی صفحه ثبت‌نام (Register)', hint: 'روی کارت پشتی (چرخشی سه‌بعدی) یا صفحه ثبت‌نام' },
  { key: 'preloader', label: 'آرم / انیمیشن پیش‌بارگذاری (Preloader)', hint: 'فقط برای صفحه پیش‌بارگذاری است و لوگوی سایدبار را تغییر نمی‌دهد.' },
  { key: 'about', label: 'آرم متحرک صفحه «درباره ما»', hint: 'نمایش در هدر صفحه درباره ما (مثلاً logo-3d.mp4)' },
  { key: 'favicon', label: 'آیکون تب مرورگر (Favicon)', hint: 'PNG یا GIF کوچک برای تب مرورگر' },
  { key: 'seo_share', label: 'تصویر اشتراک‌گذاری (SEO / OpenGraph)', hint: 'تصویر پیش‌فرض در تلگرام، لینکدین و موتورهای جستجو (PNG/JPG)' },
];

const FONT_SLOTS: Array<{ key: keyof Omit<AppearanceSettings, 'base_font_size'>; label: string }> = [
  { key: 'font_site', label: 'فونت متن کل سایت (Pages Body)' },
  { key: 'font_site_heading', label: 'فونت تیترها در کل سایت (Headings)' },
  { key: 'font_landing', label: 'فونت متن صفحه اصلی (Landing)' },
  { key: 'font_landing_heading', label: 'فونت تیتر صفحه اصلی (Landing H1/H2)' },
  { key: 'font_login', label: 'فونت صفحات ورود و ثبت‌نام (Login/Register)' },
  { key: 'font_login_heading', label: 'فونت تیتر صفحه ورود (Login Heading)' },
  { key: 'font_admin', label: 'فونت متن پنل مدیریت (Admin Body)' },
  { key: 'font_admin_heading', label: 'فونت تیترهای پنل مدیریت (Admin Headings)' },
  { key: 'font_navbar', label: 'فونت نوبار بالایی (Navbar)' },
  { key: 'font_footer', label: 'فونت فوتر پایینی (Footer)' },
];

const TextField: React.FC<{
  label: string;
  value: string;
  dir?: 'rtl' | 'ltr';
  onChange: (value: string) => void;
}> = ({ label, value, dir = 'rtl', onChange }) => (
  <label className="block space-y-1">
    <span className="text-[11px] font-semibold text-(--theme-text-muted)">{label}</span>
    <input
      type="text"
      dir={dir}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-xs text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)"
    />
  </label>
);

export const LoginAppearanceAdminPage: React.FC = () => {
  const { addToast, fetchBootstrap, setPreviewBranding } = useAppStore();
  const [tab, setTab] = useState<StudioTab>('login');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loginCfg, setLoginCfg] = useState<LoginPageSettings>({ ...DEFAULT_LOGIN_SETTINGS });
  const [logosCfg, setLogosCfg] = useState<BrandLogosSettings>({ ...DEFAULT_BRAND_LOGOS });
  const [appearanceCfg, setAppearanceCfg] = useState<AppearanceSettings>({ ...DEFAULT_APPEARANCE_SETTINGS });
  const [pagesConfig, setPagesConfig] = useState<PagesConfigSettings>({ ...DEFAULT_PAGES_CONFIG });

  const [previewFlip, setPreviewFlip] = useState<'login' | 'register'>('login');

  useEffect(() => {
    let active = true;
    apiRequest<{ data: SiteSettings }>('/admin/settings')
      .then((settingsRes) => {
        if (!active) return;
        const s = settingsRes.data;
        setSiteSettings(s);
        setLoginCfg({ ...DEFAULT_LOGIN_SETTINGS, ...(s.login || {}) });
        const savedLogos = { ...DEFAULT_BRAND_LOGOS, ...(s.logos || {}) };
        for (const key of Object.keys(savedLogos) as LogoPlacement[]) {
          if (savedLogos[key] === '/storage/logos/preloader.gif') {
            savedLogos[key] = '/storage/videos/logo-3d.mp4';
          }
        }
        setLogosCfg(savedLogos);
        setAppearanceCfg({ ...DEFAULT_APPEARANCE_SETTINGS, ...(s.appearance || {}) });
        const savedPagesConfig = s.pages_config || {};
        const systemPageConfig = Object.fromEntries(
          Object.entries(savedPagesConfig).filter(([key]) => SYSTEM_PAGE_CARDS.some((card) => card.key === key)),
        );
        setPagesConfig({ ...DEFAULT_PAGES_CONFIG, ...systemPageConfig });
      })
      .catch((error: unknown) => {
        if (!active) return;
        addToast('error', error instanceof Error ? error.message : 'بارگذاری تنظیمات ناموفق بود.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      setPreviewBranding(null);
    };
  }, [addToast, setPreviewBranding]);

  // Live reactive preview into Zustand store
  useEffect(() => {
    if (loading) return;
    setPreviewBranding({
      login: loginCfg,
      logos: logosCfg,
      appearance: appearanceCfg,
      pages_config: pagesConfig,
    });
  }, [appearanceCfg, loading, loginCfg, logosCfg, pagesConfig, setPreviewBranding]);

  const updatePageOverride = (key: string, patch: Partial<PageOverrideEntry>) => {
    setPagesConfig((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), ...patch },
    }));
  };

  const handleSaveAll = async () => {
    if (!siteSettings) return;
    setSaving(true);
    try {
      await apiRequest('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          company: {
            ...siteSettings.company,
            logo_url: logosCfg.footer || siteSettings.company.logo_url,
            logo_small_url: logosCfg.navbar || siteSettings.company.logo_small_url,
          },
          seo: {
            ...siteSettings.seo,
            meta_image: logosCfg.seo_share || siteSettings.seo.meta_image,
          },
          login: loginCfg,
          logos: logosCfg,
          appearance: appearanceCfg,
          pages_config: pagesConfig,
        }),
      });

      setPreviewBranding(null);
      await fetchBootstrap();
      addToast('success', 'تنظیمات لاگین، فونت‌ها، لوگوها و صفحات سیستمی ذخیره شد.');
    } catch (error: unknown) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره تنظیمات با خطا مواجه شد.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLogos = async () => {
    if (!siteSettings) return;
    setSaving(true);
    try {
      await apiRequest('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          company: {
            ...siteSettings.company,
            logo_url: logosCfg.footer || siteSettings.company.logo_url,
            logo_small_url: logosCfg.navbar || siteSettings.company.logo_small_url,
          },
          seo: {
            ...siteSettings.seo,
            meta_image: logosCfg.seo_share || siteSettings.seo.meta_image,
          },
          logos: logosCfg,
        }),
      });
      setPreviewBranding(null);
      await fetchBootstrap();
      addToast('success', 'تنظیمات لوگوها ذخیره و منتشر شد.');
    } catch (error: unknown) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره لوگوها ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setLoginCfg({ ...DEFAULT_LOGIN_SETTINGS });
    setLogosCfg({ ...DEFAULT_BRAND_LOGOS });
    setAppearanceCfg({ ...DEFAULT_APPEARANCE_SETTINGS });
    setPagesConfig({ ...DEFAULT_PAGES_CONFIG });
    addToast('info', 'تنظیمات بخش‌های فرم به حالت پیش‌فرض بازنشانی شد. برای ثبت نهایی دکمه ذخیره را بزنید.');
  };

  if (loading) {
    return <PagePreloader label="در حال بارگذاری استودیو ظاهر و لاگین..." />;
  }

  return (
    <div className="space-y-6 pb-10">
      <AdminPageHeader
        icon={Sparkles}
        eyebrow="Appearance & authentication studio"
        title="تنظیمات لاگین و تنظیمات ظاهری"
        description="مدیریت ورود و ثبت‌نام، فونت‌ها، لوگوهای ثابت و متحرک و متون صفحات سیستمی؛ تنظیم رنگ‌بندی در استودیو هویت بصری انجام می‌شود."
        actions={(
          <>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 rounded-xl border border-(--theme-border) bg-(--theme-surface) px-3.5 py-2.5 text-xs font-semibold text-(--theme-text) hover:bg-(--theme-surface-muted)"
            >
              <RotateCcw className="h-4 w-4" />
              <span>بازنشانی پیش‌فرض</span>
            </button>
            <EffectAction
              type="button"
              disabled={saving}
              onClick={handleSaveAll}
              style={{ backgroundColor: 'var(--theme-btn-bg)', color: 'var(--theme-btn-text)' }}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold shadow-md disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'در حال ذخیره...' : 'ذخیره و انتشار همه تغییرات'}</span>
            </EffectAction>
          </>
        )}
      />

      {/* Effect 022 Animated Tabs */}
      <div className="overflow-x-auto pb-1">
        <AnimatedTabsEffect
          activeId={tab}
          onChange={(next) => setTab(next as StudioTab)}
          items={[
            { id: 'login', label: 'لاگین و ثبت‌نام', icon: <ShieldCheck className="h-4 w-4" /> },
            { id: 'fonts', label: 'فونت کل بخش‌ها', icon: <Type className="h-4 w-4" /> },
            { id: 'logos', label: 'لوگوها و فایل‌های متحرک', icon: <ImageIcon className="h-4 w-4" /> },
            { id: 'pages', label: 'صفحات سیستمی', icon: <FileText className="h-4 w-4" /> },
          ]}
        />
      </div>

      {/* TAB 1: LOGIN & REGISTER */}
      {tab === 'login' && (
        <div className="grid gap-6 xl:grid-cols-12">
          <div className="space-y-5 xl:col-span-7">
            {/* Texts */}
            <section className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow)">
              <h2 className="mb-4 text-sm font-extrabold text-(--theme-text)">متون صفحه ورود و احراز هویت دوعاملی (FA / EN)</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="برچسب امنیتی (فارسی)" value={loginCfg.badge_text_fa} onChange={(v) => setLoginCfg({ ...loginCfg, badge_text_fa: v })} />
                <TextField label="Badge Text (EN)" dir="ltr" value={loginCfg.badge_text_en} onChange={(v) => setLoginCfg({ ...loginCfg, badge_text_en: v })} />
                <TextField label="تیتر ورود (فارسی)" value={loginCfg.title_fa} onChange={(v) => setLoginCfg({ ...loginCfg, title_fa: v })} />
                <TextField label="Login Title (EN)" dir="ltr" value={loginCfg.title_en} onChange={(v) => setLoginCfg({ ...loginCfg, title_en: v })} />
                <TextField label="زیرتیتر ورود (فارسی)" value={loginCfg.subtitle_fa} onChange={(v) => setLoginCfg({ ...loginCfg, subtitle_fa: v })} />
                <TextField label="Login Subtitle (EN)" dir="ltr" value={loginCfg.subtitle_en} onChange={(v) => setLoginCfg({ ...loginCfg, subtitle_en: v })} />
                <TextField label="عنوان فرم 2FA (فارسی)" value={loginCfg.two_factor_title_fa} onChange={(v) => setLoginCfg({ ...loginCfg, two_factor_title_fa: v })} />
                <TextField label="2FA Title (EN)" dir="ltr" value={loginCfg.two_factor_title_en} onChange={(v) => setLoginCfg({ ...loginCfg, two_factor_title_en: v })} />
                <TextField label="راهنمای 2FA (فارسی)" value={loginCfg.two_factor_hint_fa} onChange={(v) => setLoginCfg({ ...loginCfg, two_factor_hint_fa: v })} />
                <TextField label="2FA Hint (EN)" dir="ltr" value={loginCfg.two_factor_hint_en} onChange={(v) => setLoginCfg({ ...loginCfg, two_factor_hint_en: v })} />
                <TextField label="برچسب ایمیل (فارسی)" value={loginCfg.email_label_fa} onChange={(v) => setLoginCfg({ ...loginCfg, email_label_fa: v })} />
                <TextField label="Email Label (EN)" dir="ltr" value={loginCfg.email_label_en} onChange={(v) => setLoginCfg({ ...loginCfg, email_label_en: v })} />
                <TextField label="مثال ایمیل (فارسی)" dir="ltr" value={loginCfg.email_placeholder_fa} onChange={(v) => setLoginCfg({ ...loginCfg, email_placeholder_fa: v })} />
                <TextField label="Email Placeholder (EN)" dir="ltr" value={loginCfg.email_placeholder_en} onChange={(v) => setLoginCfg({ ...loginCfg, email_placeholder_en: v })} />
                <TextField label="برچسب رمز عبور (فارسی)" value={loginCfg.password_label_fa} onChange={(v) => setLoginCfg({ ...loginCfg, password_label_fa: v })} />
                <TextField label="Password Label (EN)" dir="ltr" value={loginCfg.password_label_en} onChange={(v) => setLoginCfg({ ...loginCfg, password_label_en: v })} />
                <TextField label="دکمه ورود (فارسی)" value={loginCfg.submit_text_fa} onChange={(v) => setLoginCfg({ ...loginCfg, submit_text_fa: v })} />
                <TextField label="Submit Button (EN)" dir="ltr" value={loginCfg.submit_text_en} onChange={(v) => setLoginCfg({ ...loginCfg, submit_text_en: v })} />
                <TextField label="دکمه تایید 2FA (فارسی)" value={loginCfg.two_factor_submit_fa} onChange={(v) => setLoginCfg({ ...loginCfg, two_factor_submit_fa: v })} />
                <TextField label="2FA Submit (EN)" dir="ltr" value={loginCfg.two_factor_submit_en} onChange={(v) => setLoginCfg({ ...loginCfg, two_factor_submit_en: v })} />
                <TextField label="لینک ثبت‌نام جدید (فارسی)" value={loginCfg.register_cta_fa} onChange={(v) => setLoginCfg({ ...loginCfg, register_cta_fa: v })} />
                <TextField label="Register Link (EN)" dir="ltr" value={loginCfg.register_cta_en} onChange={(v) => setLoginCfg({ ...loginCfg, register_cta_en: v })} />
                <TextField label="بازگشت به سایت (فارسی)" value={loginCfg.back_home_fa} onChange={(v) => setLoginCfg({ ...loginCfg, back_home_fa: v })} />
                <TextField label="Back to Site (EN)" dir="ltr" value={loginCfg.back_home_en} onChange={(v) => setLoginCfg({ ...loginCfg, back_home_en: v })} />
              </div>
            </section>

            {/* Register Texts */}
            <section className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow)">
              <h2 className="mb-4 text-sm font-extrabold text-(--theme-text)">متون فرم ثبت‌نام (کارت چرخشی پشتی / Register)</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="تیتر ثبت‌نام (فارسی)" value={loginCfg.register_title_fa} onChange={(v) => setLoginCfg({ ...loginCfg, register_title_fa: v })} />
                <TextField label="Register Title (EN)" dir="ltr" value={loginCfg.register_title_en} onChange={(v) => setLoginCfg({ ...loginCfg, register_title_en: v })} />
                <TextField label="زیرتیتر ثبت‌نام (فارسی)" value={loginCfg.register_subtitle_fa} onChange={(v) => setLoginCfg({ ...loginCfg, register_subtitle_fa: v })} />
                <TextField label="Register Subtitle (EN)" dir="ltr" value={loginCfg.register_subtitle_en} onChange={(v) => setLoginCfg({ ...loginCfg, register_subtitle_en: v })} />
                <TextField label="برچسب نام و نام خانوادگی" value={loginCfg.register_name_label_fa} onChange={(v) => setLoginCfg({ ...loginCfg, register_name_label_fa: v })} />
                <TextField label="Full Name Label (EN)" dir="ltr" value={loginCfg.register_name_label_en} onChange={(v) => setLoginCfg({ ...loginCfg, register_name_label_en: v })} />
                <TextField label="برچسب شماره تماس" value={loginCfg.register_phone_label_fa} onChange={(v) => setLoginCfg({ ...loginCfg, register_phone_label_fa: v })} />
                <TextField label="Phone Label (EN)" dir="ltr" value={loginCfg.register_phone_label_en} onChange={(v) => setLoginCfg({ ...loginCfg, register_phone_label_en: v })} />
                <TextField label="دکمه ثبت‌نام (فارسی)" value={loginCfg.register_submit_fa} onChange={(v) => setLoginCfg({ ...loginCfg, register_submit_fa: v })} />
                <TextField label="Register Submit (EN)" dir="ltr" value={loginCfg.register_submit_en} onChange={(v) => setLoginCfg({ ...loginCfg, register_submit_en: v })} />
                <TextField label="لینک بازگشت به ورود (فارسی)" value={loginCfg.login_cta_fa} onChange={(v) => setLoginCfg({ ...loginCfg, login_cta_fa: v })} />
                <TextField label="Sign In Link (EN)" dir="ltr" value={loginCfg.login_cta_en} onChange={(v) => setLoginCfg({ ...loginCfg, login_cta_en: v })} />
              </div>
            </section>

            {/* Icons & Visual Colors & Effect Toggles */}
            <section className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow)">
              <h2 className="mb-4 text-sm font-extrabold text-(--theme-text)">آیکون‌های لاگین، رنگ‌بندی اختصاصی و افکت‌ها</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <IconPicker label="آیکون برچسب امنیتی" value={loginCfg.badge_icon} onChange={(v) => setLoginCfg({ ...loginCfg, badge_icon: v })} />
                <IconPicker label="آیکون ایمیل" value={loginCfg.email_icon} onChange={(v) => setLoginCfg({ ...loginCfg, email_icon: v })} />
                <IconPicker label="آیکون رمز عبور" value={loginCfg.password_icon} onChange={(v) => setLoginCfg({ ...loginCfg, password_icon: v })} />
                <IconPicker label="آیکون دکمه ورود" value={loginCfg.submit_icon} onChange={(v) => setLoginCfg({ ...loginCfg, submit_icon: v })} />
                <IconPicker label="آیکون ثبت‌نام" value={loginCfg.register_icon} onChange={(v) => setLoginCfg({ ...loginCfg, register_icon: v })} />
                <IconPicker label="آیکون 2FA" value={loginCfg.two_factor_icon} onChange={(v) => setLoginCfg({ ...loginCfg, two_factor_icon: v })} />
                <IconPicker label="آیکون کپچا" value={loginCfg.captcha_icon} onChange={(v) => setLoginCfg({ ...loginCfg, captcha_icon: v })} />
                <IconPicker label="آیکون بازگشت" value={loginCfg.back_icon} onChange={(v) => setLoginCfg({ ...loginCfg, back_icon: v })} />
              </div>

              <div className="mt-5 grid gap-3 border-t border-(--theme-border) pt-4 sm:grid-cols-5">
                {(
                  [
                    ['backdrop_color', 'پس‌زمینه کل صفحه'],
                    ['card_bg_color', 'پس‌زمینه کارت شیشه‌ای'],
                    ['accent_color', 'رنگ دکمه و تاکید'],
                    ['text_color', 'رنگ متون'],
                    ['input_bg_color', 'پس‌زمینه ورودی‌ها'],
                  ] as const
                ).map(([key, lbl]) => (
                  <label key={key} className="space-y-1 text-xs">
                    <span className="block font-medium text-(--theme-text-muted)">{lbl}</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={loginCfg[key].startsWith('#') ? loginCfg[key] : '#0f172a'}
                        onChange={(e) => setLoginCfg({ ...loginCfg, [key]: e.target.value })}
                        className="h-8 w-8 cursor-pointer rounded border border-(--theme-input-border) bg-(--theme-input-bg) p-0.5"
                      />
                      <input
                        type="text"
                        dir="ltr"
                        value={loginCfg[key]}
                        onChange={(e) => setLoginCfg({ ...loginCfg, [key]: e.target.value })}
                        className="min-w-0 flex-1 rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2 py-1.5 font-mono text-[11px] text-(--theme-input-text) placeholder:text-(--theme-placeholder)"
                      />
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-4 grid gap-3 border-t border-(--theme-border) pt-4 sm:grid-cols-2">
                {(
                  [
                    ['enable_3d_flip', 'چرخش سه‌بعدی ورود / ثبت‌نام (Effect 083)'],
                    ['show_decorative_cube', 'مکعب شیشه‌ای سه‌بعدی (Effect 028)'],
                    ['enable_particles', 'ذرات تعاملی شبکه (Effect 051)'],
                    ['enable_bg_slideshow', 'اسلایدشو نرم پس‌زمینه (Effect 041)'],
                  ] as const
                ).map(([key, lbl]) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-3 text-xs font-semibold text-(--theme-text)">
                    <input
                      type="checkbox"
                      checked={Boolean(loginCfg[key])}
                      onChange={(e) => setLoginCfg({ ...loginCfg, [key]: e.target.checked })}
                      className="h-4 w-4 accent-(--theme-primary)"
                    />
                    <span>{lbl}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Live Preview Column */}
          <div className="space-y-4 xl:col-span-5">
            <div className="sticky top-20 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-4 shadow-(--theme-card-shadow)">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-extrabold text-(--theme-text)">پیش‌نمایش زنده فرم لاگین و ثبت‌نام</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewFlip('login')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${previewFlip === 'login' ? 'bg-(--theme-primary) text-(--theme-primary-foreground)' : 'bg-(--theme-surface-muted) text-(--theme-text)'}`}
                  >
                    نمای ورود
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFlip('register')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${previewFlip === 'register' ? 'bg-(--theme-primary) text-(--theme-primary-foreground)' : 'bg-(--theme-surface-muted) text-(--theme-text)'}`}
                  >
                    نمای ثبت‌نام
                  </button>
                </div>
              </div>

              <div
                className="relative overflow-hidden rounded-2xl p-5"
                style={{
                  backgroundColor: loginCfg.backdrop_color,
                  color: loginCfg.text_color,
                  fontFamily: FONT_CSS_MAP[appearanceCfg.font_login],
                }}
              >
                <div
                  className="rounded-2xl border border-white/15 p-5 shadow-2xl backdrop-blur-xl"
                  style={{ backgroundColor: loginCfg.card_bg_color }}
                >
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 overflow-hidden rounded-xl bg-white p-1">
                        <BrandLogo
                          placement={previewFlip === 'login' ? 'login' : 'register'}
                          overrideUrl={previewFlip === 'login' ? logosCfg.login : logosCfg.register}
                          className="h-full w-full"
                        />
                      </div>
                      <span className="text-xs font-extrabold">پارس پولاد آقایی</span>
                    </div>
                    {loginCfg.show_decorative_cube && (
                      <DecorativeCube size="sm" className="h-9 w-9 rounded-lg border border-white/10 bg-white/5" />
                    )}
                  </div>

                  {previewFlip === 'login' ? (
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px]">
                        <DynamicLucideIcon name={loginCfg.badge_icon} className="h-3 w-3" />
                        <span>{loginCfg.badge_text_fa}</span>
                      </div>
                      <h3 style={{ fontFamily: FONT_CSS_MAP[appearanceCfg.font_login_heading] }} className="text-base font-extrabold">
                        <EffectText inverse>{loginCfg.title_fa}</EffectText>
                      </h3>
                      <p className="text-[11px] opacity-75">{loginCfg.subtitle_fa}</p>

                      <div className="space-y-2 pt-1 text-[11px]">
                        <div className="flex items-center gap-1.5 opacity-85">
                          <DynamicLucideIcon name={loginCfg.email_icon} className="h-3.5 w-3.5" />
                          <span>{loginCfg.email_label_fa}</span>
                        </div>
                        <div className="rounded-lg border border-white/15 px-3 py-2 text-[11px] opacity-60" style={{ backgroundColor: loginCfg.input_bg_color }}>
                          {loginCfg.email_placeholder_fa}
                        </div>
                        <div className="flex items-center gap-1.5 opacity-85">
                          <DynamicLucideIcon name={loginCfg.password_icon} className="h-3.5 w-3.5" />
                          <span>{loginCfg.password_label_fa}</span>
                        </div>
                        <div className="rounded-lg border border-white/15 px-3 py-2 text-[11px] opacity-60" style={{ backgroundColor: loginCfg.input_bg_color }}>
                          ••••••••
                        </div>
                      </div>

                      <div
                        className="mt-3 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold"
                        style={{
                          backgroundColor: loginCfg.accent_color,
                          color: pickReadableForeground(loginCfg.accent_color, '#0f172a', 4.5),
                        }}
                      >
                        <DynamicLucideIcon name={loginCfg.submit_icon} className="h-3.5 w-3.5" />
                        <span>{loginCfg.submit_text_fa}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 text-[10px] opacity-75">
                        <span className="inline-flex items-center gap-1">
                          <DynamicLucideIcon name={loginCfg.register_icon} className="h-3 w-3" />
                          {loginCfg.register_cta_fa}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <DynamicLucideIcon name={loginCfg.back_icon} className="h-3 w-3" />
                          {loginCfg.back_home_fa}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h3 style={{ fontFamily: FONT_CSS_MAP[appearanceCfg.font_login_heading] }} className="text-base font-extrabold">
                        {loginCfg.register_title_fa}
                      </h3>
                      <p className="text-[11px] opacity-75">{loginCfg.register_subtitle_fa}</p>
                      <div className="space-y-2 text-[11px]">
                        <div>{loginCfg.register_name_label_fa}</div>
                        <div className="h-8 rounded-lg border border-white/15" style={{ backgroundColor: loginCfg.input_bg_color }} />
                        <div>{loginCfg.email_label_fa}</div>
                        <div className="h-8 rounded-lg border border-white/15" style={{ backgroundColor: loginCfg.input_bg_color }} />
                        <div>{loginCfg.register_phone_label_fa}</div>
                        <div className="h-8 rounded-lg border border-white/15" style={{ backgroundColor: loginCfg.input_bg_color }} />
                      </div>
                      <div
                        className="mt-3 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold"
                        style={{
                          backgroundColor: loginCfg.accent_color,
                          color: pickReadableForeground(loginCfg.accent_color, '#0f172a', 4.5),
                        }}
                      >
                        <DynamicLucideIcon name={loginCfg.register_icon} className="h-3.5 w-3.5" />
                        <span>{loginCfg.register_submit_fa}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FONTS */}
      {tab === 'fonts' && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow)">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Type className="h-5 w-5 text-(--theme-primary-ink)" />
                <div>
                  <h2 className="text-base font-extrabold text-(--theme-text)">مدیریت فونت آفلاین کل بخش‌های برنامه</h2>
                  <p className="text-xs text-(--theme-text-muted)">تمام ۶ خانواده فونت به‌صورت داخلی (بدون CDN) در سیستم بارگذاری شده‌اند.</p>
                </div>
              </div>
              <label className="flex items-center gap-3 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) px-3 py-2 text-xs font-bold text-(--theme-text)">
                <span>اندازه پایه متن: {appearanceCfg.base_font_size}px</span>
                <input
                  type="range"
                  min={13}
                  max={20}
                  value={appearanceCfg.base_font_size}
                  onChange={(e) => setAppearanceCfg({ ...appearanceCfg, base_font_size: Number(e.target.value) })}
                  className="accent-(--theme-primary)"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {FONT_SLOTS.map((slot) => {
                const currentKey = appearanceCfg[slot.key];
                const fontMeta = BUNDLED_FONTS.find((f) => f.key === currentKey) || BUNDLED_FONTS[0];
                return (
                  <div key={slot.key} className="rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-3.5">
                    <label className="block text-xs font-bold text-(--theme-text)">
                      {slot.label}
                    </label>
                    <select
                      value={currentKey}
                      onChange={(e) => setAppearanceCfg({ ...appearanceCfg, [slot.key]: e.target.value as FontFamilyKey })}
                      className="mt-1.5 w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-xs text-(--theme-input-text) outline-none focus:border-(--theme-primary)"
                    >
                      {BUNDLED_FONTS.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label_fa}
                        </option>
                      ))}
                    </select>
                    <p
                      className="mt-2.5 rounded-lg border border-(--theme-border) bg-(--theme-surface) px-3 py-2 text-sm text-(--theme-text)"
                      style={{ fontFamily: FONT_CSS_MAP[fontMeta.key] }}
                    >
                      {fontMeta.sample} — ۱۲۳۴۵۶۷۸۹۰
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      )}

      {/* TAB 3: BRAND LOGOS & ANIMATED FILES */}
      {tab === 'logos' && (
        <section className="space-y-4 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow)">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
            <strong>پشتیبانی کامل از آرم و فایل‌های متحرک:</strong> برای هر بخش از سایت (نوبار، فوتر، سایدبار پنل، لاگین، ثبت‌نام، پیش‌بارگذاری، صفحه درباره ما و فاوآیکون) می‌توانید تصویر ثابت (PNG/JPG/WEBP) یا فایل متحرک (GIF، MP4، WEBM) را انتخاب کنید. لوگوی پیش‌بارگذاری و سایدبار تنظیم‌های جداگانه دارند؛ برای استفاده از یک لوگو در هر دو بخش، از دکمهٔ «استفاده از این لوگو در سایدبار هم» استفاده کنید.
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {LOGO_FIELDS.map((field) => (
              <div key={field.key} className="space-y-2">
                <MediaUrlField
                  label={field.label}
                  value={logosCfg[field.key]}
                  onChange={(url) => setLogosCfg({ ...logosCfg, [field.key]: url })}
                  folder="logos"
                  showAnimatedPresets
                  hint={field.hint}
                />
                {field.key === 'preloader' && logosCfg.preloader && logosCfg.preloader !== logosCfg.admin_sidebar && (
                  <button
                    type="button"
                    onClick={() => setLogosCfg({ ...logosCfg, admin_sidebar: logosCfg.preloader })}
                    className="rounded-lg border border-(--theme-primary-ink)/30 px-3 py-2 text-[11px] font-semibold text-(--theme-primary-ink) hover:bg-(--theme-primary)/8"
                  >
                    استفاده از این لوگو در سایدبار هم
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-(--theme-border) bg-slate-950 p-1">
                <BrandLogo placement="admin_sidebar" overrideUrl={logosCfg.admin_sidebar} alt="پیش‌نمایش لوگوی سایدبار" className="h-full w-full" />
              </div>
              <div>
                <p className="text-xs font-bold text-(--theme-text)">پیش‌نمایش لوگوی سایدبار</p>
                <p className="mt-1 text-[11px] text-(--theme-text-muted)">فایل GIF یا ویدئو باید در این کادر به‌صورت متحرک دیده شود.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaveLogos}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--theme-btn-bg) px-4 py-2.5 text-xs font-bold text-(--theme-btn-text) transition-colors hover:bg-(--theme-btn-hover) disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'در حال ذخیره...' : 'ذخیره و انتشار لوگوها'}
            </button>
          </div>
        </section>
      )}

      {/* TAB 4: ALL PAGES LOGOS & TEXTS */}
      {tab === 'pages' && (
        <div className="space-y-6">
          {/* System Pages */}
          <section className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow)">
            <h2 className="mb-4 text-base font-extrabold text-(--theme-text)">متون و لوگوی صفحات سیستمی و بخش ویژه صفحه اصلی</h2>
            <div className="grid gap-5 lg:grid-cols-2">
              {SYSTEM_PAGE_CARDS.map((card) => {
                const entry = pagesConfig[card.key] || {};
                return (
                  <div key={card.key} className="space-y-3 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold text-(--theme-primary-ink)">{card.label}</h3>
                      <span className="font-mono text-[10px] text-(--theme-text-muted)">{card.key}</span>
                    </div>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <TextField label="تیتر (فارسی)" value={entry.title_fa || ''} onChange={(v) => updatePageOverride(card.key, { title_fa: v })} />
                      <TextField label="Title (EN)" dir="ltr" value={entry.title_en || ''} onChange={(v) => updatePageOverride(card.key, { title_en: v })} />
                      <TextField label="توضیحات (فارسی)" value={entry.subtitle_fa || ''} onChange={(v) => updatePageOverride(card.key, { subtitle_fa: v })} />
                      <TextField label="Subtitle (EN)" dir="ltr" value={entry.subtitle_en || ''} onChange={(v) => updatePageOverride(card.key, { subtitle_en: v })} />
                      {card.hasBadge && (
                        <>
                          <TextField label="نشان (Badge FA)" value={entry.badge_fa || ''} onChange={(v) => updatePageOverride(card.key, { badge_fa: v })} />
                          <TextField label="Badge (EN)" dir="ltr" value={entry.badge_en || ''} onChange={(v) => updatePageOverride(card.key, { badge_en: v })} />
                        </>
                      )}
                      {card.hasCta && (
                        <>
                          <TextField label="متن دکمه (فارسی)" value={entry.cta_fa || ''} onChange={(v) => updatePageOverride(card.key, { cta_fa: v })} />
                          <TextField label="Button Label (EN)" dir="ltr" value={entry.cta_en || ''} onChange={(v) => updatePageOverride(card.key, { cta_en: v })} />
                        </>
                      )}
                    </div>
                    {card.key === 'home_spotlight' && (
                      <div className="space-y-3 rounded-xl border border-(--theme-border) bg-(--theme-surface) p-3">
                        <div>
                          <h4 className="text-xs font-bold text-(--theme-text)">متن و پس‌زمینه شاخص‌های عملکرد صفحه اصلی</h4>
                          <p className="mt-1 text-[11px] leading-5 text-(--theme-text-muted)">
                            تصویر پیش‌فرض همان تصویرسازی صنعتی فعلی است؛ تصویر انتخابی به‌صورت لایه پس‌زمینه اضافه می‌شود.
                          </p>
                        </div>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          <TextField label="برچسب بالای شاخص‌ها (فارسی)" value={entry.performance_eyebrow_fa || ''} onChange={(v) => updatePageOverride(card.key, { performance_eyebrow_fa: v })} />
                          <TextField label="Eyebrow (EN)" dir="ltr" value={entry.performance_eyebrow_en || ''} onChange={(v) => updatePageOverride(card.key, { performance_eyebrow_en: v })} />
                          <TextField label="تیتر (فارسی)" value={entry.performance_title_fa || ''} onChange={(v) => updatePageOverride(card.key, { performance_title_fa: v })} />
                          <TextField label="Title (EN)" dir="ltr" value={entry.performance_title_en || ''} onChange={(v) => updatePageOverride(card.key, { performance_title_en: v })} />
                          <TextField label="واژه تأکیدی قرمز (فارسی)" value={entry.performance_title_accent_fa || ''} onChange={(v) => updatePageOverride(card.key, { performance_title_accent_fa: v })} />
                          <TextField label="Highlighted word (EN)" dir="ltr" value={entry.performance_title_accent_en || ''} onChange={(v) => updatePageOverride(card.key, { performance_title_accent_en: v })} />
                          <TextField label="توضیح (فارسی)" value={entry.performance_subtitle_fa || ''} onChange={(v) => updatePageOverride(card.key, { performance_subtitle_fa: v })} />
                          <TextField label="Description (EN)" dir="ltr" value={entry.performance_subtitle_en || ''} onChange={(v) => updatePageOverride(card.key, { performance_subtitle_en: v })} />
                          <TextField label="متن پایانی (فارسی)" value={entry.performance_footer_fa || ''} onChange={(v) => updatePageOverride(card.key, { performance_footer_fa: v })} />
                          <TextField label="Footer text (EN)" dir="ltr" value={entry.performance_footer_en || ''} onChange={(v) => updatePageOverride(card.key, { performance_footer_en: v })} />
                        </div>
                        <MediaUrlField
                          label="تصویر پس‌زمینه اختیاری"
                          value={entry.performance_background_url || ''}
                          onChange={(url) => updatePageOverride(card.key, { performance_background_url: url })}
                          folder="pages"
                          accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
                          placeholder="/storage/pages/performance-background.jpg"
                          hint="در صورت خالی بودن، تصویرسازی صنعتی فعلی حفظ می‌شود."
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <ColorPicker
                            label="رنگ پایه پس‌زمینه شاخص‌ها"
                            value={entry.performance_background_color || '#080d17'}
                            onChange={(color) => updatePageOverride(card.key, { performance_background_color: color })}
                          />
                          <ColorPicker
                            label="رنگ لایه روی تصویر"
                            value={entry.performance_overlay_color || '#080d17'}
                            onChange={(color) => updatePageOverride(card.key, { performance_overlay_color: color })}
                          />
                          <label className="space-y-1 rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2">
                            <span className="flex items-center justify-between text-[11px] font-semibold text-(--theme-text-muted)">
                              <span>تیرگی لایه</span>
                              <span>{entry.performance_overlay_opacity ?? 0}%</span>
                            </span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={entry.performance_overlay_opacity ?? 0}
                              onChange={(event) =>
                                updatePageOverride(card.key, {
                                  performance_overlay_opacity: Number(event.target.value),
                                })
                              }
                              className="w-full accent-(--theme-primary)"
                            />
                          </label>
                        </div>
                        {entry.performance_background_color && (
                          <button
                            type="button"
                            onClick={() => updatePageOverride(card.key, { performance_background_color: '' })}
                            className="text-[11px] font-semibold text-(--theme-text-muted) underline-offset-2 hover:text-(--theme-primary-ink) hover:underline"
                          >
                            بازگشت به پس‌زمینهٔ صنعتی پیش‌فرض
                          </button>
                        )}
                      </div>
                    )}
                    {card.key === 'home_spotlight' && (
                      <div className="space-y-3 rounded-xl border border-(--theme-border) bg-(--theme-surface) p-3">
                        <div>
                          <h4 className="text-xs font-bold text-(--theme-text)">رنگ‌بندی بخش معرفی صفحه اصلی</h4>
                          <p className="mt-1 text-[11px] leading-5 text-(--theme-text-muted)">
                            رنگ متن و زمینهٔ بخش معرفی و رنگ تأکیدی نشان، زیرعنوان و دکمه اصلی را تنظیم کنید.
                          </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <ColorPicker
                            label="رنگ پس‌زمینه"
                            value={entry.section_background_color || '#0f172a'}
                            onChange={(color) => updatePageOverride(card.key, { section_background_color: color })}
                          />
                          <ColorPicker
                            label="رنگ متن"
                            value={entry.section_text_color || '#ffffff'}
                            onChange={(color) => updatePageOverride(card.key, { section_text_color: color })}
                          />
                          <ColorPicker
                            label="رنگ تأکیدی"
                            value={entry.section_accent_color || '#fbbf24'}
                            onChange={(color) => updatePageOverride(card.key, { section_accent_color: color })}
                          />
                        </div>
                      </div>
                    )}
                    <MediaUrlField
                      label="لوگو / تصویر این صفحه"
                      value={entry.logo_url || ''}
                      onChange={(url) => updatePageOverride(card.key, { logo_url: url })}
                      showAnimatedPresets
                    />
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      )}
    </div>
  );
};
