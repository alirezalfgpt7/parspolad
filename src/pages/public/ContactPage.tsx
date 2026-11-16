import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import L from 'leaflet';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.tsx';
import { SelfHostedCaptcha } from '../../components/forms/SelfHostedCaptcha.tsx';
import { PublicHoneypotField } from '../../components/forms/PublicHoneypotField.tsx';

const contactSchema = z.object({
  name: z.string().min(2, 'نام و نام خانوادگی را وارد کنید'),
  email: z.string().email('ایمیل معتبر وارد کنید'),
  phone: z.string().min(7, 'شماره تماس معتبر وارد کنید'),
  company: z.string().optional(),
  subject: z.string().min(3, 'موضوع پیام را وارد کنید'),
  message: z.string().min(10, 'متن پیام حداقل ۱۰ کاراکتر باشد'),
  captcha: z.string().min(1, 'کد امنیتی را وارد کنید'),
  website: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
  const { bootstrap, language, addToast } = useAppStore();
  const [submitted, setSubmitted] = useState(false);
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaRefreshToken, setCaptchaRefreshToken] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { captcha: '', website: '' },
  });

  const refreshCaptcha = () => {
    setCaptchaKey('');
    setCaptchaRefreshToken((token) => token + 1);
    setValue('captcha', '', { shouldValidate: false });
  };

  useEffect(() => {
    if (!mapRef.current) return;
    const lat = bootstrap?.map?.factory_lat || 31.2682;
    const lng = bootstrap?.map?.factory_lng || 48.6251;
    const oLat = bootstrap?.map?.office_lat || 31.3183;
    const oLng = bootstrap?.map?.office_lng || 48.6706;

    const map = L.map(mapRef.current).setView([lat, lng], bootstrap?.map?.zoom || 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: '',
      html: `<div style="width:18px;height:18px;border-radius:50%;background:#B91C1C;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    L.marker([lat, lng], { icon: pinIcon })
      .addTo(map)
      .bindPopup('<strong>کارخانه پارس پولاد آقایی</strong><br/>اهواز، شهرک صنعتی شماره ۳، خیابان ابتکار ۶');

    L.marker([oLat, oLng], { icon: pinIcon })
      .addTo(map)
      .bindPopup('<strong>دفتر مرکزی پارس پولاد آقایی</strong><br/>اهواز، شهرک صنعتی شماره ۱، فاز ۳، واحد ۷');

    return () => {
      map.remove();
    };
  }, [bootstrap]);

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify({ ...data, captcha_key: captchaKey, type: 'contact' }),
      });
      setSubmitted(true);
      reset();
      refreshCaptcha();
      addToast('success', 'پیام شما با موفقیت ثبت و به واحد مربوطه ارجاع شد.');
    } catch (err) {
      refreshCaptcha();
      addToast('error', err instanceof Error ? err.message : 'خطا در ارسال پیام');
    }
  };

  const company = bootstrap?.company;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoHead title={language === 'fa' ? 'تماس با ما' : 'Contact Us'} />
      <Breadcrumb items={[{ label: language === 'fa' ? 'تماس با ما' : 'Contact' }]} />

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          تماس با شرکت پارس پولاد آقایی
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          ارتباط مستقیم با دفتر مرکزی، کارخانه شهرک صنعتی اهواز و واحد بازرگانی
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">ارسال پیام و مکاتبه</h2>
          {submitted && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
              پیام شما با موفقیت دریافت شد. کارشناسان ما در ساعات اداری پاسخگوی شما خواهند بود.
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <PublicHoneypotField registration={register('website')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">نام و نام خانوادگی</label>
                <input {...register('name')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">نام شرکت / سازمان</label>
                <input {...register('company')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">ایمیل</label>
                <input {...register('email')} type="email" dir="ltr" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">شماره تماس</label>
                <input {...register('phone')} dir="ltr" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">موضوع</label>
              <input {...register('subject')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">شرح پیام</label>
              <textarea {...register('message')} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
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
              className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold shadow-xs disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'در حال ارسال...' : 'ارسال پیام'}</span>
            </button>
          </form>
        </div>

        {/* Map & Details */}
        <div className="space-y-6 lg:col-span-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-xs space-y-2 dark:border-slate-800 dark:bg-slate-900">
              <div className="font-bold text-sm text-[var(--theme-primary)]">کارخانه تولیدی</div>
              <p className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{company?.factory_address_fa}</span>
              </p>
              <p className="flex items-center gap-2 tabular-nums"><Phone className="h-3.5 w-3.5" /><span dir="ltr">{company?.factory_phone}</span></p>
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><span>{company?.factory_email}</span></p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 text-xs space-y-2 dark:border-slate-800 dark:bg-slate-900">
              <div className="font-bold text-sm text-amber-600">دفتر مرکزی و بازرگانی</div>
              <p className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{company?.office_address_fa}</span>
              </p>
              <p className="flex items-center gap-2 tabular-nums"><Phone className="h-3.5 w-3.5" /><span dir="ltr">{company?.office_phone}</span></p>
              <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /><span>{company?.work_hours_fa}</span></p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div ref={mapRef} className="h-[340px] w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
