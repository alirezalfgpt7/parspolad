import React, { useEffect, useState } from 'react';
import { Bell, Check, Save, ShieldCheck, UserRound } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { NotificationItem, User } from '../../types/index.ts';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { EffectProfileAvatar, EffectProfileCard } from '../../components/effects/index.ts';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.tsx';

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
    <div className="space-y-5">
      <AdminPageHeader
        icon={UserRound}
        eyebrow="Account profile"
        title="پروفایل کاربری"
        description="اطلاعات حساب، تصویر آواتار و تنظیمات احراز هویت دو مرحله‌ای را مدیریت کنید."
      />
      <EffectProfileCard className="mx-auto w-full max-w-2xl rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-6 shadow-(--theme-card-shadow)">
      <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
        <div className="relative h-16 w-16">
          <EffectProfileAvatar src={avatar} alt={name} className="h-16 w-16 rounded-full border border-(--theme-border) object-cover" />
          <FileUploader
            variant="icon-button"
            folder="avatars"
            accept=".jpg,.jpeg,.png,.webp,.gif"
            label="تغییر تصویر پروفایل"
            onUploaded={(url) => setValue('avatar', url, { shouldValidate: true, shouldDirty: true })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-(--theme-text)">نام و نام خانوادگی</label>
          <input {...register('name')} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          {errors.name && <p role="alert" className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-(--theme-text)">شماره تماس</label>
          <input dir="ltr" {...register('phone')} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          {errors.phone && <p role="alert" className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>
        <label className="flex items-center gap-2.5 rounded-lg border border-(--theme-border) bg-(--theme-surface-muted) p-3 text-xs font-semibold text-(--theme-text)">
          <input type="checkbox" {...register('two_factor_enabled')} className="accent-(--theme-primary)" />
          <ShieldCheck className="h-4 w-4 text-(--theme-primary-ink)" />
          <span>فعال‌سازی احراز هویت دو مرحله‌ای (2FA) هنگام ورود</span>
        </label>
        <div className="grid gap-3 border-t border-(--theme-border) pt-4 sm:grid-cols-2">
          <label className="space-y-1">
            <input type="password" dir="ltr" placeholder="رمز عبور فعلی (در صورت تغییر)" {...register('current_password')} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
            {errors.current_password && <span role="alert" className="block text-xs text-red-600">{errors.current_password.message}</span>}
          </label>
          <label className="space-y-1">
            <input type="password" dir="ltr" placeholder="رمز عبور جدید" {...register('new_password')} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
            {errors.new_password && <span role="alert" className="block text-xs text-red-600">{errors.new_password.message}</span>}
          </label>
        </div>
        <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-(--theme-btn-bg) px-5 py-2.5 text-xs font-semibold text-(--theme-btn-text) transition-colors hover:bg-(--theme-btn-hover) disabled:opacity-60">
          <Save className="h-4 w-4" />
          <span>ذخیره پروفایل</span>
        </button>
      </form>
      </EffectProfileCard>
    </div>
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
    <div className="space-y-4">
      <AdminPageHeader
        icon={Bell}
        eyebrow="Notification center"
        title="مرکز اعلان‌ها (Notification Center)"
        description="اعلان‌های داخل پنل را ببینید و وضعیت خوانده‌شدنشان را مدیریت کنید."
      />
      {items.map((n) => (
        <div key={n.id} className="flex items-start justify-between gap-4 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-4 shadow-(--theme-card-shadow)">
          <div>
            <div className="text-sm font-bold text-(--theme-text)">{n.title_fa}</div>
            <p className="mt-1 text-xs text-(--theme-text-muted)">{n.body_fa}</p>
            <div className="mt-2 text-[11px] text-(--theme-text-muted)">{n.channel} · {new Date(n.created_at).toLocaleString('fa-IR')}</div>
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
              className="inline-flex items-center gap-1 rounded-lg border border-(--theme-border) bg-(--theme-surface) px-3 py-1.5 text-xs font-semibold text-(--theme-text) hover:bg-(--theme-surface-muted)"
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
