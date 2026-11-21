import React from 'react';
import { EffectAction } from '../../effects/EffectAction.tsx';
import type { ThemeButtonEffect, ThemePalette } from '../../../types/index.ts';
import { pickReadableForeground } from '../../../utils/themeContrast.ts';

const effectClasses: Record<ThemeButtonEffect, Array<'shimmer' | 'liquid' | 'glow'>> = {
  shimmer: ['shimmer'],
  liquid: ['liquid'],
  glow: ['glow'],
  plain: [],
};

const effectLabels: Record<ThemeButtonEffect, string> = {
  shimmer: 'درخشش عبوری',
  liquid: 'موج مایع',
  glow: 'هاله نور',
  plain: 'ساده',
};

interface ThemeButtonsPreviewProps {
  palette: ThemePalette;
  selectedEffect: ThemeButtonEffect;
}

export const ThemeButtonsPreview: React.FC<ThemeButtonsPreviewProps> = ({
  palette,
  selectedEffect,
}) => {
  const actionText = pickReadableForeground(palette.buttonBg, palette.buttonText, 4.5);
  const primaryText = pickReadableForeground(palette.primary, '#FFFFFF', 4.5);

  return (
    <div className="theme-editor-section">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-(--theme-text)">پیش‌نمایش دکمه‌ها</h3>
        <p className="mt-1 text-xs text-(--theme-text-muted)">دو افکت داخلی در کنار اکشن انتخاب‌شده؛ بدون وابستگی به CDN.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-(--theme-border) bg-(--theme-surface-muted) p-4">
        <EffectAction
          type="button"
          effects={effectClasses[selectedEffect]}
          style={{ backgroundColor: palette.buttonBg, color: actionText }}
          className="theme-action-preview px-5 py-2.5 text-xs font-bold shadow-lg"
        >
          اکشن اصلی
        </EffectAction>
        <EffectAction
          type="button"
          effects={['liquid']}
          style={{ backgroundColor: palette.primary, color: primaryText }}
          className="theme-action-preview px-5 py-2.5 text-xs font-bold shadow-lg"
        >
          موج مایع
        </EffectAction>
        <span className="ms-auto text-[10px] font-medium text-(--theme-text-muted)">
          منتخب: {effectLabels[selectedEffect]}
        </span>
      </div>
    </div>
  );
};
