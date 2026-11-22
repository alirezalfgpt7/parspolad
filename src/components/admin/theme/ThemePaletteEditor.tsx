import React from 'react';
import type { ThemePalette } from '../../../types/index.ts';
import { ColorPicker } from '../../ui/ColorPicker.tsx';
import { AlertTriangle } from 'lucide-react';

const PALETTE_LABELS: Array<{ key: keyof ThemePalette; label: string }> = [
  { key: 'primary', label: 'رنگ اصلی' },
  { key: 'secondary', label: 'رنگ ثانویه' },
  { key: 'accent', label: 'رنگ تاکید' },
  { key: 'background', label: 'پس‌زمینه' },
  { key: 'surface', label: 'کارت و سطوح' },
  { key: 'text', label: 'متن اصلی' },
  { key: 'headerBg', label: 'پس‌زمینه سربرگ' },
  { key: 'headerText', label: 'متن سربرگ' },
  { key: 'footerBg', label: 'پس‌زمینه پابرگ' },
  { key: 'footerText', label: 'متن پابرگ' },
  { key: 'buttonBg', label: 'پس‌زمینه دکمه' },
  { key: 'buttonText', label: 'متن دکمه' },
  { key: 'link', label: 'پیوندها' },
];

interface ThemePaletteEditorProps {
  palette: ThemePalette;
  onChange: (key: keyof ThemePalette, value: string) => void;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const normalized = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return [0, 0, 0];
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
};

const luminance = (hex: string): number => {
  const rgb = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
};

const contrastRatio = (first: string, second: string): number => {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
};

export const ThemePaletteEditor: React.FC<ThemePaletteEditorProps> = ({ palette, onChange }) => {
  const checks = [
    { label: 'دکمه', foreground: palette.buttonText, background: palette.buttonBg },
    { label: 'سربرگ', foreground: palette.headerText, background: palette.headerBg },
    { label: 'پابرگ', foreground: palette.footerText, background: palette.footerBg },
    { label: 'محتوا', foreground: palette.text, background: palette.surface },
  ];
  const lowContrast = checks.filter((check) => contrastRatio(check.foreground, check.background) < 4.5);

  return (
  <div className="theme-editor-section">
    <div className="mb-4">
      <h3 className="text-sm font-bold">رنگ‌های این بخش</h3>
      <p className="mt-1 text-xs text-slate-500">رنگ‌ها فقط روی همین محدودهٔ انتخاب‌شده اعمال می‌شوند.</p>
    </div>
    {lowContrast.length > 0 && (
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
        <AlertTriangle className="h-4 w-4" />
        <span className="font-bold">
          {`کنتراست ضعیف در ${lowContrast.map((check) => check.label).join('، ')}؛ متن یا پس‌زمینه را اصلاح کنید`}
        </span>
      </div>
    )}
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {PALETTE_LABELS.map(({ key, label }) => (
        <ColorPicker
          key={key}
          label={label}
          value={palette[key]}
          onChange={(value) => onChange(key, value)}
        />
      ))}
    </div>
  </div>
  );
};
