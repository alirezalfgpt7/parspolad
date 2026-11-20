import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Award,
  Bell,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Files,
  FolderKanban,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  MessageSquare,
  MessagesSquare,
  Palette,
  Search,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  UserCircle,
  type LucideIcon,
} from 'lucide-react';
import type { Language, User } from '../../types/index.ts';
import { cn } from '../../utils/i18n.ts';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';
import { useAppStore } from '../../store/useAppStore.ts';
import '../effects/ProResponsiveSidebar.css';

export interface AdminNavItem {
  to: string;
  label_fa: string;
  label_en: string;
  icon: LucideIcon;
}

interface AdminNavGroup {
  id: string;
  label_fa: string;
  label_en: string;
  icon: LucideIcon;
  items: AdminNavItem[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    id: 'overview',
    label_fa: 'نمای کلی',
    label_en: 'Overview',
    icon: LayoutDashboard,
    items: [
      { to: '/admin', label_fa: 'داشبورد مدیریتی', label_en: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    id: 'content',
    label_fa: 'محتوا و دارایی‌های سازمان',
    label_en: 'Content & corporate assets',
    icon: Layers,
    items: [
      { to: '/admin/projects', label_fa: 'پروژه‌ها و دسته‌ها', label_en: 'Projects', icon: FolderKanban },
      { to: '/admin/contracts-licenses', label_fa: 'قراردادها و گواهینامه‌ها', label_en: 'Contracts & Licenses', icon: Award },
      { to: '/admin/content', label_fa: 'صفحات و مدیریت محتوای سایت', label_en: 'Pages & Site Content', icon: FileText },
      { to: '/admin/content-records', label_fa: 'CRUD کامل داده‌های محتوا', label_en: 'Content Data CRUD', icon: Files },
      { to: '/admin/faqs', label_fa: 'سوالات متداول', label_en: 'FAQs', icon: HelpCircle },
      { to: '/admin/media', label_fa: 'کتابخانه رسانه و فایل‌ها', label_en: 'Media Library', icon: ImageIcon },
    ],
  },
  {
    id: 'website',
    label_fa: 'تنظیمات وب‌سایت',
    label_en: 'Website configuration',
    icon: Palette,
    items: [
      { to: '/admin/slider', label_fa: 'اسلایدر صفحه اول', label_en: 'Hero Slider', icon: Sliders },
      { to: '/admin/menus', label_fa: 'منو و مگامنو', label_en: 'Menus & Mega Menu', icon: Layers },
      { to: '/admin/themes', label_fa: 'تم و رنگ‌بندی صفحات', label_en: 'Themes & Colors', icon: Palette },
      { to: '/admin/login-appearance', label_fa: 'ظاهر، لوگو و صفحات ورود', label_en: 'Appearance & Login', icon: Sparkles },
    ],
  },
  {
    id: 'operations',
    label_fa: 'سازمان و ارتباطات',
    label_en: 'Organization & communication',
    icon: Building2,
    items: [
      { to: '/admin/organization', label_fa: 'ساختار سازمانی و شرکا', label_en: 'Org & Partners', icon: Building2 },
      { to: '/admin/messages', label_fa: 'پیام‌ها و RFQ', label_en: 'Messages & RFQ', icon: MessageSquare },
      { to: '/admin/live-chat', label_fa: 'گفتگوی آنلاین', label_en: 'Live Chat', icon: MessagesSquare },
      { to: '/admin/comments', label_fa: 'دیدگاه‌های مقالات', label_en: 'Article Comments', icon: MessageSquare },
    ],
  },
  {
    id: 'system',
    label_fa: 'سیستم و دسترسی',
    label_en: 'System & access',
    icon: Settings,
    items: [
      { to: '/admin/users', label_fa: 'کاربران و ماتریس نقش‌ها', label_en: 'Users & RBAC', icon: Shield },
      { to: '/admin/reports', label_fa: 'گزارش اکسل و لاگ‌ها', label_en: 'Reports & Logs', icon: FileSpreadsheet },
      { to: '/admin/settings', label_fa: 'تنظیمات و پشتیبان‌گیری', label_en: 'Settings & Backup', icon: Settings },
      { to: '/admin/profile', label_fa: 'پروفایل و امنیت 2FA', label_en: 'Profile & 2FA', icon: UserCircle },
      { to: '/admin/notifications', label_fa: 'مرکز اعلان‌ها', label_en: 'Notifications', icon: Bell },
    ],
  },
];

export const adminNavItems = adminNavGroups.flatMap((group) => group.items);

interface AdminSidebarProps {
  user: User | null;
  language: Language;
  mini: boolean;
  mobileOpen: boolean;
  onToggleMini: () => void;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  user,
  language,
  mini,
  mobileOpen,
  onToggleMini,
  onCloseMobile,
}) => {
  const location = useLocation();
  const company = useAppStore((state) => state.bootstrap?.company);
  const companyName = language === 'fa'
    ? company?.name_fa || 'پارس پولاد آقایی'
    : company?.name_en || 'Pars Poolad Aghaee';
  const activeGroup = adminNavGroups.find((group) =>
    group.items.some((item) => item.to === location.pathname)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(adminNavGroups.map((group) => [group.id, true]))
  );

  useEffect(() => {
    if (activeGroup) {
      setOpenGroups((groups) => ({ ...groups, [activeGroup.id]: true }));
    }
  }, [activeGroup]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((groups) => ({ ...groups, [groupId]: !groups[groupId] }));
  };

  const handleMiniSearchExpand = () => {
    onToggleMini();
    window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 80);
  };

