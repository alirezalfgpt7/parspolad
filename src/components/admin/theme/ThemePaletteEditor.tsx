import React from 'react';
import type { ThemePalette } from '../../../types/index.ts';
import { ColorPicker } from '../../ui/ColorPicker.tsx';

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

export const ThemePaletteEditor: React.FC<ThemePaletteEditorProps> = ({ palette, onChange }) => (
  <div className="theme-editor-section">
    <div className="mb-4">
      <h3 className="text-sm font-bold">رنگ‌های این بخش</h3>
      <p className="mt-1 text-xs text-slate-500">رنگ‌ها فقط روی همین محدودهٔ انتخاب‌شده اعمال می‌شوند.</p>
    </div>
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
