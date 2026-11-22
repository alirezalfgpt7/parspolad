import React, { useEffect, useMemo, useState } from 'react';
import { Check, Palette, Plus, RotateCcw, Save, SwatchBook } from 'lucide-react';
import { ThemeScopeEditor, type ThemeScopeValues } from '../../components/admin/theme/ThemeScopeEditor.tsx';
import { ThemeScopeTabs } from '../../components/admin/theme/ThemeScopeTabs.tsx';
import { ThemeStudioHero } from '../../components/admin/theme/ThemeStudioHero.tsx';
import { LandingHeaderSettingsEditor } from '../../components/admin/theme/LandingHeaderSettingsEditor.tsx';
import { PublicPageTitleSettingsEditor } from '../../components/admin/theme/PublicPageTitleSettingsEditor.tsx';
import { PagePreloader } from '../../components/common/PagePreloader.tsx';
import { EffectAction } from '../../components/effects/EffectAction.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { LandingHeaderSettings, PublicPageTitleSettings, ThemePreset, ThemeScope, ThemeSettings } from '../../types/index.ts';
import { DEFAULT_LANDING_HEADER_SETTINGS, DEFAULT_PUBLIC_PAGE_TITLE_SETTINGS } from '../../utils/brandingDefaults.ts';
import { ensureContrastAgainst, pickReadableForeground } from '../../utils/themeContrast.ts';

