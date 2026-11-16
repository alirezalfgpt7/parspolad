import React, { useEffect, useState } from 'react';
import { Bell, Check, Save, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { NotificationItem, User } from '../../types/index.ts';
import { FileUploader } from '../../components/ui/FileUploader.tsx';

export const ProfilePage: React.FC = () => {
  const { user, setAuth, token, addToast } = useAppStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '/storage/logos/logo-small.png');
  const [twoFactor, setTwoFactor] = useState(Boolean(user?.two_factor_enabled));
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ user: User }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          phone,
          avatar,
          two_factor_enabled: twoFactor,
          current_password: currentPassword || undefined,
          new_password: newPassword || undefined,
        }),
      });
      setAuth(res.user, token);
      setCurrentPassword('');
      setNewPassword('');
      addToast('success', 'پروفایل و تنظیمات امنیتی بروزرسانی شد.');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'خطا در بروزرسانی پروفایل');
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h1 className="mb-5 text-lg font-extrabold">پروفایل کاربری، آواتار و احراز هویت دو مرحله‌ای (2FA)</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex items-center gap-4">
          <img src={avatar} alt={name} className="h-16 w-16 rounded-full border border-slate-200 object-cover" />
          <div className="flex-1">
            <FileUploader folder="avatars" label="آپلود تصویر آواتار جدید" onUploaded={setAvatar} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">نام و نام خانوادگی</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">شماره تماس</label>
          <input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
        </div>
        <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-3 text-xs font-semibold dark:border-slate-700">
          <input type="checkbox" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} />
          <ShieldCheck className="h-4 w-4 text-[var(--theme-primary)]" />
          <span>فعال‌سازی احراز هویت دو مرحله‌ای (2FA) هنگام ورود</span>
        </label>
        <div className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 dark:border-slate-800">
          <input type="password" dir="ltr" placeholder="رمز عبور فعلی (در صورت تغییر)" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <input type="password" dir="ltr" placeholder="رمز عبور جدید" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
        </div>
        <button type="submit" style={{ backgroundColor: 'var(--theme-primary)' }} className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-semibold text-white">
          <Save className="h-4 w-4" />
          <span>ذخیره پروفایل</span>
        </button>
      </form>
    </div>
  );
};

export const NotificationsPage: React.FC = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);

  const load = () => {
    apiRequest<{ data: NotificationItem[] }>('/notifications').then((r) => setItems(r.data)).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="flex items-center gap-2 text-lg font-extrabold">
        <Bell className="h-5 w-5 text-[var(--theme-primary)]" />
        <span>مرکز اعلان‌ها (Notification Center)</span>
      </h1>
      {items.map((n) => (
        <div key={n.id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="text-sm font-bold">{n.title_fa}</div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{n.body_fa}</p>
            <div className="mt-2 text-[11px] text-slate-400">{n.channel} · {new Date(n.created_at).toLocaleString('fa-IR')}</div>
          </div>
          {!n.is_read && (
            <button
              type="button"
              onClick={async () => {
                await apiRequest(`/notifications/${n.id}/read`, { method: 'POST' });
                load();
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700"
            >
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span>خوانده شد</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
