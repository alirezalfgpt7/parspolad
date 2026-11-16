import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Bell, FileSpreadsheet, FolderKanban, MessageSquare, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import type { ActivityLog, ContactMessage, NotificationItem } from '../../types/index.ts';
import { CategoryBarChart, YearlyTrendChart } from '../../components/charts/IndustrialCharts.tsx';
import { PersianDatePicker, gregorianToJalali, jalaliToGregorian } from '../../components/ui/PersianDatePicker.tsx';

interface AnalyticsPoint {
  date: string;
  views: number;
}

interface AnalyticsData {
  daily: AnalyticsPoint[];
  monthly: Array<{ month: string; views: number }>;
  range: {
    from: string;
    to: string;
    total: number;
    daily: AnalyticsPoint[];
  };
}

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
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  const loadAnalytics = async (from = '', to = '') => {
    setAnalyticsLoading(true);
    setAnalyticsError('');

    try {
      if (Boolean(from) !== Boolean(to)) {
        throw new Error('برای گزارش بازه‌ای، تاریخ شروع و پایان را هر دو انتخاب کنید.');
      }

      const query = from && to
        ? `?from=${encodeURIComponent(jalaliToGregorian(from))}&to=${encodeURIComponent(jalaliToGregorian(to))}`
        : '';
      const result = await apiRequest<AnalyticsData>(`/admin/analytics${query}`);
      setAnalytics(result);
      setRangeFrom(gregorianToJalali(result.range.from));
      setRangeTo(gregorianToJalali(result.range.to));
    } catch (error) {
      setAnalyticsError(error instanceof Error ? error.message : 'دریافت آمار بازدید ناموفق بود.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    apiRequest<DashboardData>('/admin/dashboard').then(setData).catch(() => {});
    loadAnalytics();
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

      <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold">آمار بازدید وب‌سایت</h2>
            <p className="mt-1 text-xs text-slate-500">آمار به‌صورت تجمیعی ثبت می‌شود و شناسه یا IP بازدیدکنندگان ذخیره نمی‌شود.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="w-40 text-xs">
              از تاریخ
              <PersianDatePicker value={rangeFrom} onChange={setRangeFrom} className="mt-1" />
            </label>
            <label className="w-40 text-xs">
              تا تاریخ
              <PersianDatePicker value={rangeTo} onChange={setRangeTo} className="mt-1" />
            </label>
            <button
              type="button"
              onClick={() => loadAnalytics(rangeFrom, rangeTo)}
              disabled={analyticsLoading}
              className="rounded-lg bg-[var(--theme-primary)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {analyticsLoading ? 'در حال دریافت...' : 'اعمال بازه'}
            </button>
          </div>
        </div>

        {analyticsError && <p role="alert" className="text-xs text-red-600">{analyticsError}</p>}

        {analytics && (
          <>
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-xs text-slate-500">بازدید در بازه انتخاب‌شده</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums">{analytics.range.total.toLocaleString('fa-IR')}</p>
              <p className="mt-1 text-[11px] text-slate-500">
                {gregorianToJalali(analytics.range.from)} تا {gregorianToJalali(analytics.range.to)}
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-xs font-semibold">بازدید روزانه · ۱۴ روز اخیر</h3>
                <AnalyticsBars
                  points={analytics.daily.slice(-14).map((point) => ({
                    label: new Date(`${point.date}T00:00:00`).toLocaleDateString('fa-IR', { day: '2-digit' }),
                    value: point.views,
                    key: point.date,
                  }))}
                />
              </div>
              <div>
                <h3 className="mb-3 text-xs font-semibold">بازدید ماهانه · ۱۲ ماه اخیر</h3>
                <AnalyticsBars
                  points={analytics.monthly.map((point) => ({
                    label: new Date(`${point.month}-01T00:00:00`).toLocaleDateString('fa-IR', { month: 'short' }),
                    value: point.views,
                    key: point.month,
                  }))}
                />
              </div>
            </div>
          </>
        )}
      </section>

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

interface AnalyticsBarPoint {
  key: string;
  label: string;
  value: number;
}

const AnalyticsBars: React.FC<{ points: AnalyticsBarPoint[] }> = ({ points }) => {
  const maxValue = Math.max(1, ...points.map((point) => point.value));

  return (
    <div className="flex h-36 items-end gap-1 border-b border-slate-200 dark:border-slate-700">
      {points.map((point) => (
        <div key={point.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[9px] tabular-nums text-slate-500">{point.value.toLocaleString('fa-IR')}</span>
          <div
            title={`${point.label}: ${point.value}`}
            className="w-full rounded-t bg-[var(--theme-primary)] opacity-80"
            style={{ height: `${point.value === 0 ? 2 : Math.max(6, (point.value / maxValue) * 100)}%` }}
          />
          <span className="text-[9px] text-slate-500">{point.label}</span>
        </div>
      ))}
    </div>
  );
};
