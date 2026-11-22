import React from 'react';
import { Check, GlassWater, Square } from 'lucide-react';
import { ColorPicker } from '../../ui/ColorPicker.tsx';
import type { LandingHeaderSettings, ThemePalette } from '../../../types/index.ts';
import { ensureContrastAgainst } from '../../../utils/themeContrast.ts';
import { WaveHeroEffect } from '../../effects/WaveHeroEffect.tsx';

interface LandingHeaderSettingsEditorProps {
  settings: LandingHeaderSettings;
  palette: ThemePalette;
  onChange: (settings: LandingHeaderSettings) => void;
  onPaletteChange: (palette: ThemePalette) => void;
}

export const LandingHeaderSettingsEditor: React.FC<LandingHeaderSettingsEditorProps> = ({
  settings,
  palette,
  onChange,
  onPaletteChange,
}) => {
  const readableText = ensureContrastAgainst(palette.headerText, [palette.headerBg], 4.5);
  const previewSurface = settings.mode === 'glass'
    ? `color-mix(in srgb, ${palette.headerBg} 88%, transparent)`
    : palette.headerBg;

  const update = (patch: Partial<LandingHeaderSettings>) => {
    onChange({ ...settings, ...patch });
  };

  return (
    <section className="theme-editor-section space-y-5">
      <header>
        <h3 className="text-sm font-bold text-(--theme-text)">تنظیمات هدر صفحهٔ اصلی</h3>
        <p className="mt-1 text-xs leading-5 text-(--theme-text-muted)">
          ظاهر نوار اطلاعات و منوی بالای لندینگ مستقل از رنگ‌های پنل و صفحات داخلی تنظیم می‌شود.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ColorPicker
          label="رنگ زمینه هدر"
          value={palette.headerBg}
          onChange={(headerBg) => onPaletteChange({ ...palette, headerBg })}
        />
        <ColorPicker
          label="رنگ نوشته و آیکن"
          value={palette.headerText}
          onChange={(headerText) => onPaletteChange({ ...palette, headerText })}
        />
        <ColorPicker
          label="رنگ حاشیه"
          value={settings.border_color}
          onChange={(border_color) => update({ border_color })}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <fieldset>
          <legend className="mb-2 text-xs font-semibold text-(--theme-text)">حالت نمایش</legend>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'glass', label: 'شیشه‌ای', Icon: GlassWater },
              { value: 'solid', label: 'یکپارچه', Icon: Square },
            ] as const).map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={settings.mode === value}
                onClick={() => update({ mode: value })}
                className="theme-style-option flex items-center justify-between gap-2 rounded-xl border border-(--theme-border) bg-(--theme-surface) px-3 py-2.5 text-xs font-semibold text-(--theme-text)"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-(--theme-primary-ink)" />
                  {label}
                </span>
                {settings.mode === value && <Check className="h-4 w-4 text-(--theme-primary-ink)" />}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="text-xs font-semibold text-(--theme-text)">
          <span className="mb-2 flex items-center justify-between">
            <span>گردی گوشه‌های هدر</span>
            <span className="font-mono text-(--theme-text-muted)" dir="ltr">{settings.radius}px</span>
          </span>
          <input
            type="range"
            min="0"
            max="36"
            step="1"
            value={settings.radius}
            onChange={(event) => update({ radius: Number(event.target.value) })}
            className="w-full accent-(--theme-primary)"
            aria-label="گردی گوشه‌های هدر"
          />
        </label>

        {settings.mode === 'glass' && (
          <label className="text-xs font-semibold text-(--theme-text) lg:col-span-2">
            <span className="mb-2 flex items-center justify-between">
              <span>شدت محوشدگی شیشه</span>
              <span className="font-mono text-(--theme-text-muted)" dir="ltr">{settings.blur}px</span>
            </span>
            <input
              type="range"
              min="0"
              max="32"
              step="1"
              value={settings.blur}
              onChange={(event) => update({ blur: Number(event.target.value) })}
              className="w-full accent-(--theme-primary)"
              aria-label="شدت محوشدگی هدر"
            />
          </label>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-(--theme-text)">رنگ موج زیر اسلایدر صفحهٔ اصلی</h4>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {([
            { index: 0, label: 'رنگ موج اول' },
            { index: 1, label: 'رنگ موج دوم' },
            { index: 2, label: 'رنگ موج سوم' },
          ] as const).map(({ index, label }) => (
            <ColorPicker
              key={index}
              label={label}
              value={settings.wave_colors[index]}
              onChange={(color) => {
                const wave_colors: [string, string, string] = [...settings.wave_colors];
                wave_colors[index] = color;
                update({ wave_colors });
              }}
            />
          ))}
          <ColorPicker
            label="رنگ موج پایه"
            value={settings.wave_bottom_color}
            onChange={(wave_bottom_color) => update({ wave_bottom_color })}
          />
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-xl border border-(--theme-border) p-4 sm:p-6"
        style={{
          backgroundImage: `linear-gradient(120deg, ${palette.primary} 0%, ${palette.secondary} 54%, ${palette.accent} 100%)`,
        }}
      >
        <div
          className="flex min-h-14 items-center justify-between gap-4 border px-4 py-3 shadow-lg"
          style={{
            color: readableText,
            backgroundColor: previewSurface,
            borderColor: settings.border_color,
            borderRadius: `${settings.radius}px`,
            backdropFilter: settings.mode === 'glass' ? `blur(${settings.blur}px)` : 'none',
            WebkitBackdropFilter: settings.mode === 'glass' ? `blur(${settings.blur}px)` : 'none',
          }}
          aria-label="پیش‌نمایش هدر صفحه اصلی"
        >
          <span className="truncate text-xs font-extrabold">پارس پولاد آقایی</span>
          <span className="hidden items-center gap-4 text-[10px] font-semibold sm:flex">
            <span>خانه</span>
            <span>پروژه‌ها</span>
            <span>خدمات</span>
          </span>
          <span
            className="shrink-0 rounded-lg px-3 py-2 text-[10px] font-bold"
            style={{ backgroundColor: palette.buttonBg, color: palette.buttonText }}
          >
            درخواست همکاری
          </span>
        </div>
      </div>
      <div
        className="relative h-24 overflow-hidden rounded-xl border border-(--theme-border) bg-slate-950"
        aria-label="پیش‌نمایش موج زیر اسلایدر صفحه اصلی"
      >
        <div className="absolute inset-x-0 bottom-0">
          <WaveHeroEffect
            waveColors={settings.wave_colors}
            bottomFill={`color-mix(in srgb, var(--theme-bg) 84%, ${settings.wave_bottom_color})`}
          />
        </div>
      </div>
    </section>
  );
};
