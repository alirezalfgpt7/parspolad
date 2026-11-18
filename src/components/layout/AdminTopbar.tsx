import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Bell, Globe, Home, LogOut, Moon, Sun, UserCircle } from 'lucide-react';
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
  dockOpposite: boolean;
  onToggleDock: () => void;
  onLogout: () => void;
}

const getRoleLabel = (role: string | undefined, language: Language): string => {
  if (!role) return '';

  const labels: Record<string, [string, string]> = {
    super_admin: ['سوپر ادمین', 'Super Admin'],
    admin: ['مدیر سامانه', 'Admin'],
    editor: ['ویرایشگر محتوا', 'Content Editor'],
    project_manager: ['اپراتور فنی', 'Technical Operator'],
    client: ['کاربر ثبت‌نام‌شده', 'Registered User'],
  };

  const label = labels[role];
  return label ? label[language === 'fa' ? 0 : 1] : role;
};

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  user,
  language,
  setLanguage,
  colorMode,
  toggleColorMode,
  currentItem,
  mobileSidebarOpen,
  onToggleMobileSidebar,
  dockOpposite,
  onToggleDock,
  onLogout,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !userMenuRef.current?.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setUserMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userMenuOpen]);

  const roleLabel = getRoleLabel(user?.role, language);

  return (
    <header
      className="admin-topbar relative z-40 isolate flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900"
      style={{
        backgroundColor: 'var(--theme-header-bg)',
        borderColor: 'var(--theme-border)',
        color: 'var(--theme-header-text)',
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="rounded-lg border border-slate-200 p-2 lg:hidden dark:border-slate-700"
          aria-label={language === 'fa' ? 'منو' : 'Menu'}
          aria-expanded={mobileSidebarOpen}
          aria-controls="admin-sidebar"
        >
          <AnimatedHamburger open={mobileSidebarOpen} />
        </button>
        <div className="flex items-center gap-2 truncate text-xs text-slate-500">
          <span>پارس پولاد</span>
          <span>/</span>
          <span className="truncate font-semibold text-slate-900 dark:text-white">
            {language === 'fa' ? currentItem.label_fa : currentItem.label_en}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          to="/"
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          title={language === 'fa' ? 'وب‌سایت' : 'Website'}
          aria-label={language === 'fa' ? 'رفتن به وب‌سایت' : 'Go to website'}
        >
          <Home className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={onToggleDock}
          className="hidden rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:inline-flex dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          title={dockOpposite
            ? (language === 'fa' ? 'بازگشت سایدبار به جای پیش‌فرض' : 'Restore sidebar position')
            : (language === 'fa' ? 'انتقال سایدبار به سمت دیگر' : 'Move sidebar to the other side')}
          aria-label={dockOpposite
            ? (language === 'fa' ? 'بازگشت سایدبار به جای پیش‌فرض' : 'Restore sidebar position')
            : (language === 'fa' ? 'انتقال سایدبار به سمت دیگر' : 'Move sidebar to the other side')}
        >
          <ArrowLeftRight className="h-4 w-4" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          onClick={toggleColorMode}
          className="effect-theme-toggle rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          title={language === 'fa' ? 'تغییر تم' : 'Toggle theme'}
          aria-label={language === 'fa' ? 'تغییر تم روشن و تیره' : 'Toggle light and dark mode'}
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
          title={language === 'fa' ? 'اعلان‌ها' : 'Notifications'}
          aria-label={language === 'fa' ? 'اعلان‌ها' : 'Notifications'}
        >
          <Bell className="h-4 w-4" />
        </Link>
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-start text-xs font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
            aria-controls="admin-user-menu"
          >
            <ZeroBrokenImage
              src={user?.avatar || '/storage/logos/logo-small.png'}
              alt=""
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="hidden max-w-36 sm:flex sm:flex-col">
              <span className="truncate">{user?.name}</span>
              <span className="truncate text-[10px] font-normal text-slate-500">{roleLabel}</span>
            </span>
          </button>
          {userMenuOpen && (
            <div
              id="admin-user-menu"
              role="menu"
              className="theme-popover absolute end-0 top-full z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 text-slate-700 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              style={{ backgroundColor: 'var(--theme-surface)' }}
            >
              <Link
                to="/admin/profile"
                role="menuitem"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <UserCircle className="h-4 w-4" />
                {language === 'fa' ? 'پروفایل' : 'Profile'}
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setUserMenuOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <LogOut className="h-4 w-4" />
                {language === 'fa' ? 'خروج از حساب' : 'Sign out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
