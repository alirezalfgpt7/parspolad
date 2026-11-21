import React from 'react';
import { Check, Layers3, MousePointer2, Palette, Sparkles } from 'lucide-react';
import type {
  ButtonShape,
  ThemeButtonEffect,
  ThemeDesignStyle,
  ThemePalette,
} from '../../../types/index.ts';
import { ThemeButtonsPreview } from './ThemeButtonsPreview.tsx';
import { ThemePaletteEditor } from './ThemePaletteEditor.tsx';

export interface ThemeScopeValues {
  palette: ThemePalette;
  designStyle: ThemeDesignStyle;
  buttonShape: ButtonShape;
  buttonEffect: ThemeButtonEffect;
}

interface ThemeScopeEditorProps {
  title: string;
  description: string;
  values: ThemeScopeValues;
  onChange: (update: Partial<ThemeScopeValues>) => void;
}

const DESIGN_STYLES: Array<{
  value: ThemeDesignStyle;
  label: string;
  description: string;
}> = [
  { value: 'industrial', label: 'صنعتی مهندسی', description: 'خطوط محکم، گوشه‌های جمع‌وجور و کنتراست بالا' },
  { value: 'modern', label: 'مدرن لایه‌ای', description: 'فضای بازتر، کارت‌های نرم و عمق بصری متعادل' },
  { value: 'glass', label: 'شیشه‌ای', description: 'سطوح نیمه‌شفاف، محوشدگی و لایه‌های شناور' },
];

const BUTTON_SHAPES: Array<{ value: ButtonShape; label: string; radius: string }> = [
  { value: 'rounded', label: 'گرد استاندارد', radius: '12px' },
  { value: 'pill', label: 'کپسولی', radius: '9999px' },
  { value: 'square', label: 'گوشه‌دار', radius: '3px' },
];

const BUTTON_EFFECTS: Array<{ value: ThemeButtonEffect; label: string; description: string }> = [
  { value: 'shimmer', label: 'درخشش عبوری', description: 'بازتاب نور هنگام اشاره' },
  { value: 'liquid', label: 'موج مایع', description: 'حرکت نرم لایه در پس‌زمینه' },
  { value: 'glow', label: 'هاله نور', description: 'درخشش ملایم پیرامون دکمه' },
  { value: 'plain', label: 'ساده و مینیمال', description: 'بدون انیمیشن دکمه' },
];

export const ThemeScopeEditor: React.FC<ThemeScopeEditorProps> = ({
  title,
  description,
  values,
  onChange,
}) => (
  <section className="theme-scope-editor space-y-6">
    <header className="theme-scope-heading">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-(--theme-primary-ink)"
        style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 12%, transparent)' }}
      >
        <Layers3 className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h2 className="text-lg font-extrabold text-(--theme-text)">{title}</h2>
        <p className="mt-1 text-xs leading-6 text-(--theme-text-muted)">{description}</p>
      </div>
    </header>

    <div className="theme-editor-section">
      <div className="mb-4 flex items-center gap-2">
        <Palette className="h-4 w-4 text-(--theme-primary-ink)" />
        <div>
          <h3 className="text-sm font-bold text-(--theme-text)">زبان بصری</h3>
          <p className="mt-1 text-xs text-(--theme-text-muted)">ساختار کارت‌ها، سطح‌ها و عمق طراحی این بخش</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {DESIGN_STYLES.map((style) => (
          <button
            key={style.value}
            type="button"
            aria-pressed={values.designStyle === style.value}
            onClick={() => onChange({ designStyle: style.value })}
            className="theme-style-option rounded-2xl border border-(--theme-border) bg-(--theme-surface) p-3 text-start text-(--theme-text)"
          >
            <span className={`theme-style-preview theme-style-preview-${style.value}`} aria-hidden="true">
              <span className="theme-style-preview-header" />
              <span className="theme-style-preview-card"><i /><i /><b /></span>
            </span>
            <span className="mt-3 flex items-center justify-between gap-2 text-xs font-bold">
              {style.label}
              {values.designStyle === style.value && <Check className="h-4 w-4 text-(--theme-primary-ink)" />}
            </span>
            <span className="mt-1 block min-h-9 text-[10px] leading-5 text-(--theme-text-muted)">{style.description}</span>
          </button>
        ))}
      </div>
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      <div className="theme-editor-section">
        <div className="mb-4 flex items-center gap-2">
          <MousePointer2 className="h-4 w-4 text-(--theme-primary-ink)" />
          <div>
            <h3 className="text-sm font-bold text-(--theme-text)">فرم دکمه‌ها</h3>
            <p className="mt-1 text-xs text-(--theme-text-muted)">شکل همهٔ اکشن‌های همین بخش</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {BUTTON_SHAPES.map((shape) => (
            <button
              key={shape.value}
              type="button"
              aria-pressed={values.buttonShape === shape.value}
              onClick={() => onChange({ buttonShape: shape.value })}
              className="theme-shape-option rounded-xl border border-(--theme-border) bg-(--theme-surface) p-3 text-center text-[11px] font-semibold text-(--theme-text)"
            >
              <span
                className="theme-shape-preview"
                style={{ borderRadius: shape.radius }}
                aria-hidden="true"
              />
              <span className="mt-2 block">{shape.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="theme-editor-section">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-(--theme-primary-ink)" />
          <div>
            <h3 className="text-sm font-bold text-(--theme-text)">افکت دکمه</h3>
            <p className="mt-1 text-xs text-(--theme-text-muted)">افکت‌های داخلی و بازنویسی‌شده، بدون CDN</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {BUTTON_EFFECTS.map((effect) => (
            <button
              key={effect.value}
              type="button"
              aria-pressed={values.buttonEffect === effect.value}
              onClick={() => onChange({ buttonEffect: effect.value })}
              className="theme-effect-option rounded-xl border border-(--theme-border) bg-(--theme-surface) p-3 text-start text-(--theme-text)"
            >
              <span className="block text-xs font-bold">{effect.label}</span>
              <span className="mt-1 block text-[10px] leading-5 text-(--theme-text-muted)">{effect.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>

    <ThemeButtonsPreview palette={values.palette} selectedEffect={values.buttonEffect} />
    <ThemePaletteEditor
      palette={values.palette}
      onChange={(key, value) => onChange({ palette: { ...values.palette, [key]: value } })}
    />
  </section>
);