  const query = searchQuery.trim().toLocaleLowerCase();
  const visibleGroups = adminNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const label = language === 'fa' ? item.label_fa : item.label_en;
        return !query || label.toLocaleLowerCase().includes(query);
      }),
    }))
    .filter((group) => group.items.length > 0);

  const renderNavItem = (item: AdminNavItem, index: number) => {
    const Icon = item.icon;
    const active = location.pathname === item.to;
    const label = language === 'fa' ? item.label_fa : item.label_en;

    return (
      <li
        key={item.to}
        style={{ animationDelay: `${index * 35}ms` }}
        className="effect-sidebar-item"
      >
        <Link
          to={item.to}
          onClick={onCloseMobile}
          title={mini ? label : undefined}
          aria-label={mini ? label : undefined}
          aria-current={active ? 'page' : undefined}
          className={cn('admin-sidebar-link admin-sidebar-dot-link', active && 'is-active')}
        >
          {!mini && <span className="admin-sidebar-dot" aria-hidden="true" />}
          <span className="admin-sidebar-icon">
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </span>
          {!mini && <span className="admin-sidebar-copy">{label}</span>}
        </Link>
      </li>
    );
  };

  return (
    <aside
      id="admin-sidebar"
      data-mobile-open={mobileOpen}
      className={cn('admin-sidebar', mini ? 'admin-sidebar--mini' : 'admin-sidebar--wide')}
      style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
    >
      <button
        type="button"
        onClick={onToggleMini}
        className="admin-sidebar-collapse-straddle hidden lg:inline-grid"
        title={mini ? (language === 'fa' ? 'باز کردن منو' : 'Expand') : (language === 'fa' ? 'حالت مینی' : 'Collapse')}
        aria-label={mini ? (language === 'fa' ? 'باز کردن منو' : 'Expand sidebar') : (language === 'fa' ? 'حالت مینی' : 'Collapse sidebar')}
      >
        {mini ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>

      <div className="admin-sidebar-header">
        <div className="admin-sidebar-brand">
          <Link to="/" className="admin-sidebar-brand-link" aria-label={companyName}>
            <span className="admin-sidebar-logo">
              <BrandLogo placement="admin_sidebar" alt="" className="h-full w-full" />
            </span>
            {!mini && (
              <span className="admin-sidebar-brand-copy">
                <span className="admin-sidebar-brand-name">{companyName}</span>
                <span className="admin-sidebar-brand-caption">
                  {language === 'fa' ? 'پنل مدیریت' : 'Admin Panel'}
                </span>
              </span>
            )}
          </Link>
        </div>

        <div className="admin-sidebar-profile">
          <ZeroBrokenImage
            src={user?.avatar || '/storage/logos/logo-small.png'}
            alt=""
            className="admin-sidebar-avatar"
          />
          {!mini && (
            <span className="admin-sidebar-profile-copy">
              <span className="admin-sidebar-profile-name">{user?.name || 'مدیر پرتال'}</span>
              <span className="admin-sidebar-profile-role">{user?.email || 'مدیریت سامانه'}</span>
            </span>
          )}
        </div>
      </div>

      <div className={cn('admin-sidebar-search', mini && 'admin-sidebar-search--mini')}>
        {mini ? (
          <button
            type="button"
            onClick={handleMiniSearchExpand}
            className="admin-sidebar-search-button"
            title={language === 'fa' ? 'جستجوی منو' : 'Search menu'}
            aria-label={language === 'fa' ? 'جستجوی منو' : 'Search menu'}
          >
            <Search className="h-4 w-4" />
          </button>
        ) : (
          <>
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={language === 'fa' ? 'جستجو در منو...' : 'Search menu...'}
              aria-label={language === 'fa' ? 'جستجو در منوی مدیریت' : 'Search admin menu'}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="admin-sidebar-search-clear"
                aria-label={language === 'fa' ? 'پاک کردن جستجو' : 'Clear search'}
              >
                ×
              </button>
            )}
          </>
        )}
      </div>

      <nav
        className="admin-sidebar-scroll admin-sidebar-nav"
        aria-label={language === 'fa' ? 'منوی مدیریت' : 'Admin navigation'}
      >
        {visibleGroups.length > 0 ? visibleGroups.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = mini || Boolean(query) || Boolean(openGroups[group.id]);
          const groupLabel = language === 'fa' ? group.label_fa : group.label_en;

          return (
            <section key={group.id} aria-label={groupLabel} className="admin-sidebar-section">
              {!mini && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isOpen}
                  className="admin-sidebar-group-toggle"
                >
                  <GroupIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                  <span className="min-w-0 flex-1 truncate">{groupLabel}</span>
                  <ChevronDown
                    className={cn('h-3.5 w-3.5 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
                  />
                </button>
              )}
              <div className="effect-sidebar-items" data-open={isOpen}>
                <ul className={cn('admin-sidebar-list', !mini && 'admin-sidebar-sublist')}>
                  {group.items.map(renderNavItem)}
                </ul>
              </div>
            </section>
          );
        }) : (
          <p className="admin-sidebar-empty">
            {language === 'fa' ? 'موردی پیدا نشد.' : 'No items found.'}
          </p>
        )}
      </nav>

    </aside>
  );
};
