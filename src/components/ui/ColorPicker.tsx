import React from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2.5 min-w-0">
        <input
          type="color"
          value={value || '#B91C1C'}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0 shrink-0"
          aria-label={label}
        />
        <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
          {label}
        </span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir="ltr"
        className="w-20 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-center font-mono text-xs text-slate-800 focus:border-(--theme-primary) focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      />
    </div>
  );
};
