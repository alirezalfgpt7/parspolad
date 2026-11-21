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
      <label className="block text-xs font-medium text-(--theme-text)">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-xs font-medium text-(--theme-input-text) transition-colors hover:border-(--theme-primary)"
      >
        <span className="flex items-center gap-2">
          <span
            className="grid h-6 w-6 place-items-center rounded-md text-(--theme-primary-ink)"
            style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 12%, transparent)' }}
          >
            <DynamicLucideIcon name={value} className="h-3.5 w-3.5" />
          </span>
          <span>{currentMeta?.label || value}</span>
        </span>
        <span className="font-mono text-[10px] text-(--theme-text-muted)">{value}</span>
      </button>

      {open && (
        <div className="theme-popover rounded-xl border border-(--theme-border) bg-(--theme-surface) p-2.5 text-(--theme-text) shadow-lg">
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="جستجوی آیکون..."
            className="mb-2 w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5 py-1.5 text-xs text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)"
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
                  style={active ? { backgroundColor: 'color-mix(in srgb, var(--theme-primary) 12%, transparent)' } : undefined}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border p-2 text-[10px] transition-colors',
                    active
                      ? 'border-(--theme-primary) text-(--theme-primary-ink)'
                      : 'border-(--theme-border) text-(--theme-text) hover:bg-(--theme-surface-muted)'
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
