import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Bell, Globe, Home, LogOut, Moon, Sun, UserCircle } from 'lucide-react';
import type { ColorMode, Language, User } from '../../types/index.ts';
import { useAppStore } from '../../store/useAppStore.ts';
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
  const previewMode = useAppStore((state) => state.previewMode);
  const effectiveColorMode = previewMode || colorMode;
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
      className="admin-topbar relative z-40 isolate flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="admin-topbar-control rounded-lg p-2 lg:hidden"
          aria-label={language === 'fa' ? 'منو' : 'Menu'}
          aria-expanded={mobileSidebarOpen}
          aria-controls="admin-sidebar"
        >
          <AnimatedHamburger open={mobileSidebarOpen} />
        </button>
        <div className="admin-topbar-muted flex items-center gap-2 truncate text-xs">
          <span>پارس پولاد</span>
          <span>/</span>
          <span className="truncate font-semibold" style={{ color: 'var(--theme-admin-topbar-text)' }}>
            {language === 'fa' ? currentItem.label_fa : currentItem.label_en}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          to="/"
          className="admin-topbar-control rounded-lg p-2"
          title={language === 'fa' ? 'وب‌سایت' : 'Website'}
          aria-label={language === 'fa' ? 'رفتن به وب‌سایت' : 'Go to website'}
        >
          <Home className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={onToggleDock}
          className="admin-topbar-control hidden rounded-lg p-2 lg:inline-flex"
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
          className="admin-topbar-control effect-theme-toggle rounded-lg p-2"
          title={language === 'fa' ? 'تغییر تم' : 'Toggle theme'}
          aria-label={language === 'fa' ? 'تغییر تم روشن و تیره' : 'Toggle light and dark mode'}
        >
          {effectiveColorMode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
          className="admin-topbar-control inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>{language === 'fa' ? 'EN' : 'FA'}</span>
        </button>
        <Link
          to="/admin/notifications"
          className="admin-topbar-control rounded-lg p-2"
          title={language === 'fa' ? 'اعلان‌ها' : 'Notifications'}
          aria-label={language === 'fa' ? 'اعلان‌ها' : 'Notifications'}
        >
          <Bell className="h-4 w-4" />
        </Link>
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((open) => !open)}
            className="admin-topbar-control flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-start text-xs font-medium"
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
              <span className="admin-topbar-muted truncate text-[10px] font-normal">{roleLabel}</span>
            </span>
          </button>
          {userMenuOpen && (
            <div
              id="admin-user-menu"
              role="menu"
              className="theme-popover absolute inset-e-0 top-full z-50 mt-2 w-52 rounded-xl border border-(--theme-border) bg-(--theme-surface) p-1.5 text-(--theme-text) shadow-xl"
            >
              <Link
                to="/admin/profile"
                role="menuitem"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-(--theme-text) transition hover:bg-(--theme-surface-muted)"
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
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
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
