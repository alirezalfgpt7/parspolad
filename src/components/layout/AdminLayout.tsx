import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Files,
  FolderKanban,
  Globe,
  HelpCircle,
  HardDrive,
  Home,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Palette,
  Settings,
  Shield,
  Sliders,
  Sun,
  UserCircle,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.ts';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';
import { cn } from '../../utils/i18n.ts';

const navGroups = [
  { to: '/admin', label_fa: 'داشبورد مدیریتی', label_en: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/projects', label_fa: 'پروژه‌ها و دسته‌ها', label_en: 'Projects', icon: FolderKanban },
  { to: '/admin/contracts-licenses', label_fa: 'قراردادها و گواهینامه‌ها', label_en: 'Contracts & Licenses', icon: Award },
  { to: '/admin/slider', label_fa: 'اسلایدر صفحه اول', label_en: 'Hero Slider', icon: Sliders },
  { to: '/admin/themes', label_fa: 'مدیریت تم و رنگ‌ها', label_en: 'Theme Engine', icon: Palette },
  { to: '/admin/menus', label_fa: 'مدیریت مگا منو', label_en: 'Mega Menus', icon: Layers },
  { to: '/admin/content', label_fa: 'صفحات، خدمات و اخبار', label_en: 'CMS & Services', icon: FileText },
  { to: '/admin/content-records', label_fa: 'CRUD همه بخش‌های محتوا', label_en: 'Content CRUD', icon: Files },
  { to: '/admin/faqs', label_fa: 'سوالات متداول', label_en: 'FAQs', icon: HelpCircle },
  { to: '/admin/organization', label_fa: 'ساختار سازمانی و شرکا', label_en: 'Org & Partners', icon: Building2 },
  { to: '/admin/media', label_fa: 'کتابخانه رسانه و فایل‌ها', label_en: 'Media Library', icon: ImageIcon },
  { to: '/admin/messages', label_fa: 'پیام‌ها و RFQ', label_en: 'Messages & RFQ', icon: MessageSquare },
  { to: '/admin/comments', label_fa: 'دیدگاه‌های مقالات', label_en: 'Article Comments', icon: MessageSquare },
  { to: '/admin/users', label_fa: 'کاربران و ماتریس نقش‌ها', label_en: 'Users & RBAC', icon: Shield },
  { to: '/admin/reports', label_fa: 'گزارش اکسل و لاگ‌ها', label_en: 'Reports & Logs', icon: FileSpreadsheet },
  { to: '/admin/settings', label_fa: 'تنظیمات و پشتیبان‌گیری', label_en: 'Settings & Backup', icon: Settings },
  { to: '/admin/profile', label_fa: 'پروفایل و امنیت 2FA', label_en: 'Profile & 2FA', icon: UserCircle },
  { to: '/admin/notifications', label_fa: 'مرکز اعلان‌ها', label_en: 'Notifications', icon: Bell },
];

export const AdminLayout: React.FC = () => {
  const { user, logout, language, setLanguage, colorMode, toggleColorMode } = useAppStore();
  const [mini, setMini] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentItem = navGroups.find((g) => g.to === location.pathname) || navGroups[0];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Collapsible & Mini Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 inset-s-0 z-40 flex flex-col border-e border-slate-200 bg-white transition-all duration-200 lg:static dark:border-slate-800 dark:bg-slate-900',
          mini ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : 'max-lg:hidden'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          {!mini && (
            <Link to="/" className="flex items-center gap-2 font-extrabold text-sm truncate">
              <ZeroBrokenImage src="/storage/logos/logo-small.png" alt="PPA" className="h-7 w-7 object-contain" />
              <span className="truncate">پارس پولاد آقایی</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMini((m) => !m)}
            className="hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:inline-flex dark:hover:bg-slate-800"
            title={mini ? 'باز کردن منو' : 'حالت مینی'}
          >
            {mini ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2.5">
          {navGroups.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                title={language === 'fa' ? item.label_fa : item.label_en}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors',
                  active
                    ? 'bg-(--theme-primary) text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!mini && <span className="truncate">{language === 'fa' ? item.label_fa : item.label_en}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <Link
            to="/"
            className="mb-1.5 flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Home className="h-4 w-4 shrink-0" />
            {!mini && <span>بازگشت به وبسایت</span>}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!mini && <span>خروج از حساب</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="rounded-lg border border-slate-200 p-2 lg:hidden dark:border-slate-700"
              aria-label="منو"
            >
              <Menu className="h-4 w-4" />
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
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              title="تغییر تم"
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

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
