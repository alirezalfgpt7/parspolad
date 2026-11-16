import React, { useEffect, useState } from 'react';
import { Eye, Palette, Plus, RotateCcw, Save } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { ThemePalette, ThemePreset, ThemeSettings } from '../../types/index.ts';
import { ColorPicker } from '../../components/ui/ColorPicker.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';

const PALETTE_LABELS: Array<{ key: keyof ThemePalette; label: string }> = [
  { key: 'primary', label: 'رنگ اصلی (Primary)' },
  { key: 'secondary', label: 'رنگ ثانویه (Secondary)' },
  { key: 'accent', label: 'رنگ تاکید (Accent)' },
  { key: 'background', label: 'رنگ پس‌زمینه (Background)' },
  { key: 'surface', label: 'رنگ کارت و سطوح (Surface)' },
  { key: 'text', label: 'رنگ متن اصلی (Text)' },
  { key: 'headerBg', label: 'رنگ پس‌زمینه هدر (Header BG)' },
  { key: 'headerText', label: 'رنگ متن هدر (Header Text)' },
  { key: 'footerBg', label: 'رنگ پس‌زمینه فوتر (Footer BG)' },
  { key: 'footerText', label: 'رنگ متن فوتر (Footer Text)' },
  { key: 'buttonBg', label: 'رنگ دکمه‌ها (Button BG)' },
  { key: 'buttonText', label: 'رنگ متن دکمه‌ها (Button Text)' },
  { key: 'link', label: 'رنگ لینک‌ها (Links)' },
];

export const ThemeAdminPage: React.FC = () => {
  const { fetchBootstrap, setPreviewTheme, addToast } = useAppStore();
  const [settings, setSettings] = useState<ThemeSettings | null>(null);
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest<{ settings: ThemeSettings; presets: ThemePreset[] }>('/admin/themes')
      .then((res) => {
        setSettings(res.settings);
        setPresets(res.presets);
      })
      .catch(() => {});
    return () => setPreviewTheme(null, null);
  }, [setPreviewTheme]);

  if (!settings) return <div className="py-10 text-center text-sm text-slate-500">در حال بارگذاری موتور تم...</div>;

  const updateGlobalKey = (k: keyof ThemePalette, val: string) => {
    const nextPalette = { ...settings.active_palette, [k]: val };
    const next = { ...settings, active_palette: nextPalette };
    setSettings(next);
    setPreviewTheme(nextPalette, next.landing_palette);
  };

  const updateLandingKey = (k: keyof ThemePalette, val: string) => {
    const nextLanding = { ...settings.landing_palette, [k]: val };
    const next = { ...settings, landing_palette: nextLanding };
    setSettings(next);
    setPreviewTheme(next.active_palette, nextLanding);
  };

  const handleSelectPreset = (slug: string) => {
    const found = presets.find((p) => p.slug === slug);
    if (!found) return;
    const next = {
      ...settings,
      active_preset_slug: found.slug,
      active_palette: { ...found.palette },
    };
    setSettings(next);
    setPreviewTheme(next.active_palette, next.landing_palette);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiRequest('/admin/themes', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      setPreviewTheme(null, null);
      await fetchBootstrap();
      addToast('success', 'تنظیمات تم رنگی با موفقیت ذخیره و روی کل سایت اعمال شد.');
    } catch {
      addToast('error', 'خطا در ذخیره تنظیمات تم');
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePreset = async () => {
    if (!newPresetName.trim()) return;
    try {
      const res = await apiRequest<{ data: ThemePreset }>('/admin/themes/presets', {
        method: 'POST',
        body: JSON.stringify({
          slug: `custom-${Date.now()}`,
          name_fa: newPresetName.trim(),
          name_en: newPresetName.trim(),
          is_default: false,
          palette: settings.active_palette,
        }),
      });
      setPresets((p) => [...p, res.data]);
      setNewPresetName('');
      addToast('success', 'تم آماده جدید ذخیره شد.');
    } catch {
      addToast('error', 'خطا در ایجاد تم آماده');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-extrabold">
            <Palette className="h-5 w-5 text-[var(--theme-primary)]" />
            <span>موتور مدیریت تم رنگی و پیش‌نمایش لحظه‌ای (CSS Variables)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            هر تغییری را بلافاصله با دکمه پیش‌نمایش ببینید و بدون نیاز به Build مجدد روی کل سایت ذخیره کنید.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPreviewTheme(settings.active_palette, settings.landing_palette);
              addToast('info', 'پیش‌نمایش لحظه‌ای فعال شد.');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Eye className="h-4 w-4" />
            <span>پیش‌نمایش لحظه‌ای</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPreviewTheme(null, null);
              addToast('info', 'پیش‌نمایش لغو شد.');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" />
            <span>بازنشانی پیش‌نمایش</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            style={{ backgroundColor: 'var(--theme-primary)' }}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'در حال ذخیره...' : 'ذخیره و انتشار تم'}</span>
          </button>
        </div>
      </div>

      {/* Preset Selector & New Preset */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold">انتخاب تم آماده (Preset Themes)</h2>
          <SearchableSelect
            label="تم آماده فعال"
            options={presets.map((p) => ({ value: p.slug, label: p.name_fa }))}
            value={settings.active_preset_slug}
            onChange={handleSelectPreset}
          />
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="نام تم آماده جدید (برای ذخیره ترکیب فعلی)..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
            <button
              type="button"
              onClick={handleCreatePreset}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>ذخیره به عنوان Preset</span>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold">تنظیمات تم مستقل لندینگ پیج</h2>
          <label className="flex items-center gap-2.5 text-xs font-medium">
            <input
              type="checkbox"
              checked={settings.landing_theme_enabled}
              onChange={(e) => setSettings({ ...settings, landing_theme_enabled: e.target.checked })}
              className="h-4 w-4 accent-[var(--theme-primary)]"
            />
            <span>اعمال تم رنگی مستقل برای صفحه اول (Landing Page) جدا از سایر صفحات</span>
          </label>
          <SearchableSelect
            label="حالت پیش‌فرض نمایش سایت"
            options={[
              { value: 'light', label: 'حالت روشن (Light Mode)' },
              { value: 'dark', label: 'حالت تاریک (Dark Mode)' },
            ]}
            value={settings.default_mode}
            onChange={(v) => setSettings({ ...settings, default_mode: v as 'light' | 'dark' })}
          />
        </div>
      </div>

      {/* Global Palette Pickers */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-bold">رنگ‌های سراسری وب‌سایت</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PALETTE_LABELS.map((item) => (
            <ColorPicker
              key={item.key}
              label={item.label}
              value={settings.active_palette[item.key]}
              onChange={(val) => updateGlobalKey(item.key, val)}
            />
          ))}
        </div>
      </div>

      {/* Independent Landing Page Palette */}
      {settings.landing_theme_enabled && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-bold">رنگ‌های اختصاصی صفحه اول (Landing Page)</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PALETTE_LABELS.slice(0, 6).map((item) => (
              <ColorPicker
                key={`landing-${item.key}`}
                label={`لندینگ: ${item.label}`}
                value={settings.landing_palette[item.key]}
                onChange={(val) => updateLandingKey(item.key, val)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
