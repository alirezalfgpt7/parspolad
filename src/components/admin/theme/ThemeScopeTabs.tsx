import React from 'react';
import { Globe2, LayoutDashboard, PanelsTopLeft } from 'lucide-react';
import type { ThemeScope } from '../../../types/index.ts';

const SCOPES: Array<{
  value: ThemeScope;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { value: 'site', label: 'صفحات عمومی', description: 'صفحات داخلی وب‌سایت', icon: Globe2 },
  { value: 'landing', label: 'لندینگ', description: 'صفحهٔ اصلی مستقل', icon: PanelsTopLeft },
  { value: 'admin', label: 'پنل مدیریت', description: 'داشبورد و ابزارهای مدیریتی', icon: LayoutDashboard },
];

interface ThemeScopeTabsProps {
  selected: ThemeScope;
  onSelect: (scope: ThemeScope) => void;
}

export const ThemeScopeTabs: React.FC<ThemeScopeTabsProps> = ({ selected, onSelect }) => (
  <div className="theme-scope-tabs" role="group" aria-label="محدودهٔ تنظیمات تم">
    {SCOPES.map(({ value, label, description, icon: Icon }) => (
      <button
        key={value}
        type="button"
        aria-pressed={selected === value}
        onClick={() => onSelect(value)}
        className="theme-scope-tab"
      >
        <span className="theme-scope-tab-icon"><Icon className="h-4 w-4" /></span>
        <span className="min-w-0 text-start">
          <span className="block text-xs font-bold">{label}</span>
          <span className="mt-1 block truncate text-[10px] text-slate-500">{description}</span>
        </span>
      </button>
    ))}
  </div>
);
