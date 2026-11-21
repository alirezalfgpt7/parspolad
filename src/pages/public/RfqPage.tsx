import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import { CmsPageIntro } from '../../components/common/CmsPageIntro.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { SelfHostedCaptcha } from '../../components/forms/SelfHostedCaptcha.tsx';
import { PublicHoneypotField } from '../../components/forms/PublicHoneypotField.tsx';

const rfqSchema = z.object({
  name: z.string().min(2, 'نام مسئول استعلام الزامی است'),
  company: z.string().min(2, 'نام شرکت یا کارفرما الزامی است'),
  email: z.string().email('ایمیل سازمانی معتبر وارد کنید'),
  phone: z.string().min(8, 'شماره تماس معتبر وارد کنید'),
  subject: z.string().min(4, 'عنوان مناقصه یا تجهیز را وارد کنید'),
  message: z.string().min(12, 'مشخصات فنی (سایز، فشار، گرید و تعداد) را بنویسید'),
  captcha: z.string().min(1, 'کد امنیتی را وارد کنید'),
  website: z.string().optional(),
});

type RfqValues = z.infer<typeof rfqSchema>;

export const RfqPage: React.FC = () => {
  const { addToast, bootstrap, language } = useAppStore();
  const [scope, setScope] = useState('');
  const [done, setDone] = useState(false);
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaRefreshToken, setCaptchaRefreshToken] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RfqValues>({
    resolver: zodResolver(rfqSchema),
    defaultValues: { captcha: '', website: '' },
  });

  const refreshCaptcha = () => {
    setCaptchaKey('');
    setCaptchaRefreshToken((token) => token + 1);
    setValue('captcha', '', { shouldValidate: false });
  };

  const scopeOptions = useMemo(
    () => (bootstrap?.services ?? []).map((service) => {
      const title = language === 'fa' ? service.title_fa : service.title_en;
      return { value: title, label: title };
    }),
    [bootstrap?.services, language]
  );

  useEffect(() => {
    if (scopeOptions.length > 0 && !scopeOptions.some((option) => option.value === scope)) {
      setScope(scopeOptions[0].value);
    }
  }, [scopeOptions, scope]);

  const onSubmit = async (data: RfqValues) => {
    try {
      await apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          captcha_key: captchaKey,
          subject: `[RFQ - ${scope}] ${data.subject}`,
          type: 'rfq',
        }),
      });
      setDone(true);
      reset();
      refreshCaptcha();
      addToast('success', 'فرم درخواست همکاری / RFQ با موفقیت ثبت شد.');
    } catch (err) {
      refreshCaptcha();
      addToast('error', err instanceof Error ? err.message : 'خطا در ثبت استعلام');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <CmsPageIntro slug="rfq" className="mb-6" titleClassName="text-2xl font-extrabold text-white" />

      <div className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-6 shadow-(--theme-card-shadow) sm:p-8">
        {done ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h2 className="mt-3 text-lg font-bold text-(--theme-text)">درخواست استعلام شما ثبت گردید</h2>
            <p className="mt-1 text-xs text-(--theme-text-muted)">
              واحد بازرگانی و مهندسی فروش پارس پولاد آقایی در کوتاه‌ترین زمان با شما تماس می‌گیرد.
            </p>
            <button
              type="button"
              onClick={() => setDone(false)}
              className="mt-5 rounded-xl bg-(--theme-btn-bg) px-5 py-2 text-xs font-semibold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover)"
            >
              ثبت استعلام جدید
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <PublicHoneypotField registration={register('website')} />
            <SearchableSelect
              label="حوزه تخصصی درخواست"
              options={scopeOptions}
              value={scope}
              onChange={setScope}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-(--theme-text)">نام و سمت متقاضی</label>
                <input {...register('name')} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--theme-text)">نام شرکت / کارفرما</label>
                <input {...register('company')} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
                {errors.company && <p className="mt-1 text-xs text-red-600">{errors.company.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-(--theme-text)">ایمیل سازمانی</label>
                <input {...register('email')} type="email" dir="ltr" className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--theme-text)">تلفن تماس</label>
                <input {...register('phone')} dir="ltr" className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-(--theme-text)">عنوان پروژه / شماره مناقصه / تجهیز درخواستی</label>
              <input {...register('subject')} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
              {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-(--theme-text)">مشخصات فنی (سایز جداری، فشار کاری PSI، گرید متالورژی، استاندارد مورد نیاز و تعداد)</label>
              <textarea {...register('message')} rows={5} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
              {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
            </div>

            <SelfHostedCaptcha
              registration={register('captcha')}
              refreshToken={captchaRefreshToken}
              onKeyChange={setCaptchaKey}
              onRefresh={refreshCaptcha}
              error={errors.captcha?.message}
            />

            <button
              type="submit"
              disabled={isSubmitting || !captchaKey}
              style={{ backgroundColor: 'var(--theme-btn-bg)', color: 'var(--theme-btn-text)' }}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold shadow-xs transition hover:bg-(--theme-btn-hover) disabled:opacity-60"
            >
              {isSubmitting ? 'در حال ثبت...' : 'ارسال رسمی درخواست استعلام'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
