import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Bell, FileSpreadsheet, FolderKanban, MessageSquare, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import type { ActivityLog, ContactMessage, NotificationItem } from '../../types/index.ts';
import { CategoryBarChart, YearlyTrendChart } from '../../components/charts/IndustrialCharts.tsx';

interface DashboardData {
  stats: {
    projects_count: number;
    contracts_count: number;
    contracts_total_billion_irr: number;
    licenses_count: number;
    new_messages_count: number;
    users_count: number;
  };
  charts: {
    byCategory: Array<{ name: string; color: string; count: number }>;
    byYear: Array<{ year: string; count: number }>;
  };
  recent_messages: ContactMessage[];
  recent_logs: ActivityLog[];
  notifications: NotificationItem[];
}

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    apiRequest<DashboardData>('/admin/dashboard').then(setData).catch(() => {});
  }, []);

  if (!data) {
    return <div className="py-12 text-center text-sm text-slate-500">در حال بارگذاری داشبورد...</div>;
  }

  const cards = [
    { label: 'پروژه‌های ثبت‌شده', val: data.stats.projects_count, icon: FolderKanban, to: '/admin/projects' },
    { label: 'قراردادهای فعال و تکمیلی', val: `${data.stats.contracts_count} (${data.stats.contracts_total_billion_irr} میلیارد ریال)`, icon: FileSpreadsheet, to: '/admin/contracts-licenses' },
    { label: 'گواهینامه‌ها و استانداردها', val: data.stats.licenses_count, icon: Award, to: '/admin/contracts-licenses' },
    { label: 'پیام‌ها و RFQ جدید', val: data.stats.new_messages_count, icon: MessageSquare, to: '/admin/messages' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 tabular-nums">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.to}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-[var(--theme-primary)] dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className="mt-1.5 text-xl font-extrabold text-slate-900 dark:text-white">{c.val}</p>
              </div>
              <div className="rounded-lg bg-red-50 p-2.5 text-[var(--theme-primary)] dark:bg-red-950/40">
                <Icon className="h-5 w-5" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-bold">تعداد پروژه‌ها به تفکیک دسته فنی</h2>
          <CategoryBarChart data={data.charts.byCategory} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-bold">نمودار روند اجرای پروژه‌ها در سال‌ها</h2>
          <YearlyTrendChart data={data.charts.byYear} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">پیام‌ها و RFQهای اخیر</h2>
            <Link to="/admin/messages" className="text-xs text-[var(--theme-primary)] hover:underline">همه</Link>
          </div>
          <div className="space-y-3">
            {data.recent_messages.map((m) => (
              <div key={m.id} className="border-b border-slate-100 pb-2.5 text-xs last:border-0 dark:border-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white">{m.subject}</div>
                <div className="mt-0.5 text-slate-500">{m.name} · {m.type.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-bold">
              <ShieldCheck className="h-4 w-4 text-[var(--theme-primary)]" />
              <span>لاگ‌های اخیر سیستم</span>
            </h2>
            <Link to="/admin/reports" className="text-xs text-[var(--theme-primary)] hover:underline">مشاهده</Link>
          </div>
          <div className="space-y-2.5">
            {data.recent_logs.map((l) => (
              <div key={l.id} className="border-b border-slate-100 pb-2 text-xs last:border-0 dark:border-slate-800">
                <div className="font-medium text-slate-800 dark:text-slate-200">{l.subject_label}</div>
                <div className="mt-0.5 flex justify-between text-[11px] text-slate-400">
                  <span>{l.user_name}</span>
                  <span className="font-mono">{l.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-bold">
              <Bell className="h-4 w-4 text-amber-500" />
              <span>اعلان‌های اخیر</span>
            </h2>
            <Link to="/admin/notifications" className="text-xs text-[var(--theme-primary)] hover:underline">مرکز اعلان‌ها</Link>
          </div>
          <div className="space-y-3">
            {data.notifications.map((n) => (
              <div key={n.id} className="border-b border-slate-100 pb-2.5 text-xs last:border-0 dark:border-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white">{n.title_fa}</div>
                <p className="mt-0.5 text-slate-500">{n.body_fa}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
