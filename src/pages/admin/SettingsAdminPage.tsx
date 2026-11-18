import React, { useEffect, useState } from 'react';
import { Database, Download, Save } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { NotificationTemplate, SiteSettings, SmsProvider } from '../../types/index.ts';
import { MediaUrlField } from '../../components/ui/MediaUrlField.tsx';
import { RichTextEditor } from '../../components/ui/RichTextEditor.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { PagePreloader } from '../../components/common/PagePreloader.tsx';
import { PartnerLogoManager } from '../../components/admin/PartnerLogoManager.tsx';
import { EffectAction, EffectTabButton, EffectTabPanel } from '../../components/effects/index.ts';

export const SettingsAdminPage: React.FC = () => {
  const { addToast, fetchBootstrap, token } = useAppStore();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [smtpPassPlain, setSmtpPassPlain] = useState('');
  const [emailTestAddress, setEmailTestAddress] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  const [smsKeyPlain, setSmsKeyPlain] = useState('');
  const [tab, setTab] = useState<'company' | 'social' | 'email' | 'sms' | 'map_seo' | 'backup' | 'partners'>('company');

  useEffect(() => {
    apiRequest<{ data: SiteSettings }>('/admin/settings').then((r) => setSettings(r.data)).catch(() => {});
    apiRequest<{ data: NotificationTemplate[] }>('/admin/notification-templates').then((r) => setTemplates(r.data)).catch(() => {});
  }, []);

  if (!settings) return <PagePreloader label="در حال دریافت تنظیمات..." />;

  const saveCurrentTab = async () => {
    if (tab === 'backup' || tab === 'partners') return;

    const payload = (() => {
      switch (tab) {
        case 'company':
          return { company: settings.company };
        case 'social':
          return {
            company: {
              instagram_url: settings.company.instagram_url,
              linkedin_url: settings.company.linkedin_url,
              aparat_url: settings.company.aparat_url,
              telegram_url: settings.company.telegram_url,
              whatsapp_url: settings.company.whatsapp_url,
            },
            site: {
              info_bar_enabled: settings.site.info_bar_enabled,
              info_bar_phone: settings.site.info_bar_phone,
            },
          };
        case 'email':
          return {
            email: {
              smtp_host: settings.email.smtp_host,
              smtp_port: settings.email.smtp_port,
              smtp_user: settings.email.smtp_user,
              smtp_password_plain: smtpPassPlain || undefined,
              from_address: settings.email.from_address,
              from_name: settings.email.from_name,
            },
          };
        case 'sms':
          return {
            sms: {
              provider: settings.sms.provider,
              sender_line: settings.sms.sender_line,
              enabled: settings.sms.enabled,
              api_key_plain: smsKeyPlain || undefined,
            },
          };
        case 'map_seo':
          return {
            map: settings.map,
            seo: settings.seo,
            site: {
              maintenance_mode: settings.site.maintenance_mode,
              maintenance_message_fa: settings.site.maintenance_message_fa,
              allow_registration: settings.site.allow_registration,
              header_cta_text_fa: settings.site.header_cta_text_fa,
              header_cta_text_en: settings.site.header_cta_text_en,
              header_cta_url: settings.site.header_cta_url,
            },
        };
      }
    })();

    setSaving(true);
    try {
      await apiRequest('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      await fetchBootstrap();
      addToast('success', 'تنظیمات این بخش با موفقیت ذخیره شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره تنظیمات ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const testEmail = async () => {
    setTestingEmail(true);
    try {
      await apiRequest('/admin/settings/email/test', {
        method: 'POST',
        body: JSON.stringify({ to: emailTestAddress }),
      });
      addToast('success', 'ایمیل آزمایشی ارسال شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ارسال ایمیل آزمایشی ناموفق بود.');
    } finally {
      setTestingEmail(false);
    }
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
            { id: 'social', label: 'نوار تماس و شبکه‌های اجتماعی' },
            { id: 'email', label: 'تنظیمات ایمیل و قالب HTML' },
            { id: 'sms', label: 'تنظیمات پنل پیامک (SMS)' },
            { id: 'map_seo', label: 'نقشه، سئو و حالت نگهداری' },
            { id: 'backup', label: 'پشتیبان‌گیری دیتابیس' },
            { id: 'partners', label: 'لوگوهای اسلایدر صفحه اصلی' },
          ].map((t) => (
            <EffectTabButton
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as typeof tab)}
              selected={tab === t.id}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold ${
                tab === t.id ? 'bg-(--theme-primary) text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.label}
            </EffectTabButton>
          ))}
        </div>
        {tab !== 'backup' && tab !== 'partners' && (
          <EffectAction
            type="button"
            onClick={saveCurrentTab}
            disabled={saving}
            style={{ backgroundColor: 'var(--theme-primary)' }}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات همین تب'}</span>
          </EffectAction>
        )}
      </div>

      {tab === 'company' && (
        <EffectTabPanel className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <label className="mb-1 block text-xs font-medium">نام فارسی شرکت</label>
            <input value={settings.company.name_fa} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, name_fa: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">نام انگلیسی شرکت</label>
            <input dir="ltr" value={settings.company.name_en || ''} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, name_en: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">شعار سازمانی</label>
            <input value={settings.company.slogan_fa} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, slogan_fa: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">شعار سازمانی (انگلیسی)</label>
            <input dir="ltr" value={settings.company.slogan_en || ''} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, slogan_en: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
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
            <label className="mb-1 block text-xs font-medium">تلفن دفتر مرکزی</label>
            <input dir="ltr" value={settings.company.office_phone || ''} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, office_phone: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">شماره امور بازرگانی</label>
            <input dir="ltr" value={settings.company.commercial_phone || ''} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, commercial_phone: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">متن کپی‌رایت فوتر</label>
            <input value={settings.company.footer_note_fa} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, footer_note_fa: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">آخرین به‌روزرسانی کاتالوگ (فارسی)</label>
            <input value={settings.company.last_updated_fa || ''} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, last_updated_fa: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">آخرین به‌روزرسانی کاتالوگ (انگلیسی)</label>
            <input dir="ltr" value={settings.company.last_updated_en || ''} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, last_updated_en: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">استانداردهای قابل نمایش در فوتر (فارسی)</label>
            <input value={settings.company.standards_fa || ''} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, standards_fa: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">استانداردهای قابل نمایش در فوتر (انگلیسی)</label>
            <input dir="ltr" value={settings.company.standards_en || ''} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, standards_en: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div className="sm:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <MediaUrlField
                label="لوگوی اصلی سایت (تصویر یا فایل متحرک)"
                value={settings.company.logo_url || ''}
                onChange={(url) => setSettings({ ...settings, company: { ...settings.company, logo_url: url } })}
                folder="logos"
                showAnimatedPresets
              />
              <MediaUrlField
                label="نشان کوچک و لوگوی سربرگ / سایدبار"
                value={settings.company.logo_small_url || ''}
                onChange={(url) => setSettings({ ...settings, company: { ...settings.company, logo_small_url: url } })}
                folder="logos"
                placeholder="/storage/logos/logo-small.png"
                showAnimatedPresets
              />
            </div>
          </div>
        </EffectTabPanel>
      )}

      {tab === 'social' && (
        <EffectTabPanel className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
          <label className="flex items-center gap-2 text-xs font-semibold sm:col-span-2">
            <input
              type="checkbox"
              checked={settings.site.info_bar_enabled ?? true}
              onChange={(e) => setSettings({ ...settings, site: { ...settings.site, info_bar_enabled: e.target.checked } })}
            />
            <span>نمایش نوار باریک تماس و شبکه‌های اجتماعی در صفحه اصلی</span>
          </label>
          <div>
            <label className="mb-1 block text-xs font-medium">شماره تماس نوار بالای صفحه</label>
            <input
              dir="ltr"
              value={settings.site.info_bar_phone || settings.company.commercial_phone || ''}
              onChange={(e) => setSettings({ ...settings, site: { ...settings.site, info_bar_phone: e.target.value } })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <p className="self-end text-xs leading-6 text-slate-500">
            لینک‌هایی که خالی بمانند در نوار سایت نمایش داده نمی‌شوند.
          </p>
          {([
            ['instagram_url', 'Instagram'],
            ['linkedin_url', 'LinkedIn'],
            ['aparat_url', 'Aparat'],
            ['telegram_url', 'Telegram'],
            ['whatsapp_url', 'WhatsApp'],
          ] as const).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium">پیوند {label}</label>
              <input
                dir="ltr"
                type="url"
                value={settings.company[key] || ''}
                onChange={(e) => setSettings({ ...settings, company: { ...settings.company, [key]: e.target.value } })}
                placeholder={`https://${label.toLowerCase()}.com/...`}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          ))}
        </EffectTabPanel>
      )}

      {tab === 'partners' && <EffectTabPanel><PartnerLogoManager /></EffectTabPanel>}

      {tab === 'email' && (
        <EffectTabPanel className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-4 sm:grid-cols-2">
            <input dir="ltr" placeholder="SMTP Host" value={settings.email.smtp_host} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtp_host: e.target.value } })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input dir="ltr" type="number" placeholder="Port" value={settings.email.smtp_port} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtp_port: Number(e.target.value) } })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input dir="ltr" placeholder="SMTP Username" value={settings.email.smtp_user} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtp_user: e.target.value } })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input dir="ltr" type="password" placeholder="رمز عبور جدید SMTP (ذخیره رمزنگاری‌شده AES-256)" value={smtpPassPlain} onChange={(e) => setSmtpPassPlain(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input dir="ltr" type="email" placeholder="آدرس فرستنده" value={settings.email.from_address} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, from_address: e.target.value } })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input placeholder="نام فرستنده" value={settings.email.from_name} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, from_name: e.target.value } })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <input dir="ltr" type="email" placeholder="آدرس دریافت‌کننده برای آزمون" value={emailTestAddress} onChange={(e) => setEmailTestAddress(e.target.value)} className="min-w-64 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <button type="button" onClick={testEmail} disabled={testingEmail || !emailTestAddress} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold disabled:opacity-50 dark:border-slate-700">
              {testingEmail ? 'در حال ارسال...' : 'ارسال ایمیل آزمایشی'}
            </button>
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
        </EffectTabPanel>
      )}

      {tab === 'sms' && (
        <EffectTabPanel className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
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
        </EffectTabPanel>
      )}

      {tab === 'map_seo' && (
        <EffectTabPanel className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
          <input value={settings.site.header_cta_text_fa || ''} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, header_cta_text_fa: e.target.value } })} placeholder="متن دکمه اصلی هدر (فارسی)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <input dir="ltr" value={settings.site.header_cta_text_en || ''} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, header_cta_text_en: e.target.value } })} placeholder="Header CTA text (English)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <input dir="ltr" value={settings.site.header_cta_url || ''} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, header_cta_url: e.target.value } })} placeholder="Header CTA URL" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <input value={settings.seo.site_title} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, site_title: e.target.value } })} placeholder="عنوان سئو سایت (فارسی)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <input dir="ltr" value={settings.seo.site_title_en || ''} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, site_title_en: e.target.value } })} placeholder="SEO site title (English)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <textarea value={settings.seo.meta_description || ''} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, meta_description: e.target.value } })} placeholder="توضیحات متای سایت (فارسی)" rows={3} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <textarea dir="ltr" value={settings.seo.meta_description_en || ''} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, meta_description_en: e.target.value } })} placeholder="Meta description (English)" rows={3} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <input value={settings.seo.keywords || ''} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, keywords: e.target.value } })} placeholder="کلمات کلیدی (فارسی)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <input dir="ltr" value={settings.seo.keywords_en || ''} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, keywords_en: e.target.value } })} placeholder="SEO keywords (English)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <label className="flex flex-col gap-1 text-xs font-medium">
            <span>سیاست نمایه‌سازی موتورهای جستجو</span>
            <select
              value={settings.seo.robots || 'index,follow'}
              onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, robots: e.target.value as SiteSettings['seo']['robots'] } })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="index,follow">نمایه‌سازی و دنبال‌کردن پیوندها</option>
              <option value="noindex,follow">عدم نمایه‌سازی، دنبال‌کردن پیوندها</option>
              <option value="noindex,nofollow">عدم نمایه‌سازی و دنبال‌کردن پیوندها</option>
            </select>
          </label>
          <div className="sm:col-span-2">
            <MediaUrlField
              label="تصویر پیش‌نمایش اشتراک‌گذاری و شبکه‌های اجتماعی (OG Image)"
              value={settings.seo.meta_image || ''}
              onChange={(url) => setSettings({ ...settings, seo: { ...settings.seo, meta_image: url } })}
              folder="seo"
              accept=".jpg,.jpeg,.png,.webp"
              placeholder="/storage/logos/logo-main.png"
            />
          </div>
          <input type="number" step="0.0001" dir="ltr" value={settings.map.factory_lat} onChange={(e) => setSettings({ ...settings, map: { ...settings.map, factory_lat: Number(e.target.value) } })} placeholder="Lat" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <input type="number" step="0.0001" dir="ltr" value={settings.map.factory_lng} onChange={(e) => setSettings({ ...settings, map: { ...settings.map, factory_lng: Number(e.target.value) } })} placeholder="Lng" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <label className="flex items-center gap-2 text-xs font-semibold text-amber-700 sm:col-span-2">
            <input type="checkbox" checked={settings.site.maintenance_mode} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, maintenance_mode: e.target.checked } })} />
            <span>فعال‌سازی حالت نگهداری موقت سایت (Maintenance Mode) برای بازدیدکنندگان عمومی</span>
          </label>
          <input value={settings.site.maintenance_message_fa || ''} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, maintenance_message_fa: e.target.value } })} placeholder="پیام حالت نگهداری" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <label className="flex items-center gap-2 text-xs font-medium">
            <input type="checkbox" checked={settings.site.allow_registration} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, allow_registration: e.target.checked } })} />
            <span>اجازهٔ ثبت‌نام کاربران جدید</span>
          </label>
        </EffectTabPanel>
      )}

      {tab === 'backup' && (
        <EffectTabPanel className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-base font-bold">
            <Database className="h-5 w-5 text-(--theme-primary)" />
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
        </EffectTabPanel>
      )}
    </div>
  );
};
