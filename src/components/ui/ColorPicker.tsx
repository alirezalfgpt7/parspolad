import React from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-(--theme-border) bg-(--theme-surface) px-3 py-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <input
          type="color"
          value={value || '#B91C1C'}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0 shrink-0"
          aria-label={label}
        />
        <span className="truncate text-xs font-medium text-(--theme-text)">
          {label}
        </span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir="ltr"
        className="w-20 rounded border border-(--theme-input-border) bg-(--theme-input-bg) px-2 py-1 text-center font-mono text-xs text-(--theme-input-text) focus:border-(--theme-primary) focus:outline-none"
      />
    </div>
  );
};
