import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { ThemeScopeEditor, type ThemeScopeValues } from '../../components/admin/theme/ThemeScopeEditor.tsx';
import { ThemeScopeTabs } from '../../components/admin/theme/ThemeScopeTabs.tsx';
import { ThemeStudioHero } from '../../components/admin/theme/ThemeStudioHero.tsx';
import { PagePreloader } from '../../components/common/PagePreloader.tsx';
import { EffectAction } from '../../components/effects/EffectAction.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { ThemePreset, ThemeScope, ThemeSettings } from '../../types/index.ts';

export const ThemeAdminPage: React.FC = () => {
  const { fetchBootstrap, setPreviewTheme, addToast } = useAppStore();
  const [settings, setSettings] = useState<ThemeSettings | null>(null);
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [scope, setScope] = useState<ThemeScope>('admin');
  const [newPresetName, setNewPresetName] = useState('');
  const [saving, setSaving] = useState(false);
  const [creatingPreset, setCreatingPreset] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest<{ settings: ThemeSettings; presets: ThemePreset[] }>('/admin/themes')
      .then((response) => {
        if (!active) return;
        setSettings(response.settings);
        setPresets(response.presets);
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error('Could not load theme studio settings.', error);
        addToast('error', 'دریافت تنظیمات تم ناموفق بود. اتصال سرور را بررسی کنید.');
      });

    return () => {
      active = false;
      setPreviewTheme(null);
    };
  }, [addToast, setPreviewTheme]);

  const scopeValues = useMemo<ThemeScopeValues | null>(() => {
    if (!settings) return null;
    switch (scope) {
      case 'landing':
        return {
          palette: settings.landing_palette,
          designStyle: settings.landing_design_style,
          buttonShape: settings.landing_button_shape,
          buttonEffect: settings.landing_button_effect,
        };
      case 'admin':
        return {
          palette: settings.admin_palette,
          designStyle: settings.admin_design_style,
          buttonShape: settings.admin_button_shape,
          buttonEffect: settings.admin_button_effect,
        };
      default:
        return {
          palette: settings.active_palette,
          designStyle: settings.design_style,
          buttonShape: settings.button_shape,
          buttonEffect: settings.button_effect,
        };
    }
  }, [scope, settings]);

  const previewSettings = (
    next: ThemeSettings,
    previewScope = scope,
    previewMode: ThemeSettings['default_mode'] | null = null
  ) => {
    setSettings(next);
    setPreviewTheme(next, previewScope, previewMode);
  };

  const updateScope = (update: Partial<ThemeScopeValues>) => {
    if (!settings) return;
    let next: ThemeSettings;
    if (scope === 'landing') {
      next = {
        ...settings,
        ...(update.palette ? { landing_palette: update.palette } : {}),
        ...(update.designStyle ? { landing_design_style: update.designStyle } : {}),
        ...(update.buttonShape ? { landing_button_shape: update.buttonShape } : {}),
        ...(update.buttonEffect ? { landing_button_effect: update.buttonEffect } : {}),
      };
    } else if (scope === 'admin') {
      next = {
        ...settings,
        ...(update.palette ? { admin_palette: update.palette } : {}),
        ...(update.designStyle ? { admin_design_style: update.designStyle } : {}),
        ...(update.buttonShape ? { admin_button_shape: update.buttonShape } : {}),
        ...(update.buttonEffect ? { admin_button_effect: update.buttonEffect } : {}),
      };
    } else {
      next = {
        ...settings,
        ...(update.palette ? { active_palette: update.palette } : {}),
        ...(update.designStyle ? { design_style: update.designStyle } : {}),
        ...(update.buttonShape ? { button_shape: update.buttonShape } : {}),
        ...(update.buttonEffect ? { button_effect: update.buttonEffect } : {}),
      };
    }
    previewSettings(next);
  };

  const handleSelectScope = (nextScope: ThemeScope) => {
    if (!settings) return;
    setScope(nextScope);
    setPreviewTheme(settings, nextScope);
  };

  const handleSelectPreset = (slug: string) => {
    if (!settings) return;
    const preset = presets.find((item) => item.slug === slug);
    if (!preset) return;
    previewSettings({
      ...settings,
      active_preset_slug: preset.slug,
      active_palette: { ...preset.palette },
      design_style: preset.design_style,
      button_shape: preset.button_shape,
      button_effect: preset.button_effect,
    }, 'site');
    setScope('site');
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await apiRequest('/admin/themes', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      setPreviewTheme(null);
      await fetchBootstrap();
      addToast('success', 'تنظیمات مستقل سایت، لندینگ و پنل ذخیره و منتشر شد.');
    } catch (error: unknown) {
      console.error('Could not save theme settings.', error);
      addToast('error', 'ذخیره تنظیمات تم ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePreset = async () => {
    if (!settings || !newPresetName.trim()) return;
    setCreatingPreset(true);
    try {
      const response = await apiRequest<{ data: ThemePreset }>('/admin/themes/presets', {
        method: 'POST',
        body: JSON.stringify({
          slug: `custom-${Date.now()}`,
          name_fa: newPresetName.trim(),
          name_en: newPresetName.trim(),
          is_default: false,
          palette: settings.active_palette,
          design_style: settings.design_style,
          button_shape: settings.button_shape,
          button_effect: settings.button_effect,
        }),
      });
      setPresets((current) => [...current, response.data]);
      setNewPresetName('');
      addToast('success', 'ترکیب صفحات عمومی به‌عنوان تم آماده ذخیره شد.');
    } catch (error: unknown) {
      console.error('Could not create theme preset.', error);
      addToast('error', 'ساخت تم آماده ناموفق بود.');
    } finally {
      setCreatingPreset(false);
    }
  };

  if (!settings || !scopeValues) {
    return <PagePreloader label="در حال آماده‌سازی استودیو هویت بصری..." />;
  }

  return (
    <div className="theme-studio-page space-y-6">
      <ThemeStudioHero
        onPreview={() => {
          setPreviewTheme(settings, scope);
          addToast('info', 'پیش‌نمایش محدودهٔ انتخاب‌شده فعال شد.');
        }}
        onResetPreview={() => {
          setPreviewTheme(null);
          addToast('info', 'پیش‌نمایش لغو شد.');
        }}
      />

      <ThemeScopeTabs selected={scope} onSelect={handleSelectScope} />

      {scope === 'landing' && (
        <label className="theme-editor-section flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={settings.landing_theme_enabled}
            onChange={(event) => {
              const next = { ...settings, landing_theme_enabled: event.target.checked };
              previewSettings(next, 'landing');
            }}
            className="mt-1 h-4 w-4 accent-(--theme-primary)"
          />
          <span>
            <span className="block text-xs font-bold">فعال‌سازی تم مستقل لندینگ</span>
            <span className="mt-1 block text-[11px] leading-5 text-slate-500">
              با خاموش‌کردن این گزینه، صفحهٔ اصلی از تم صفحات عمومی استفاده می‌کند.
            </span>
          </span>
        </label>
      )}

      <ThemeScopeEditor
        title={
          scope === 'landing'
            ? 'طراحی صفحهٔ اصلی'
            : scope === 'admin'
              ? 'طراحی پنل مدیریت'
              : 'طراحی صفحات عمومی'
        }
        description={
          scope === 'landing'
            ? 'پالت، سبک سطوح، فرم و افکت دکمهٔ صفحهٔ اصلی مستقل از پنل و سایر صفحات ذخیره می‌شود.'
            : scope === 'admin'
              ? 'ظاهر داشبورد، سربرگ، منوی کناری و اکشن‌های پنل را جداگانه تنظیم کنید.'
              : 'تم پایهٔ صفحات داخلی وب‌سایت؛ لندینگ و پنل می‌توانند تنظیم مستقل داشته باشند.'
        }
        values={scopeValues}
        onChange={updateScope}
      />

      {scope === 'site' && (
        <section className="theme-editor-section grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid gap-4 sm:grid-cols-2">
            <SearchableSelect
              label="تم آمادهٔ صفحات عمومی"
              options={presets.map((preset) => ({ value: preset.slug, label: preset.name_fa }))}
              value={settings.active_preset_slug}
              onChange={handleSelectPreset}
            />
            <div className="flex items-end gap-2">
              <label className="min-w-0 flex-1 text-xs font-medium">
                ذخیرهٔ ترکیب فعلی
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(event) => setNewPresetName(event.target.value)}
                  placeholder="نام تم آماده"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
              <button
                type="button"
                disabled={!newPresetName.trim() || creatingPreset}
                onClick={handleCreatePreset}
                className="theme-secondary-action inline-flex h-10.5 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
              >
                <Plus className="h-4 w-4" />
                <span>{creatingPreset ? 'در حال ذخیره' : 'ذخیره'}</span>
              </button>
            </div>
          </div>
          <SearchableSelect
            label="حالت پیش‌فرض"
            options={[
              { value: 'light', label: 'روشن' },
              { value: 'dark', label: 'تاریک' },
            ]}
            value={settings.default_mode}
            onChange={(value) => {
              const next = {
                ...settings,
                default_mode: value as ThemeSettings['default_mode'],
              };
              previewSettings(next, scope, next.default_mode);
            }}
          />
        </section>
      )}

      <div className="flex justify-end">
        <EffectAction
          type="button"
          disabled={saving}
          onClick={handleSave}
          style={{ backgroundColor: 'var(--theme-btn-bg)', color: 'var(--theme-btn-text)' }}
          className="inline-flex min-h-11 items-center gap-2 px-5 text-xs font-bold shadow-lg disabled:cursor-wait disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'در حال ذخیره و انتشار...' : 'ذخیره و انتشار تنظیمات'}</span>
        </EffectAction>
      </div>
    </div>
  );
};
