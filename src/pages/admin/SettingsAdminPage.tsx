import React, { useEffect, useId, useState } from 'react';
import {
  Building2,
  ChevronDown,
  Database,
  Download,
  FileUp,
  Handshake,
  Mail,
  MapPinned,
  MessageSquareText,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Share2,
  ShieldAlert,
  ScrollText,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { NotificationTemplate, SiteSettings, SocialLinkSetting, SmsProvider } from '../../types/index.ts';
import { MediaUrlField } from '../../components/ui/MediaUrlField.tsx';
import { RichTextEditor } from '../../components/ui/RichTextEditor.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { PagePreloader } from '../../components/common/PagePreloader.tsx';
import { PartnerLogoManager } from '../../components/admin/PartnerLogoManager.tsx';
import { EffectAction, EffectTabButton, EffectTabPanel } from '../../components/effects/index.ts';
import { DynamicLucideIcon, LUCIDE_ICON_REGISTRY } from '../../components/ui/LucideIconMap.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';

type SettingsTabId = 'company' | 'social' | 'email' | 'sms' | 'map_seo' | 'backup' | 'partners' | 'logs';

const settingsTabs: Array<{
  id: SettingsTabId;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  { id: 'company', label: 'اطلاعات شرکت و لوگو', description: 'هویت و اطلاعات سازمانی', icon: Building2 },
  { id: 'social', label: 'نوار تماس و شبکه‌های اجتماعی', description: 'راه‌های ارتباطی سایت', icon: Share2 },
  { id: 'email', label: 'تنظیمات ایمیل و قالب HTML', description: 'ارسال ایمیل و قالب‌ها', icon: Mail },
  { id: 'sms', label: 'تنظیمات پنل پیامک (SMS)', description: 'سرویس و ارسال پیامک', icon: MessageSquareText },
  { id: 'map_seo', label: 'نقشه، سئو و حالت نگهداری', description: 'نمایش و تنظیمات سایت', icon: MapPinned },
  { id: 'backup', label: 'پشتیبان‌گیری دیتابیس', description: 'نسخه‌برداری و بازیابی', icon: Database },
  { id: 'partners', label: 'لوگوهای اسلایدر صفحه اصلی', description: 'مدیریت شرکا و برندها', icon: Handshake },
  { id: 'logs', label: 'نگهداری لاگ‌ها', description: 'سیاست نگهداری گزارش‌ها', icon: ScrollText },
];

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
  nested?: boolean;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  icon: Icon,
  children,
  nested = false,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const contentId = useId();

  return (
    <section className={`overflow-hidden rounded-2xl border bg-(--theme-card-surface) shadow-(--theme-card-shadow) ${
      nested
        ? 'border-(--theme-border)'
        : 'border-(--theme-card-border)'
    }`}>
      <button
        type="button"
        aria-expanded={!collapsed}
        aria-controls={contentId}
        onClick={() => setCollapsed((value) => !value)}
        className="group flex w-full items-center gap-3 px-4 py-4 text-start transition-colors hover:bg-(--theme-surface-muted) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--theme-primary) sm:px-5"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-(--theme-primary)/12 text-(--theme-primary-ink)">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-(--theme-text)">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-(--theme-text-muted)">{description}</span>
        </span>
        <span className="hidden shrink-0 text-[10px] font-semibold text-(--theme-text-muted) sm:inline">
          {collapsed ? 'بازکردن بخش' : 'بستن بخش'}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-(--theme-text-muted) transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
          aria-hidden="true"
        />
      </button>
      <div
        id={contentId}
        hidden={collapsed}
        className="border-t border-(--theme-border)"
      >
        {children}
      </div>
    </section>
  );
};

interface BackupTableInfo {
  name: string;
  label_fa: string;
  label_en: string;
  count: number;
  sensitive: boolean;
}

interface BackupFileTable {
  name: string;
  label_fa: string;
  label_en: string;
  row_count: number;
  supported: boolean;
  restorable: boolean;
  error: string | null;
}

interface BackupInspection {
  format: string;
  version: number;
  created_at: string | null;
  legacy: boolean;
  complete: boolean;
  table_count: number;
  current_table_count: number;
  missing_tables: string[];
  unsupported_tables: string[];
  tables: BackupFileTable[];
}

async function readAdminApiResponse<T>(response: Response): Promise<T> {
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const payload = body && typeof body === 'object'
      ? body as { message?: unknown; errors?: Record<string, string[]> }
      : {};
    const validationMessage = Object.values(payload.errors ?? {}).flat()[0];
    throw new Error(
      typeof payload.message === 'string'
        ? payload.message
        : validationMessage ?? `درخواست با خطای HTTP ${response.status} روبه‌رو شد.`,
    );
  }
  return body as T;
}

const legacySocialNetworks: Array<{
  key: 'instagram_url' | 'linkedin_url' | 'aparat_url' | 'telegram_url' | 'whatsapp_url';
  name: string;
  icon: string;
}> = [
  { key: 'instagram_url', name: 'Instagram', icon: 'Instagram' },
  { key: 'linkedin_url', name: 'LinkedIn', icon: 'Linkedin' },
  { key: 'aparat_url', name: 'Aparat', icon: 'Clapperboard' },
  { key: 'telegram_url', name: 'Telegram', icon: 'Send' },
  { key: 'whatsapp_url', name: 'WhatsApp', icon: 'WhatsApp' },
];