export const ThemeAdminPage: React.FC = () => {
  const { fetchBootstrap, setPreviewTheme, setColorMode, addToast } = useAppStore();
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
    let next = settings;
    if (scope === 'landing') {
      next = {
        ...settings,
        landing_theme_enabled: true,
        landing_palette: { ...preset.palette },
        landing_design_style: preset.design_style,
        landing_button_shape: preset.button_shape,
        landing_button_effect: preset.button_effect,
      };
    } else if (scope === 'admin') {
      next = {
        ...settings,
        admin_palette: { ...preset.palette },
        admin_design_style: preset.design_style,
        admin_button_shape: preset.button_shape,
        admin_button_effect: preset.button_effect,
      };
    } else {
      next = {
        ...settings,
        active_preset_slug: preset.slug,
        active_palette: { ...preset.palette },
        design_style: preset.design_style,
        button_shape: preset.button_shape,
        button_effect: preset.button_effect,
      };
    }
    previewSettings(next, scope);
  };

  const handleResetScopeDefaults = () => {
    if (!settings) return;
    const preset = presets.find((item) => item.is_default) || presets[0];
    if (!preset) return;
    const next = scope === 'landing'
      ? {
          ...settings,
          landing_theme_enabled: true,
          landing_palette: { ...preset.palette },
          landing_design_style: preset.design_style,
          landing_button_shape: preset.button_shape,
          landing_button_effect: preset.button_effect,
          landing_header_settings: { ...DEFAULT_LANDING_HEADER_SETTINGS },
        }
      : scope === 'admin'
        ? {
            ...settings,
            admin_palette: { ...preset.palette },
            admin_design_style: preset.design_style,
            admin_button_shape: preset.button_shape,
            admin_button_effect: preset.button_effect,
          }
        : {
            ...settings,
            active_preset_slug: preset.slug,
            default_mode: 'light' as ThemeSettings['default_mode'],
            active_palette: { ...preset.palette },
            design_style: preset.design_style,
            button_shape: preset.button_shape,
            button_effect: preset.button_effect,
            public_page_title_settings: { ...DEFAULT_PUBLIC_PAGE_TITLE_SETTINGS },
          };
    if (scope === 'site') {
      setColorMode('light');
    }
    previewSettings(next, scope, scope === 'site' ? 'light' : null);
    addToast('info', 'تنظیمات این بخش به تم پیش‌فرض قرمز صنعتی بازگشت.');
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
    if (!settings || !scopeValues || !newPresetName.trim()) return;
    setCreatingPreset(true);
    try {
      const currentValues = scopeValues;
      const response = await apiRequest<{ data: ThemePreset }>('/admin/themes/presets', {
        method: 'POST',
        body: JSON.stringify({
          slug: `custom-${Date.now()}`,
          name_fa: newPresetName.trim(),
          name_en: newPresetName.trim(),
          is_default: false,
          palette: currentValues.palette,
          design_style: currentValues.designStyle,
          button_shape: currentValues.buttonShape,
          button_effect: currentValues.buttonEffect,
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

      <section className="theme-editor-section">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-(--theme-primary-ink)"
              style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 12%, transparent)' }}
            >
              <SwatchBook className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-(--theme-text)">کتابچهٔ تم‌های آماده</h2>
              <p className="mt-1 text-[11px] text-(--theme-text-muted)">
                یک ترکیب انتخاب کنید؛ پیش‌نمایش آن روی محدودهٔ فعال اعمال می‌شود.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetScopeDefaults}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-(--theme-border) bg-(--theme-surface) px-3 text-xs font-bold text-(--theme-text) transition hover:border-(--theme-primary) hover:text-(--theme-primary-ink)"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            بازگشت به پیش‌فرض قرمز صنعتی
          </button>
        </div>

        <div className="theme-preset-grid">
          {presets.map((preset) => {
            const isActive = scope === 'site'
              ? settings.active_preset_slug === preset.slug
              : scope === 'landing'
                ? settings.landing_palette.primary === preset.palette.primary
                  && settings.landing_palette.secondary === preset.palette.secondary
                : settings.admin_palette.primary === preset.palette.primary
                  && settings.admin_palette.secondary === preset.palette.secondary;

            const miniHeaderBar = ensureContrastAgainst(preset.palette.headerText, [preset.palette.headerBg], 4.5);
            const miniCardText = ensureContrastAgainst(preset.palette.text, [preset.palette.surface], 4.5);
            const miniPrimaryInk = ensureContrastAgainst(preset.palette.primary, [preset.palette.surface, preset.palette.background], 3.2);
            const swatchColors = [
              preset.palette.primary,
              preset.palette.secondary,
              preset.palette.accent,
              preset.palette.background,
              preset.palette.surface,
            ];

            return (
              <button
                key={preset.slug}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleSelectPreset(preset.slug)}
                className="theme-preset-card"
              >
                <span
                  className="theme-preset-preview"
                  style={{ backgroundColor: preset.palette.background }}
                  aria-hidden="true"
                >
                  <span
                    className="theme-preset-mini-header"
                    style={{ backgroundColor: preset.palette.headerBg }}
                  >
                    <span className="theme-preset-mini-brand">
                      <span
                        className="theme-preset-mini-mark"
                        style={{ backgroundColor: preset.palette.primary }}
                      />
                      <span
                        className="theme-preset-mini-bar"
                        style={{ backgroundColor: miniHeaderBar }}
                      />
                    </span>
                  </span>

                  <span
                    className="theme-preset-mini-body"
                    style={{ backgroundColor: preset.palette.background }}
                  >
                    <span
                      className="theme-preset-mini-card"
                      style={{ backgroundColor: preset.palette.surface }}
                    >
                      <span className="theme-preset-mini-lines">
                        <span
                          className="theme-preset-mini-title"
                          style={{ backgroundColor: miniCardText }}
                        />
                        <span
                          className="theme-preset-mini-sub"
                          style={{ backgroundColor: miniCardText }}
                        />
                      </span>
                      <span className="theme-preset-mini-footer">
                        <span
                          className="theme-preset-mini-cta"
                          style={{ backgroundColor: preset.palette.buttonBg }}
                        />
                        <span
                          className="theme-preset-mini-mark"
                          style={{ backgroundColor: preset.palette.accent }}
                        />
                      </span>
                    </span>

                    <span className="theme-preset-swatches">
                      {swatchColors.map((color, index) => (
                        <span
                          key={`${preset.slug}-${color}-${index}`}
                          className="theme-preset-swatch"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>
                  </span>

                  <span
                    className="theme-preset-icon"
                    style={
                      isActive
                        ? {
                            backgroundColor: preset.palette.primary,
                            color: pickReadableForeground(preset.palette.primary, '#FFFFFF'),
                            borderColor: 'transparent',
                          }
                        : {
                            backgroundColor: preset.palette.surface,
                            color: miniPrimaryInk,
                          }
                    }
                  >
                    {isActive ? <Check className="h-3.5 w-3.5" /> : <Palette className="h-3.5 w-3.5" />}
                  </span>
                </span>
                <span className="mt-3 flex items-start justify-between gap-2 text-start">
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-(--theme-text)">{preset.name_fa}</span>
                    <span className="mt-1 block truncate text-[10px] text-(--theme-text-muted)" dir="ltr">{preset.name_en}</span>
                  </span>
                  {preset.is_default && (
                    <span className="shrink-0 rounded-lg bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                      پیش‌فرض
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

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
            <span className="block text-xs font-bold text-(--theme-text)">فعال‌سازی تم مستقل لندینگ</span>
            <span className="mt-1 block text-[11px] leading-5 text-(--theme-text-muted)">
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

      {scope === 'landing' && (
        <LandingHeaderSettingsEditor
          settings={settings.landing_header_settings}
          palette={settings.landing_palette}
          onChange={(landing_header_settings: LandingHeaderSettings) => {
            previewSettings({ ...settings, landing_header_settings }, 'landing');
          }}
          onPaletteChange={(landing_palette) => {
            previewSettings({ ...settings, landing_palette }, 'landing');
          }}
        />
      )}

      {scope === 'site' && (
        <PublicPageTitleSettingsEditor
          settings={settings.public_page_title_settings}
          onChange={(public_page_title_settings: PublicPageTitleSettings) => {
            previewSettings({ ...settings, public_page_title_settings }, 'site');
          }}
        />
      )}

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
              <label className="min-w-0 flex-1 text-xs font-medium text-(--theme-text)">
                ذخیرهٔ ترکیب فعلی
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(event) => setNewPresetName(event.target.value)}
                  placeholder="نام تم آماده"
                  className="mt-1.5 w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2.5 text-xs text-(--theme-input-text) placeholder:text-(--theme-placeholder)"
                />
              </label>
              <button
                type="button"
                disabled={!newPresetName.trim() || creatingPreset}
                onClick={handleCreatePreset}
                className="theme-secondary-action inline-flex h-10.5 shrink-0 items-center gap-1.5 rounded-xl border border-(--theme-border) bg-(--theme-surface) px-3 text-xs font-semibold text-(--theme-text) transition hover:border-(--theme-primary) hover:text-(--theme-primary-ink) disabled:cursor-not-allowed disabled:opacity-50"
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
              const mode = value as ThemeSettings['default_mode'];
              const next = {
                ...settings,
                default_mode: mode,
              };
              setColorMode(mode);
              previewSettings(next, scope, mode);
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
