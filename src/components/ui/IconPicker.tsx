import React, { useState } from 'react';
import { cn } from '../../utils/i18n.ts';
import { DynamicLucideIcon, LUCIDE_ICON_REGISTRY } from './LucideIconMap.tsx';

interface IconPickerProps {
  label: string;
  value: string;
  onChange: (iconName: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ label, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');

  const entries = Object.entries(LUCIDE_ICON_REGISTRY).filter(([key, meta]) => {
    const q = filter.trim().toLowerCase();
    return !q || key.toLowerCase().includes(q) || meta.label.includes(filter.trim());
  });

  const currentMeta = LUCIDE_ICON_REGISTRY[value];

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 transition-colors hover:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        <span className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-(--theme-primary)/10 text-(--theme-primary)">
            <DynamicLucideIcon name={value} className="h-3.5 w-3.5" />
          </span>
          <span>{currentMeta?.label || value}</span>
        </span>
        <span className="font-mono text-[10px] text-slate-400">{value}</span>
      </button>

      {open && (
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="جستجوی آیکون..."
            className="mb-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800"
          />
          <div className="grid max-h-44 grid-cols-5 gap-1.5 overflow-y-auto">
            {entries.map(([key, meta]) => {
              const active = value === key;
              return (
                <button
                  key={key}
                  type="button"
                  title={`${meta.label} (${key})`}
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border p-2 text-[10px] transition-colors',
                    active
                      ? 'border-(--theme-primary) bg-(--theme-primary)/10 text-(--theme-primary)'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
                  )}
                >
                  <meta.icon className="h-4 w-4" />
                  <span className="w-full truncate text-center">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
