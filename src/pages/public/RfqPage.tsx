import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, FileText } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.tsx';
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

const SCOPE_OPTIONS = [
  { value: 'ساخت تجهیزات سرچاهی API 6A', label: 'ساخت تجهیزات سرچاهی (Wellhead API 6A)' },
  { value: 'تأمین و راندن لاینر هنگر', label: 'تأمین و راندن لاینر هنگر (Liner Hanger)' },
  { value: 'پکرهای تولیدی و متعلقات سیمانزنی', label: 'پکرهای تولیدی و متعلقات سیمانزنی' },
  { value: 'مهندسی معکوس قطعات توربین و کمپرسور', label: 'مهندسی معکوس قطعات توربین و کمپرسور' },
  { value: 'آزمون فشار و بازرسی فنی', label: 'خدمات آزمون فشار هیدرواستاتیک و NDT' },
];

export const RfqPage: React.FC = () => {
  const { addToast } = useAppStore();
  const [scope, setScope] = useState(SCOPE_OPTIONS[0].value);
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
      <SeoHead title="درخواست همکاری و استعلام فنی (RFQ)" />
      <Breadcrumb items={[{ label: 'درخواست همکاری (RFQ)' }]} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="rounded-xl bg-red-50 p-3 text-[var(--theme-primary)] dark:bg-red-950/50">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              فرم درخواست همکاری، مناقصه و استعلام فنی (RFQ)
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              مختص شرکت‌های بهره‌بردار، پیمانکاران حفاری و واحدهای تدارکات (بدون پرداخت آنلاین — ثبت استعلام مهندسی و بازرگانی)
            </p>
          </div>
        </div>

        {done ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h2 className="mt-3 text-lg font-bold">درخواست استعلام شما ثبت گردید</h2>
            <p className="mt-1 text-xs text-slate-500">
              واحد بازرگانی و مهندسی فروش پارس پولاد آقایی در کوتاه‌ترین زمان با شما تماس می‌گیرد.
            </p>
            <button
              type="button"
              onClick={() => setDone(false)}
              className="mt-5 rounded-lg bg-[var(--theme-primary)] px-5 py-2 text-xs font-semibold text-white"
            >
              ثبت استعلام جدید
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <PublicHoneypotField registration={register('website')} />
            <SearchableSelect
              label="حوزه تخصصی درخواست"
              options={SCOPE_OPTIONS}
              value={scope}
              onChange={setScope}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">نام و سمت متقاضی</label>
                <input {...register('name')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">نام شرکت / کارفرما</label>
                <input {...register('company')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                {errors.company && <p className="mt-1 text-xs text-red-600">{errors.company.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">ایمیل سازمانی</label>
                <input {...register('email')} type="email" dir="ltr" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">تلفن تماس</label>
                <input {...register('phone')} dir="ltr" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">عنوان پروژه / شماره مناقصه / تجهیز درخواستی</label>
              <input {...register('subject')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">مشخصات فنی (سایز جداری، فشار کاری PSI، گرید متالورژی، استاندارد مورد نیاز و تعداد)</label>
              <textarea {...register('message')} rows={5} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
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
              className="rounded-lg px-6 py-2.5 text-sm font-semibold shadow-xs disabled:opacity-60"
            >
              {isSubmitting ? 'در حال ثبت...' : 'ارسال رسمی درخواست استعلام'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
