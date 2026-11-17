import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Globe, HardDrive, Moon, Sun } from 'lucide-react';
import type { ColorMode, Language, User } from '../../types/index.ts';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';
import { AnimatedHamburger } from '../effects/index.ts';
import type { AdminNavItem } from './AdminSidebar.tsx';

interface AdminTopbarProps {
  user: User | null;
  language: Language;
  setLanguage: (language: Language) => void;
  colorMode: ColorMode;
  toggleColorMode: () => void;
  currentItem: AdminNavItem;
  mobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  user,
  language,
  setLanguage,
  colorMode,
  toggleColorMode,
  currentItem,
  mobileSidebarOpen,
  onToggleMobileSidebar,
}) => (
  <header
    className="admin-topbar sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900"
    style={{
      backgroundColor: 'var(--theme-header-bg)',
      borderColor: 'var(--theme-border)',
      color: 'var(--theme-header-text)',
    }}
  >
    <div className="flex items-center gap-3 min-w-0">
      <button
        type="button"
        onClick={onToggleMobileSidebar}
        className="rounded-lg border border-slate-200 p-2 lg:hidden dark:border-slate-700"
        aria-label="منو"
        aria-expanded={mobileSidebarOpen}
        aria-controls="admin-sidebar"
      >
        <AnimatedHamburger open={mobileSidebarOpen} />
      </button>
      <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
        <span>پارس پولاد</span>
        <span>/</span>
        <span className="font-semibold text-slate-900 dark:text-white truncate">
          {language === 'fa' ? currentItem.label_fa : currentItem.label_en}
        </span>
      </div>
    </div>

    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={toggleColorMode}
        className="effect-theme-toggle rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        title="تغییر تم"
        aria-label="تغییر تم روشن و تیره"
      >
        {colorMode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium dark:border-slate-700"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{language === 'fa' ? 'EN' : 'FA'}</span>
      </button>
      <Link
        to="/admin/notifications"
        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        title="اعلان‌ها"
      >
        <Bell className="h-4 w-4" />
      </Link>
      <Link
        to="/admin/profile"
        className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium dark:border-slate-700"
      >
        <HardDrive className="hidden" />
        <ZeroBrokenImage
          src={user?.avatar || '/storage/logos/logo-small.png'}
          alt={user?.name ?? ''}
          className="h-5 w-5 rounded-full object-cover"
        />
        <span className="hidden max-w-35 truncate sm:inline">{user?.name}</span>
      </Link>
    </div>
  </header>
);
