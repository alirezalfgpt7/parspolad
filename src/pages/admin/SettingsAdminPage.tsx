import React, { useEffect, useState } from 'react';
import { Database, Download, Save } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { NotificationTemplate, SiteSettings, SmsProvider } from '../../types/index.ts';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { RichTextEditor } from '../../components/ui/RichTextEditor.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';

export const SettingsAdminPage: React.FC = () => {
  const { addToast, fetchBootstrap, token } = useAppStore();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [smtpPassPlain, setSmtpPassPlain] = useState('');
  const [smsKeyPlain, setSmsKeyPlain] = useState('');
  const [tab, setTab] = useState<'company' | 'email' | 'sms' | 'map_seo' | 'backup'>('company');

  useEffect(() => {
    apiRequest<{ data: SiteSettings }>('/admin/settings').then((r) => setSettings(r.data)).catch(() => {});
    apiRequest<{ data: NotificationTemplate[] }>('/admin/notification-templates').then((r) => setTemplates(r.data)).catch(() => {});
  }, []);

  if (!settings) return <div className="py-10 text-center text-sm text-slate-500">در حال بارگذاری تنظیمات...</div>;

  const saveAll = async () => {
    await apiRequest('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({
        ...settings,
        email: { ...settings.email, smtp_password_plain: smtpPassPlain || undefined },
        sms: { ...settings.sms, api_key_plain: smsKeyPlain || undefined },
      }),
    });
    await fetchBootstrap();
    addToast('success', 'تنظیمات متمرکز سامانه ذخیره و رمزنگاری شد.');
  };

  const downloadBackup = async () => {
    const res = await fetch('/api/v1/admin/backup', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parspolad-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'فایل پشتیبان دیتابیس دانلود شد.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'company', label: 'اطلاعات شرکت و لوگو' },
            { id: 'email', label: 'تنظیمات ایمیل و قالب HTML' },
            { id: 'sms', label: 'تنظیمات پنل پیامک (SMS)' },
            { id: 'map_seo', label: 'نقشه، سئو و حالت نگهداری' },
            { id: 'backup', label: 'پشتیبان‌گیری دیتابیس' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as typeof tab)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold ${
                tab === t.id ? 'bg-[var(--theme-primary)] text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={saveAll}
          style={{ backgroundColor: 'var(--theme-primary)' }}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white"
        >
          <Save className="h-4 w-4" />
          <span>ذخیره تنظیمات</span>
        </button>
      </div>

      {tab === 'company' && (
        <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <label className="mb-1 block text-xs font-medium">نام فارسی شرکت</label>
            <input value={settings.company.name_fa} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, name_fa: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">شعار سازمانی</label>
            <input value={settings.company.slogan_fa} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, slogan_fa: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">آدرس کارخانه</label>
            <input value={settings.company.factory_address_fa} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, factory_address_fa: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">تلفن کارخانه</label>
            <input dir="ltr" value={settings.company.factory_phone} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, factory_phone: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">آدرس دفتر مرکزی</label>
            <input value={settings.company.office_address_fa} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, office_address_fa: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">متن کپی‌رایت فوتر</label>
            <input value={settings.company.footer_note_fa} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, footer_note_fa: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div className="sm:col-span-2">
            <FileUploader folder="logos" label="تغییر لوگو شرکت" onUploaded={(url) => setSettings({ ...settings, company: { ...settings.company, logo_url: url, logo_small_url: url } })} />
          </div>
        </div>
      )}

      {tab === 'email' && (
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-4 sm:grid-cols-2">
            <input dir="ltr" placeholder="SMTP Host" value={settings.email.smtp_host} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtp_host: e.target.value } })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input dir="ltr" type="number" placeholder="Port" value={settings.email.smtp_port} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtp_port: Number(e.target.value) } })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input dir="ltr" placeholder="SMTP Username" value={settings.email.smtp_user} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtp_user: e.target.value } })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input dir="ltr" type="password" placeholder="رمز عبور جدید SMTP (ذخیره رمزنگاری‌شده AES-256)" value={smtpPassPlain} onChange={(e) => setSmtpPassPlain(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          {templates[0] && (
            <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <h3 className="text-sm font-bold">ادیتور اختصاصی قالب HTML ایمیل ({templates[0].name_fa})</h3>
              <RichTextEditor
                value={templates[0].body_html}
                onChange={(html) => setTemplates((prev) => prev.map((t, i) => (i === 0 ? { ...t, body_html: html } : t)))}
              />
              <button
                type="button"
                onClick={async () => {
                  await apiRequest(`/admin/notification-templates/${templates[0].id}`, {
                    method: 'PUT',
                    body: JSON.stringify(templates[0]),
                  });
                  addToast('success', 'قالب HTML ایمیل ذخیره شد.');
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-700"
              >
                ذخیره قالب ایمیل
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'sms' && (
        <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
          <SearchableSelect
            label="انتخاب سامانه پیامکی"
            options={[
              { value: 'kavenegar', label: 'کاوه‌نگار (Kavenegar)' },
              { value: 'smsir', label: 'اس‌ام‌اس دات آی‌آر (SMS.ir)' },
              { value: 'melipayamak', label: 'ملی پیامک (Melipayamak)' },
            ]}
            value={settings.sms.provider}
            onChange={(v) => setSettings({ ...settings, sms: { ...settings.sms, provider: v as SmsProvider } })}
          />
          <div>
            <label className="mb-1 block text-xs font-medium">شماره خط ارسال‌کننده</label>
            <input dir="ltr" value={settings.sms.sender_line} onChange={(e) => setSettings({ ...settings, sms: { ...settings.sms, sender_line: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium">کلید API جدید (رمزنگاری AES-256 در دیتابیس)</label>
            <input dir="ltr" type="password" placeholder="API Key..." value={smsKeyPlain} onChange={(e) => setSmsKeyPlain(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <label className="flex items-center gap-2 text-xs font-medium">
            <input type="checkbox" checked={settings.sms.enabled} onChange={(e) => setSettings({ ...settings, sms: { ...settings.sms, enabled: e.target.checked } })} />
            <span>ارسال خودکار پیامک برای رویدادهای RFQ و ورود فعال باشد</span>
          </label>
        </div>
      )}

      {tab === 'map_seo' && (
        <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
          <input value={settings.seo.site_title} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, site_title: e.target.value } })} placeholder="عنوان سئو سایت" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <input value={settings.seo.keywords} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, keywords: e.target.value } })} placeholder="کلمات کلیدی" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <input type="number" step="0.0001" dir="ltr" value={settings.map.factory_lat} onChange={(e) => setSettings({ ...settings, map: { ...settings.map, factory_lat: Number(e.target.value) } })} placeholder="Lat" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <input type="number" step="0.0001" dir="ltr" value={settings.map.factory_lng} onChange={(e) => setSettings({ ...settings, map: { ...settings.map, factory_lng: Number(e.target.value) } })} placeholder="Lng" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <label className="flex items-center gap-2 text-xs font-semibold text-amber-700 sm:col-span-2">
            <input type="checkbox" checked={settings.site.maintenance_mode} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, maintenance_mode: e.target.checked } })} />
            <span>فعال‌سازی حالت نگهداری موقت سایت (Maintenance Mode) برای بازدیدکنندگان عمومی</span>
          </label>
        </div>
      )}

      {tab === 'backup' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-base font-bold">
            <Database className="h-5 w-5 text-[var(--theme-primary)]" />
            <span>پشتیبان‌گیری دستی از پایگاه داده</span>
          </div>
          <p className="text-xs text-slate-500">
            خروجی کامل اطلاعات سیستم (پروژه‌ها، قراردادها، تنظیمات، تم‌ها، کاربران و لاگ‌ها) را به‌صورت فایل پشتیبان دریافت کنید.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadBackup}
              style={{ backgroundColor: 'var(--theme-primary)' }}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-semibold text-white"
            >
              <Download className="h-4 w-4" />
              <span>دانلود نسخه پشتیبان کامل (JSON)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
