import React, { useEffect, useState } from 'react';
import { Bell, Check, Save, ShieldCheck } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { NotificationItem, User } from '../../types/index.ts';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { EffectProfileAvatar, EffectProfileCard } from '../../components/effects/index.ts';

const profileSchema = z.object({
  name: z.string().trim().min(1, 'نام الزامی است.').max(120, 'نام نمی‌تواند بیش از ۱۲۰ نویسه باشد.'),
  phone: z.string().max(30, 'شماره تماس نمی‌تواند بیش از ۳۰ نویسه باشد.'),
  avatar: z.string().max(255, 'نشانی آواتار بیش از حد طولانی است.'),
  two_factor_enabled: z.boolean(),
  current_password: z.string(),
  new_password: z.string().refine((value) => value === '' || value.length >= 8, 'رمز عبور جدید باید حداقل ۸ نویسه باشد.'),
}).refine((values) => values.new_password === '' || values.current_password !== '', {
  path: ['current_password'],
  message: 'برای تغییر رمز عبور، رمز فعلی را وارد کنید.',
});
type ProfileForm = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user, setAuth, token, addToast } = useAppStore();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '/storage/logos/logo-small.png',
      two_factor_enabled: Boolean(user?.two_factor_enabled),
      current_password: '',
      new_password: '',
    },
  });
  const name = watch('name');
  const avatar = watch('avatar');

  useEffect(() => {
    reset({
      name: user?.name || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '/storage/logos/logo-small.png',
      two_factor_enabled: Boolean(user?.two_factor_enabled),
      current_password: '',
      new_password: '',
    });
  }, [user, reset]);

  const handleSave = async (values: ProfileForm) => {
    try {
      const res = await apiRequest<{ user: User }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          avatar: values.avatar,
          two_factor_enabled: values.two_factor_enabled,
          current_password: values.current_password || undefined,
          new_password: values.new_password || undefined,
        }),
      });
      setAuth(res.user, token);
      reset({
        name: res.user.name,
        phone: res.user.phone || '',
        avatar: res.user.avatar || '/storage/logos/logo-small.png',
        two_factor_enabled: Boolean(res.user.two_factor_enabled),
        current_password: '',
        new_password: '',
      });
      addToast('success', 'پروفایل و تنظیمات امنیتی بروزرسانی شد.');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'خطا در بروزرسانی پروفایل');
    }
  };

  return (
    <EffectProfileCard className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h1 className="mb-5 text-lg font-extrabold">پروفایل کاربری، آواتار و احراز هویت دو مرحله‌ای (2FA)</h1>
      <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
        <div className="flex items-center gap-4">
          <EffectProfileAvatar src={avatar} alt={name} className="h-16 w-16 rounded-full border border-slate-200 object-cover" />
          <div className="flex-1">
            <FileUploader
              folder="avatars"
              accept=".jpg,.jpeg,.png,.webp,.gif"
              currentUrl={avatar}
              label="آپلود تصویر آواتار جدید"
              onUploaded={(url) => setValue('avatar', url, { shouldValidate: true, shouldDirty: true })}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">نام و نام خانوادگی</label>
          <input {...register('name')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          {errors.name && <p role="alert" className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">شماره تماس</label>
          <input dir="ltr" {...register('phone')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          {errors.phone && <p role="alert" className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>
        <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-3 text-xs font-semibold dark:border-slate-700">
          <input type="checkbox" {...register('two_factor_enabled')} />
          <ShieldCheck className="h-4 w-4 text-(--theme-primary)" />
          <span>فعال‌سازی احراز هویت دو مرحله‌ای (2FA) هنگام ورود</span>
        </label>
        <div className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 dark:border-slate-800">
          <label className="space-y-1">
            <input type="password" dir="ltr" placeholder="رمز عبور فعلی (در صورت تغییر)" {...register('current_password')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            {errors.current_password && <span role="alert" className="block text-xs text-red-600">{errors.current_password.message}</span>}
          </label>
          <label className="space-y-1">
            <input type="password" dir="ltr" placeholder="رمز عبور جدید" {...register('new_password')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            {errors.new_password && <span role="alert" className="block text-xs text-red-600">{errors.new_password.message}</span>}
          </label>
        </div>
        <button type="submit" disabled={isSubmitting} style={{ backgroundColor: 'var(--theme-primary)' }} className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-60">
          <Save className="h-4 w-4" />
          <span>ذخیره پروفایل</span>
        </button>
      </form>
    </EffectProfileCard>
  );
};

export const NotificationsPage: React.FC = () => {
  const addToast = useAppStore((state) => state.addToast);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const load = async (targetPage = page) => {
    try {
      const response = await apiRequest<{ data: NotificationItem[]; meta: { last_page: number } }>(
        `/notifications?page=${targetPage}&per_page=20`,
      );
      if (targetPage > response.meta.last_page) {
        setPage(Math.max(1, response.meta.last_page));
        return;
      }
      setItems(response.data);
      setLastPage(response.meta.last_page);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'دریافت اعلان‌ها ناموفق بود.');
    }
  };

  useEffect(() => {
    void load(page);
  }, [page]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="flex items-center gap-2 text-lg font-extrabold">
        <Bell className="h-5 w-5 text-(--theme-primary)" />
        <span>مرکز اعلان‌ها (Notification Center)</span>
      </h1>
      <p className="text-xs leading-6 text-slate-500">
        اعلان‌های داخل پنل را اینجا می‌بینید و می‌توانید وضعیت خوانده‌شدنشان را مدیریت کنید؛ این بخش تنظیمات ارسال ایمیل یا پیامک نیست.
      </p>
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
                try {
                  await apiRequest(`/notifications/${n.id}/read`, { method: 'POST' });
                  await load();
                } catch (error) {
                  addToast('error', error instanceof Error ? error.message : 'علامت‌گذاری اعلان ناموفق بود.');
                }
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700"
            >
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span>خوانده شد</span>
            </button>
          )}
        </div>
      ))}
      <Pagination page={page} lastPage={lastPage} onChange={setPage} />
    </div>
  );
};