function getLegacySocialLinks(settings: SiteSettings): SocialLinkSetting[] {
  return legacySocialNetworks.flatMap((network, index) => {
    const url = settings.company[network.key];
    return url ? [{ id: index + 1, name: network.name, url, icon: network.icon, is_active: true }] : [];
  });
}

export const SettingsAdminPage: React.FC = () => {
  const { addToast, fetchBootstrap, token, user, logout } = useAppStore();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [smtpPassPlain, setSmtpPassPlain] = useState('');
  const [emailTestAddress, setEmailTestAddress] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  const [smsKeyPlain, setSmsKeyPlain] = useState('');
  const [tab, setTab] = useState<SettingsTabId>('company');
  const [backupTables, setBackupTables] = useState<BackupTableInfo[]>([]);
  const [selectedBackupTables, setSelectedBackupTables] = useState<string[]>([]);
  const [loadingBackupTables, setLoadingBackupTables] = useState(false);
  const [downloadingBackup, setDownloadingBackup] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [backupInspection, setBackupInspection] = useState<BackupInspection | null>(null);
  const [selectedRestoreTables, setSelectedRestoreTables] = useState<string[]>([]);
  const [inspectingBackup, setInspectingBackup] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState(false);
  const isSuperAdmin = ['super-admin', 'super_admin'].includes(user?.role ?? '');

  useEffect(() => {
    apiRequest<{ data: SiteSettings }>('/admin/settings').then((r) => setSettings({
      ...r.data,
      logs: {
        activity_logs_retention_months: r.data.logs?.activity_logs_retention_months ?? 12,
      },
      site: {
        ...r.data.site,
        social_links: r.data.site.social_links ?? getLegacySocialLinks(r.data),
      },
    })).catch((error: unknown) => {
      addToast('error', error instanceof Error ? error.message : 'دریافت تنظیمات ناموفق بود.');
    });
    apiRequest<{ data: NotificationTemplate[] }>('/admin/notification-templates').then((r) => setTemplates(r.data)).catch(() => {});
  }, [addToast]);

  useEffect(() => {
    if (tab !== 'backup' || !isSuperAdmin) return;
    let active = true;
    setLoadingBackupTables(true);
    apiRequest<{ data: BackupTableInfo[] }>('/admin/backup/tables')
      .then(({ data }) => {
        if (!active) return;
        setBackupTables(data);
        setSelectedBackupTables(data.map((table) => table.name));
      })
      .catch((error: unknown) => {
        if (active) addToast('error', error instanceof Error ? error.message : 'دریافت فهرست جدول‌های پشتیبان ناموفق بود.');
      })
      .finally(() => {
        if (active) setLoadingBackupTables(false);
      });

    return () => {
      active = false;
    };
  }, [tab, isSuperAdmin, addToast]);

  if (!settings) return <PagePreloader label="در حال دریافت تنظیمات..." />;

  const saveCurrentTab = async () => {
    if (tab === 'backup' || tab === 'partners') return;

    const payload = (() => {
      switch (tab) {
        case 'company':
          return {
            company: settings.company,
            ...(settings.logos ? { logos: settings.logos } : {}),
          };
        case 'social':
          return {
            site: {
              info_bar_enabled: settings.site.info_bar_enabled,
              info_bar_phone: settings.site.info_bar_phone,
              info_bar_phone_enabled: settings.site.info_bar_phone_enabled,
              info_bar_phone_icon: settings.site.info_bar_phone_icon || 'Phone',
              social_links: settings.site.social_links ?? [],
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
        case 'logs':
          return {
            logs: {
              activity_logs_retention_months: settings.logs?.activity_logs_retention_months ?? 12,
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
    if (selectedBackupTables.length === 0) {
      addToast('error', 'برای پشتیبان‌گیری حداقل یک جدول انتخاب کنید.');
      return;
    }

    setDownloadingBackup(true);
    try {
      const params = new URLSearchParams();
      if (selectedBackupTables.length !== backupTables.length) {
        selectedBackupTables.forEach((table) => params.append('tables[]', table));
      }
      const query = params.toString();
      const response = await fetch(`/api/v1/admin/backup${query ? `?${query}` : ''}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) await readAdminApiResponse(response);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `parspolad-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      addToast('success', selectedBackupTables.length === backupTables.length
        ? 'نسخهٔ پشتیبان کامل پایگاه‌داده دانلود شد.'
        : `نسخهٔ پشتیبان ${selectedBackupTables.length} جدول دانلود شد.`);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'دریافت فایل پشتیبان ناموفق بود.');
    } finally {
      setDownloadingBackup(false);
    }
  };

  const inspectBackupFile = async (file?: File) => {
    if (!file) return;
    setRestoreFile(null);
    setBackupInspection(null);
    setSelectedRestoreTables([]);
    setInspectingBackup(true);

    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/v1/admin/backup/inspect', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });
      const result = await readAdminApiResponse<{ data: BackupInspection }>(response);
      setRestoreFile(file);
      setBackupInspection(result.data);
      setSelectedRestoreTables(result.data.tables.filter((table) => table.restorable).map((table) => table.name));
      addToast('success', `فایل بررسی شد؛ ${result.data.tables.length} جدول در آن شناسایی شد.`);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'بررسی فایل پشتیبان ناموفق بود.');
    } finally {
      setInspectingBackup(false);
    }
  };

  const restoreBackup = async () => {
    if (!restoreFile || selectedRestoreTables.length === 0) return;
    setRestoringBackup(true);
    try {
      const form = new FormData();
      form.append('file', restoreFile);
      selectedRestoreTables.forEach((table) => form.append('tables[]', table));
      const response = await fetch('/api/v1/admin/restore', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });
      const result = await readAdminApiResponse<{ restored_tables: Array<{ name: string; row_count: number }> }>(response);
      setRestoreDialogOpen(false);
      addToast('success', `بازیابی ${result.restored_tables.length} جدول انجام شد. برای ورود امن، دوباره وارد سامانه شوید.`);
      await logout();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'بازیابی پایگاه‌داده ناموفق بود.');
    } finally {
      setRestoringBackup(false);
    }
  };

  const allBackupTablesSelected = backupTables.length > 0 && selectedBackupTables.length === backupTables.length;
  const restorableBackupTables = backupInspection?.tables.filter((table) => table.restorable) ?? [];
  const allRestoreTablesSelected = restorableBackupTables.length > 0
    && selectedRestoreTables.length === restorableBackupTables.length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-4 shadow-(--theme-card-shadow) sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-(--theme-primary)/12 text-(--theme-primary-ink)">
            <Settings2 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-base font-extrabold text-(--theme-text)">مرکز تنظیمات</h1>
            <p className="mt-1 text-xs text-(--theme-text-muted)">مدیریت یکپارچهٔ پیکربندی و اطلاعات سامانه</p>
          </div>
        </div>
        {tab !== 'backup' && tab !== 'partners' && (
          <EffectAction
            type="button"
            onClick={saveCurrentTab}
            disabled={saving}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-(--theme-btn-bg) px-4 py-2 text-xs font-bold text-(--theme-btn-text) shadow-sm transition hover:bg-(--theme-btn-hover) disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}</span>
          </EffectAction>
        )}
      </header>

      <nav aria-label="بخش‌های تنظیمات" className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-2.5 shadow-(--theme-card-shadow) sm:p-3">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {settingsTabs.map((item, index) => {
            const Icon = item.icon;
            const selected = tab === item.id;

            return (
            <EffectTabButton
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              selected={selected}
              className={`group relative flex min-h-18 min-w-0 items-center gap-2.5 overflow-hidden rounded-xl border px-3 py-2.5 text-start transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--theme-primary) ${
                selected
                  ? 'border-(--theme-primary-ink)/35 bg-(--theme-primary)/10 text-(--theme-primary-ink) shadow-sm'
                  : 'border-transparent bg-(--theme-surface-muted) text-(--theme-text-muted) hover:border-(--theme-border) hover:bg-(--theme-surface) hover:text-(--theme-text)'
              }`}
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors ${
                selected ? 'bg-(--theme-primary) text-(--theme-primary-foreground)' : 'bg-(--theme-surface) text-(--theme-text-muted) shadow-sm'
              }`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold leading-5">{item.label}</span>
                <span className={`mt-0.5 block truncate text-[10px] leading-4 ${
                  selected ? 'text-(--theme-primary-ink)/85' : 'text-(--theme-text-muted)'
                }`}>{item.description}</span>
              </span>
              <span className="absolute inset-e-2 top-1.5 text-[9px] font-bold tabular-nums text-(--theme-text-muted)/60">
                {String(index + 1).padStart(2, '0')}
              </span>
            </EffectTabButton>
            );
          })}
        </div>
      </nav>

      {tab === 'company' && (
        <SettingsSection
          title="اطلاعات شرکت و لوگو"
          description="نام، شعار، اطلاعات تماس و نشان‌های بصری شرکت را مدیریت کنید."
          icon={Building2}
        >
        <EffectTabPanel className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-(--theme-text)">نام فارسی شرکت</label>
            <input value={settings.company.name_fa} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, name_fa: e.target.value } })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-(--theme-text)">نام انگلیسی شرکت</label>
            <input dir="ltr" value={settings.company.name_en || ''} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, name_en: e.target.value } })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-(--theme-text)">شعار سازمانی</label>
            <input value={settings.company.slogan_fa} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, slogan_fa: e.target.value } })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-(--theme-text)">شعار سازمانی (انگلیسی)</label>
            <input dir="ltr" value={settings.company.slogan_en || ''} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, slogan_en: e.target.value } })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-(--theme-text)">آدرس کارخانه</label>
            <input value={settings.company.factory_address_fa} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, factory_address_fa: e.target.value } })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-(--theme-text)">تلفن کارخانه</label>
            <input dir="ltr" value={settings.company.factory_phone} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, factory_phone: e.target.value } })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-(--theme-text)">آدرس دفتر مرکزی</label>
            <input value={settings.company.office_address_fa} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, office_address_fa: e.target.value } })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-(--theme-text)">تلفن دفتر مرکزی</label>
            <input dir="ltr" value={settings.company.office_phone || ''} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, office_phone: e.target.value } })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-(--theme-text)">شماره امور بازرگانی</label>
            <input dir="ltr" value={settings.company.commercial_phone || ''} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, commercial_phone: e.target.value } })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-(--theme-text)">متن کپی‌رایت فوتر</label>
            <input value={settings.company.footer_note_fa} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, footer_note_fa: e.target.value } })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-(--theme-text)">آخرین به‌روزرسانی کاتالوگ (فارسی)</label>
            <input value={settings.company.last_updated_fa || ''} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, last_updated_fa: e.target.value } })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-(--theme-text)">آخرین به‌روزرسانی کاتالوگ (انگلیسی)</label>
            <input dir="ltr" value={settings.company.last_updated_en || ''} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, last_updated_en: e.target.value } })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-(--theme-text)">استانداردهای قابل نمایش در فوتر (فارسی)</label>
            <input value={settings.company.standards_fa || ''} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, standards_fa: e.target.value } })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-(--theme-text)">استانداردهای قابل نمایش در فوتر (انگلیسی)</label>
            <input dir="ltr" value={settings.company.standards_en || ''} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, standards_en: e.target.value } })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
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
                onChange={(url) => setSettings({
                  ...settings,
                  company: { ...settings.company, logo_small_url: url },
                  logos: {
                    ...(settings.logos || {}),
                    navbar: url,
                    admin_sidebar: url,
                  },
                })}
                folder="logos"
                placeholder="/storage/logos/logo-small.png"
                showAnimatedPresets
              />
            </div>
          </div>
        </EffectTabPanel>
        </SettingsSection>
      )}

      {tab === 'social' && (
        <SettingsSection
          title="نوار تماس و شبکه‌های اجتماعی"
          description="راه‌های ارتباطی و پیوندهای شبکه‌های اجتماعی قابل‌نمایش در سایت."
          icon={Share2}
        >
        <EffectTabPanel className="space-y-4 p-5">
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold sm:col-span-2">
              <input
                type="checkbox"
                checked={settings.site.info_bar_enabled ?? true}
                onChange={(e) => setSettings({ ...settings, site: { ...settings.site, info_bar_enabled: e.target.checked } })}
              />
              <span>نمایش نوار باریک تماس و شبکه‌های اجتماعی در سربرگ سایت</span>
            </label>
            <p className="mt-2 text-xs leading-6 text-(--theme-text-muted)">
              برای هر شبکه می‌توانید نام، لینک، آیکن و وضعیت نمایش را جداگانه تنظیم کنید.
              گزینهٔ واتساپ در فهرست آیکن‌ها موجود است.
            </p>
          </div>

          <div className="space-y-3 border-t border-(--theme-border) pt-4">
            <div className="grid items-center gap-3 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-3 sm:grid-cols-[minmax(8rem,1fr)_minmax(12rem,2fr)_minmax(9rem,1fr)_auto_auto]">
              <span className="rounded-lg border border-(--theme-border) bg-(--theme-surface) px-3 py-2 text-sm text-(--theme-text)">
                تلفن
              </span>
              <input
                aria-label="شماره تلفن نوار بالای صفحه"
                dir="ltr"
                type="tel"
                value={settings.site.info_bar_phone || settings.company.commercial_phone || ''}
                onChange={(event) => setSettings({
                  ...settings,
                  site: { ...settings.site, info_bar_phone: event.target.value },
                })}
                className="min-w-0 rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)"
              />
              <label className="flex min-w-0 items-center gap-2 rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5">
                <DynamicLucideIcon name={settings.site.info_bar_phone_icon || 'Phone'} className="h-4 w-4 shrink-0 text-(--theme-primary-ink)" />
                <select
                  aria-label="آیکن شماره تلفن"
                  value={settings.site.info_bar_phone_icon || 'Phone'}
                  onChange={(event) => setSettings({
                    ...settings,
                    site: { ...settings.site, info_bar_phone_icon: event.target.value },
                  })}
                  className="min-w-0 flex-1 bg-(--theme-input-bg) py-2 text-xs text-(--theme-input-text) outline-none"
                >
                  {Object.entries(LUCIDE_ICON_REGISTRY).map(([name, entry]) => (
                    <option key={name} value={name}>{entry.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 whitespace-nowrap text-xs text-(--theme-text)">
                <input
                  type="checkbox"
                  checked={settings.site.info_bar_phone_enabled !== false}
                  onChange={(event) => setSettings({
                    ...settings,
                    site: { ...settings.site, info_bar_phone_enabled: event.target.checked },
                  })}
                  className="accent-(--theme-primary)"
                />
                <span>نمایش</span>
              </label>
              <span aria-hidden="true" className="h-9 w-9" />
            </div>
            {(settings.site.social_links ?? []).map((link) => (
              <div key={link.id} className="grid items-center gap-3 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-3 sm:grid-cols-[minmax(8rem,1fr)_minmax(12rem,2fr)_minmax(9rem,1fr)_auto_auto]">
                <input
                  aria-label="نام شبکه اجتماعی"
                  value={link.name}
                  onChange={(event) => setSettings({
                    ...settings,
                    site: {
                      ...settings.site,
                      social_links: settings.site.social_links?.map((item) => item.id === link.id
                        ? { ...item, name: event.target.value }
                        : item),
                    },
                  })}
                  placeholder="نام شبکه"
                  className="min-w-0 rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)"
                />
                <input
                  aria-label={`پیوند ${link.name}`}
                  dir="ltr"
                  type="url"
                  value={link.url}
                  onChange={(event) => setSettings({
                    ...settings,
                    site: {
                      ...settings.site,
                      social_links: settings.site.social_links?.map((item) => item.id === link.id
                        ? { ...item, url: event.target.value }
                        : item),
                    },
                  })}
                  placeholder="https://..."
                  className="min-w-0 rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)"
                />
                <label className="flex min-w-0 items-center gap-2 rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5">
                  <DynamicLucideIcon name={link.icon} fallback="Globe" className="h-4 w-4 shrink-0 text-(--theme-primary-ink)" />
                  <select
                    aria-label={`آیکن ${link.name}`}
                    value={link.icon}
                    onChange={(event) => setSettings({
                      ...settings,
                      site: {
                        ...settings.site,
                        social_links: settings.site.social_links?.map((item) => item.id === link.id
                          ? { ...item, icon: event.target.value }
                          : item),
                      },
                    })}
                    className="min-w-0 flex-1 bg-(--theme-input-bg) py-2 text-xs text-(--theme-input-text) outline-none"
                  >
                    {Object.entries(LUCIDE_ICON_REGISTRY).map(([name, entry]) => (
                      <option key={name} value={name}>{entry.label}</option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 whitespace-nowrap text-xs text-(--theme-text)">
                  <input
                    type="checkbox"
                    checked={link.is_active}
                    onChange={(event) => setSettings({
                      ...settings,
                      site: {
                        ...settings.site,
                        social_links: settings.site.social_links?.map((item) => item.id === link.id
                          ? { ...item, is_active: event.target.checked }
                          : item),
                      },
                    })}
                    className="accent-(--theme-primary)"
                  />
                  <span>نمایش</span>
                </label>
                <button
                  type="button"
                  onClick={() => setSettings({
                    ...settings,
                    site: {
                      ...settings.site,
                      social_links: settings.site.social_links?.filter((item) => item.id !== link.id),
                    },
                  })}
                  aria-label={`حذف ${link.name}`}
                  className="grid h-9 w-9 place-items-center rounded-lg text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const links = settings.site.social_links ?? [];
                const id = Math.max(Date.now(), ...links.map((link) => link.id)) + 1;
                setSettings({
                  ...settings,
                  site: {
                    ...settings.site,
                    social_links: [
                      ...links,
                      { id, name: 'شبکه اجتماعی جدید', url: '', icon: 'Globe', is_active: true },
                    ],
                  },
                });
              }}
              disabled={(settings.site.social_links?.length ?? 0) >= 12}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-(--theme-border-strong) px-3 py-2 text-xs font-semibold text-(--theme-text-muted) transition-colors hover:border-(--theme-primary-ink) hover:text-(--theme-primary-ink) disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              افزودن شبکه اجتماعی
            </button>
          </div>
        </EffectTabPanel>
        </SettingsSection>
      )}

      {tab === 'partners' && (
        <SettingsSection
          title="لوگوهای اسلایدر صفحه اصلی"
          description="مدیریت لوگوها و برندهایی که در اسلایدر صفحهٔ اصلی نمایش داده می‌شوند."
          icon={Handshake}
        >
          <EffectTabPanel className="p-5">
            <PartnerLogoManager />
          </EffectTabPanel>
        </SettingsSection>
      )}

      {tab === 'logs' && (
        <SettingsSection
          title="نگهداری لاگ‌های فعالیت"
          description="تعیین کنید گزارش‌های فعالیت تا چه مدت در سامانه باقی بمانند."
          icon={ScrollText}
        >
        <EffectTabPanel className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-bold text-(--theme-text)">مدت نگهداری لاگ‌های فعالیت</h2>
            <p className="mt-1 text-xs leading-6 text-(--theme-text-muted)">
              پاک‌سازی خودکار روزانه اجرا می‌شود و گزارش‌های قدیمی‌تر از بازه انتخابی حذف می‌شوند. اجرای زمان‌بندی‌شده نیازمند فعال بودن زمان‌بند Laravel روی سرور است.
            </p>
          </div>
          <label className="block max-w-md space-y-1.5 text-xs font-semibold text-(--theme-text)">
            <span>حفظ لاگ‌ها برای</span>
            <select
              value={settings.logs?.activity_logs_retention_months ?? 12}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  logs: {
                    activity_logs_retention_months: Number(event.target.value) as 1 | 3 | 6 | 12,
                  },
                })
              }
              className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) outline-none transition focus:border-(--theme-primary)"
            >
              <option value={1}>۱ ماه</option>
              <option value={3}>۳ ماه</option>
              <option value={6}>۶ ماه</option>
              <option value={12}>۱ سال</option>
            </select>
          </label>
        </EffectTabPanel>
        </SettingsSection>
      )}

      {tab === 'email' && (
        <SettingsSection
          title="تنظیمات ایمیل و قالب HTML"
          description="پیکربندی SMTP، ارسال ایمیل آزمایشی و ویرایش قالب اعلان‌ها."
          icon={Mail}
        >
        <EffectTabPanel className="space-y-6 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <input dir="ltr" placeholder="SMTP Host" value={settings.email.smtp_host} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtp_host: e.target.value } })} className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
            <input dir="ltr" type="number" placeholder="Port" value={settings.email.smtp_port} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtp_port: Number(e.target.value) } })} className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
            <input dir="ltr" placeholder="SMTP Username" value={settings.email.smtp_user} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtp_user: e.target.value } })} className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
            <input dir="ltr" type="password" placeholder="رمز عبور جدید SMTP (ذخیره رمزنگاری‌شده AES-256)" value={smtpPassPlain} onChange={(e) => setSmtpPassPlain(e.target.value)} className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
            <input dir="ltr" type="email" placeholder="آدرس فرستنده" value={settings.email.from_address} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, from_address: e.target.value } })} className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
            <input placeholder="نام فرستنده" value={settings.email.from_name} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, from_name: e.target.value } })} className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
          </div>
          <div className="flex flex-wrap gap-3 border-t border-(--theme-border) pt-4">
            <input dir="ltr" type="email" placeholder="آدرس دریافت‌کننده برای آزمون" value={emailTestAddress} onChange={(e) => setEmailTestAddress(e.target.value)} className="min-w-64 flex-1 rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
            <button type="button" onClick={testEmail} disabled={testingEmail || !emailTestAddress} className="rounded-lg border border-(--theme-border) bg-(--theme-surface) px-4 py-2 text-xs font-semibold text-(--theme-text) transition hover:bg-(--theme-surface-muted) disabled:opacity-50">
              {testingEmail ? 'در حال ارسال...' : 'ارسال ایمیل آزمایشی'}
            </button>
          </div>
          {templates[0] && (
            <div className="space-y-3 border-t border-(--theme-border) pt-4">
              <h3 className="text-sm font-bold text-(--theme-text)">ادیتور اختصاصی قالب HTML ایمیل ({templates[0].name_fa})</h3>
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
                className="rounded-lg border border-(--theme-border) bg-(--theme-surface) px-4 py-2 text-xs font-semibold text-(--theme-text) transition hover:bg-(--theme-surface-muted)"
              >
                ذخیره قالب ایمیل
              </button>
            </div>
          )}
        </EffectTabPanel>
        </SettingsSection>
      )}

      {tab === 'sms' && (
        <SettingsSection
          title="تنظیمات پنل پیامک"
          description="انتخاب سرویس‌دهنده، شمارهٔ ارسال و وضعیت ارسال خودکار پیامک."
          icon={MessageSquareText}
        >
        <EffectTabPanel className="grid gap-4 p-5 sm:grid-cols-2">
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
            <label className="mb-1 block text-xs font-medium text-(--theme-text)">شماره خط ارسال‌کننده</label>
            <input dir="ltr" value={settings.sms.sender_line} onChange={(e) => setSettings({ ...settings, sms: { ...settings.sms, sender_line: e.target.value } })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-(--theme-text)">کلید API جدید (رمزنگاری AES-256 در دیتابیس)</label>
            <input dir="ltr" type="password" placeholder="API Key..." value={smsKeyPlain} onChange={(e) => setSmsKeyPlain(e.target.value)} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-(--theme-text)">
            <input type="checkbox" checked={settings.sms.enabled} onChange={(e) => setSettings({ ...settings, sms: { ...settings.sms, enabled: e.target.checked } })} className="accent-(--theme-primary)" />
            <span>ارسال خودکار پیامک برای رویدادهای RFQ و ورود فعال باشد</span>
          </label>
        </EffectTabPanel>
        </SettingsSection>
      )}

      {tab === 'map_seo' && (
        <SettingsSection
          title="نقشه، سئو و تنظیمات سایت"
          description="تنظیم موقعیت کارخانه، اطلاعات موتورهای جستجو و رفتار عمومی سایت."
          icon={MapPinned}
        >
        <EffectTabPanel className="grid gap-4 p-5 sm:grid-cols-2">
          <input value={settings.site.header_cta_text_fa || ''} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, header_cta_text_fa: e.target.value } })} placeholder="متن دکمه اصلی هدر (فارسی)" className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
          <input dir="ltr" value={settings.site.header_cta_text_en || ''} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, header_cta_text_en: e.target.value } })} placeholder="Header CTA text (English)" className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
          <input dir="ltr" value={settings.site.header_cta_url || ''} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, header_cta_url: e.target.value } })} placeholder="Header CTA URL" className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
          <input value={settings.seo.site_title} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, site_title: e.target.value } })} placeholder="عنوان سئو سایت (فارسی)" className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
          <input dir="ltr" value={settings.seo.site_title_en || ''} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, site_title_en: e.target.value } })} placeholder="SEO site title (English)" className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
          <textarea value={settings.seo.meta_description || ''} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, meta_description: e.target.value } })} placeholder="توضیحات متای سایت (فارسی)" rows={3} className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
          <textarea dir="ltr" value={settings.seo.meta_description_en || ''} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, meta_description_en: e.target.value } })} placeholder="Meta description (English)" rows={3} className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
          <input value={settings.seo.keywords || ''} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, keywords: e.target.value } })} placeholder="کلمات کلیدی (فارسی)" className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
          <input dir="ltr" value={settings.seo.keywords_en || ''} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, keywords_en: e.target.value } })} placeholder="SEO keywords (English)" className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
          <label className="flex flex-col gap-1 text-xs font-medium text-(--theme-text)">
            <span>سیاست نمایه‌سازی موتورهای جستجو</span>
            <select
              value={settings.seo.robots || 'index,follow'}
              onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, robots: e.target.value as SiteSettings['seo']['robots'] } })}
              className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) outline-none transition focus:border-(--theme-primary)"
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
          <input type="number" step="0.0001" dir="ltr" value={settings.map.factory_lat} onChange={(e) => setSettings({ ...settings, map: { ...settings.map, factory_lat: Number(e.target.value) } })} placeholder="Lat" className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
          <input type="number" step="0.0001" dir="ltr" value={settings.map.factory_lng} onChange={(e) => setSettings({ ...settings, map: { ...settings.map, factory_lng: Number(e.target.value) } })} placeholder="Lng" className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
          <label className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 sm:col-span-2">
            <input type="checkbox" checked={settings.site.maintenance_mode} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, maintenance_mode: e.target.checked } })} className="accent-amber-600" />
            <span>فعال‌سازی حالت نگهداری موقت سایت (Maintenance Mode) برای بازدیدکنندگان عمومی</span>
          </label>
          <input value={settings.site.maintenance_message_fa || ''} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, maintenance_message_fa: e.target.value } })} placeholder="پیام حالت نگهداری" className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition focus:border-(--theme-primary)" />
          <label className="flex items-center gap-2 text-xs font-medium text-(--theme-text)">
            <input type="checkbox" checked={settings.site.allow_registration} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, allow_registration: e.target.checked } })} className="accent-(--theme-primary)" />
            <span>اجازهٔ ثبت‌نام کاربران جدید</span>
          </label>
        </EffectTabPanel>
        </SettingsSection>
      )}

      {tab === 'backup' && (
        <SettingsSection
          title="پشتیبان‌گیری و بازیابی پایگاه‌داده"
          description="دریافت نسخهٔ کامل یا انتخابی و بازیابی کنترل‌شده از فایل پشتیبان."
          icon={Database}
        >
        {isSuperAdmin ? (
          <div className="space-y-4 p-5">
            <EffectTabPanel className="space-y-4 rounded-xl border border-amber-300/70 bg-amber-50/80 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
                <div>
                  <h2 className="text-sm font-bold text-amber-950 dark:text-amber-200">فایل پشتیبان شامل اطلاعات حساس است</h2>
                  <p className="mt-1 text-xs leading-6 text-amber-900/80 dark:text-amber-200/80">
                    فایل کامل می‌تواند شامل حساب‌ها، هش رمز عبور و تنظیمات رمزگذاری‌شده باشد. آن را فقط در محل امن نگه دارید. نشست‌ها و توکن‌های ورود عمداً در فایل قرار نمی‌گیرند.
                  </p>
                </div>
              </div>
            </EffectTabPanel>

            <div className="grid gap-4 xl:grid-cols-2">
              <SettingsSection
                title="ساخت فایل پشتیبان"
                description="همهٔ جدول‌ها یا فقط جدول‌های انتخاب‌شده را در قالب JSON دریافت کنید."
                icon={Download}
                nested
              >
              <EffectTabPanel className="space-y-4 p-4 sm:p-5">

                <div className="flex flex-wrap items-center justify-between gap-2 border-y border-(--theme-border) py-3">
                  <p className="text-xs font-semibold text-(--theme-text-muted)">
                    {loadingBackupTables ? 'در حال خواندن فهرست جدول‌ها...' : `${selectedBackupTables.length} از ${backupTables.length} جدول انتخاب شده`}
                  </p>
                  <button
                    type="button"
                    disabled={loadingBackupTables || backupTables.length === 0}
                    onClick={() => setSelectedBackupTables(allBackupTablesSelected ? [] : backupTables.map((table) => table.name))}
                    className="text-xs font-bold text-(--theme-primary-ink) hover:underline disabled:opacity-50"
                  >
                    {allBackupTablesSelected ? 'لغو انتخاب همه' : 'انتخاب همهٔ جدول‌ها'}
                  </button>
                </div>

                <div className="grid max-h-72 gap-1 overflow-y-auto sm:grid-cols-2">
                  {backupTables.map((table) => (
                    <label key={table.name} className="flex min-w-0 cursor-pointer items-start gap-2 rounded-lg px-2.5 py-2 transition hover:bg-(--theme-surface-muted)">
                      <input
                        type="checkbox"
                        checked={selectedBackupTables.includes(table.name)}
                        onChange={() => setSelectedBackupTables((current) => current.includes(table.name)
                          ? current.filter((name) => name !== table.name)
                          : [...current, table.name])}
                        className="mt-1 h-4 w-4 shrink-0 accent-(--theme-primary)"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-semibold text-(--theme-text)">{table.label_fa}</span>
                          <span className="shrink-0 text-[10px] tabular-nums text-(--theme-text-muted)">{table.count.toLocaleString('fa-IR')}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] text-(--theme-text-muted)" dir="ltr">{table.label_en} · {table.name}</span>
                        {table.sensitive && <span className="mt-1 inline-block text-[9px] font-semibold text-amber-700 dark:text-amber-300">حساس / Sensitive</span>}
                      </span>
                    </label>
                  ))}
                  {!loadingBackupTables && backupTables.length === 0 && (
                    <p className="col-span-full py-8 text-center text-xs text-(--theme-text-muted)">جدولی برای پشتیبان‌گیری پیدا نشد.</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => void downloadBackup()}
                  disabled={downloadingBackup || loadingBackupTables || selectedBackupTables.length === 0}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--theme-btn-bg) px-4 py-2.5 text-sm font-bold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover) disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  {downloadingBackup
                    ? 'در حال آماده‌سازی فایل...'
                    : allBackupTablesSelected
                      ? 'دانلود پشتیبان کامل'
                      : `دانلود پشتیبان ${selectedBackupTables.length} جدول`}
                </button>
              </EffectTabPanel>
              </SettingsSection>

              <SettingsSection
                title="بازیابی از فایل پشتیبان"
                description="فایل JSON را بررسی کنید و بازیابی کامل یا انتخابی انجام دهید."
                icon={RotateCcw}
                nested
              >
              <EffectTabPanel className="space-y-4 p-4 sm:p-5">

                <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-(--theme-border-strong) bg-(--theme-surface-muted) px-4 py-5 text-center transition hover:border-(--theme-primary-ink) hover:bg-(--theme-surface)">
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="sr-only"
                    onChange={(event) => {
                      void inspectBackupFile(event.target.files?.[0]);
                      event.currentTarget.value = '';
                    }}
                  />
                  <FileUp className="h-5 w-5 text-(--theme-primary-ink)" />
                  <span className="text-xs font-bold text-(--theme-text)">{inspectingBackup ? 'در حال بررسی فایل...' : 'انتخاب فایل JSON پشتیبان'}</span>
                  <span className="max-w-full truncate text-[10px] text-(--theme-text-muted)" dir="ltr">{restoreFile?.name ?? 'Parspolad database backup · JSON'}</span>
                </label>

                {backupInspection && (
                  <div className="space-y-3">
                    <div className={`rounded-xl border p-3 text-xs leading-5 ${backupInspection.complete
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200'
                      : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200'}`}>
                      <p className="font-bold">
                        {backupInspection.complete ? 'پشتیبان کامل و سازگار' : 'فایل جزئی یا قدیمی'}
                        <span className="ms-2 font-normal">{backupInspection.table_count} جدول</span>
                      </p>
                      {backupInspection.created_at && (
                        <p className="mt-1" dir="ltr">{new Date(backupInspection.created_at).toLocaleString()}</p>
                      )}
                      {backupInspection.legacy && (
                        <p className="mt-1">این فایل از فرمت قدیمی ساخته شده؛ برخی جدول‌ها ممکن است قابل بازیابی نباشند.</p>
                      )}
                      {!backupInspection.complete && (
                        <p className="mt-1">
                          {backupInspection.missing_tables.length} جدول در فایل نیست و بازیابی نمی‌شود؛ فایل فقط داده‌های موجود در خودش را جایگزین می‌کند.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-(--theme-text-muted)">
                        {selectedRestoreTables.length} از {restorableBackupTables.length} جدول قابل بازیابی انتخاب شده
                      </p>
                      <button
                        type="button"
                        disabled={restorableBackupTables.length === 0}
                        onClick={() => setSelectedRestoreTables(allRestoreTablesSelected
                          ? []
                          : restorableBackupTables.map((table) => table.name))}
                        className="text-xs font-bold text-(--theme-primary-ink) hover:underline disabled:opacity-50"
                      >
                        {allRestoreTablesSelected ? 'لغو انتخاب همه' : 'انتخاب همهٔ جدول‌های قابل‌بازیابی'}
                      </button>
                    </div>

                    <div className="grid max-h-64 gap-1 overflow-y-auto sm:grid-cols-2">
                      {backupInspection.tables.map((table) => (
                        <label
                          key={table.name}
                          className={`flex min-w-0 items-start gap-2 rounded-lg px-2.5 py-2 ${table.restorable
                            ? 'cursor-pointer hover:bg-(--theme-surface-muted)'
                            : 'cursor-not-allowed opacity-50'}`}
                        >
                          <input
                            type="checkbox"
                            disabled={!table.restorable}
                            checked={selectedRestoreTables.includes(table.name)}
                            onChange={() => setSelectedRestoreTables((current) => current.includes(table.name)
                              ? current.filter((name) => name !== table.name)
                              : [...current, table.name])}
                            className="mt-1 h-4 w-4 shrink-0 accent-(--theme-primary)"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className="truncate text-xs font-semibold text-(--theme-text)">{table.label_fa}</span>
                              <span className="shrink-0 text-[10px] tabular-nums text-(--theme-text-muted)">{table.row_count.toLocaleString('fa-IR')}</span>
                            </span>
                            <span className="mt-0.5 block truncate text-[10px] text-(--theme-text-muted)" dir="ltr">{table.label_en} · {table.name}</span>
                            {!table.restorable && table.error && <span className="mt-1 block text-[10px] text-red-600 dark:text-red-400">{table.error}</span>}
                          </span>
                        </label>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setRestoreDialogOpen(true)}
                      disabled={!restoreFile || selectedRestoreTables.length === 0 || restoringBackup}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                      بازیابی {selectedRestoreTables.length} جدول انتخاب‌شده
                    </button>
                  </div>
                )}
              </EffectTabPanel>
              </SettingsSection>
            </div>

            <ConfirmDialog
              open={restoreDialogOpen}
              onClose={() => setRestoreDialogOpen(false)}
              onConfirm={() => void restoreBackup()}
              title="تأیید جایگزینی اطلاعات"
              message={`اطلاعات فعلی ${selectedRestoreTables.length} جدول انتخاب‌شده به‌طور کامل جایگزین می‌شود؛ این عملیات ادغام نیست. در صورت خطا، تراکنش برمی‌گردد. پس از موفقیت همهٔ نشست‌ها باطل می‌شوند و باید دوباره وارد شوید. ادامه می‌دهید؟`}
              confirmLabel="جایگزینی و بازیابی"
              loading={restoringBackup}
            />
          </div>
        ) : (
          <EffectTabPanel className="m-5 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
            <div className="flex items-center gap-3 text-amber-900 dark:text-amber-200">
              <ShieldAlert className="h-5 w-5" />
              <p className="text-sm font-semibold">پشتیبان‌گیری و بازیابی فقط برای سوپرادمین فعال است.</p>
            </div>
          </EffectTabPanel>
        )}
        </SettingsSection>
      )}
    </div>
  );
};
