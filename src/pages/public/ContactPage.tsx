import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import L from 'leaflet';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import { CmsPageIntro } from '../../components/common/CmsPageIntro.tsx';
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

const ticketLookupSchema = z.object({
  tracking_number: z.string().trim().min(5, 'شماره پیگیری را وارد کنید'),
  email: z.string().email('ایمیل معتبر وارد کنید'),
  phone: z.string().min(7, 'شماره تماس معتبر وارد کنید'),
});

const ticketReplySchema = z.object({
  message: z.string().min(5, 'متن پاسخ حداقل ۵ کاراکتر باشد').max(5000),
  captcha: z.string().min(1, 'کد امنیتی را وارد کنید'),
  website: z.string().optional(),
});

interface PublicTicket {
  tracking_number: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  messages: Array<{ author_name: string; author_type: string; body: string; created_at: string }>;
}

const TicketLookupPanel: React.FC = () => {
  const { addToast } = useAppStore();
  const [ticket, setTicket] = useState<PublicTicket | null>(null);
  const [identity, setIdentity] = useState<z.infer<typeof ticketLookupSchema> | null>(null);
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaRefreshToken, setCaptchaRefreshToken] = useState(0);
  const lookup = useForm<z.infer<typeof ticketLookupSchema>>({
    resolver: zodResolver(ticketLookupSchema),
  });
  const reply = useForm<z.infer<typeof ticketReplySchema>>({
    resolver: zodResolver(ticketReplySchema),
    defaultValues: { message: '', captcha: '', website: '' },
  });

  const findTicket = async (data: z.infer<typeof ticketLookupSchema>): Promise<boolean> => {
    try {
      const query = new URLSearchParams({ email: data.email, phone: data.phone });
      const response = await apiRequest<{ data: PublicTicket }>(
        `/tickets/${encodeURIComponent(data.tracking_number)}?${query.toString()}`,
      );
      setTicket(response.data);
      setIdentity(data);
      return true;
    } catch (error) {
      setTicket(null);
      addToast('error', error instanceof Error ? error.message : 'تیکت با مشخصات واردشده پیدا نشد.');
      return false;
    }
  };

  const sendReply = async (data: z.infer<typeof ticketReplySchema>) => {
    if (!ticket || !identity || !captchaKey) return;
    try {
      await apiRequest(`/tickets/${encodeURIComponent(ticket.tracking_number)}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          email: identity.email,
          phone: identity.phone,
          message: data.message,
          captcha: data.captcha,
          captcha_key: captchaKey,
        }),
      });
      const refreshed = await findTicket(identity);
      reply.reset();
      setCaptchaKey('');
      setCaptchaRefreshToken((value) => value + 1);
      addToast(refreshed ? 'success' : 'info', refreshed ? 'پاسخ شما به تیکت اضافه شد.' : 'پاسخ ثبت شد؛ برای بروزرسانی گفتگو دوباره جستجو کنید.');
    } catch (error) {
      setCaptchaKey('');
      setCaptchaRefreshToken((value) => value + 1);
      reply.setValue('captcha', '');
      addToast('error', error instanceof Error ? error.message : 'ارسال پاسخ ناموفق بود.');
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-6 shadow-(--theme-card-shadow)">
      <h2 className="text-lg font-bold text-(--theme-text)">پیگیری و پاسخ به تیکت</h2>
      <form onSubmit={lookup.handleSubmit(findTicket)} className="mt-4 grid gap-3 sm:grid-cols-3">
        <input {...lookup.register('tracking_number')} placeholder="شماره پیگیری مانند PPA-12345678" dir="ltr" className="rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
        <input {...lookup.register('email')} type="email" placeholder="ایمیل ثبت‌شده" dir="ltr" className="rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
        <input {...lookup.register('phone')} placeholder="شماره تماس ثبت‌شده" dir="ltr" className="rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
        <button type="submit" disabled={lookup.formState.isSubmitting} className="rounded-xl bg-(--theme-btn-bg) px-4 py-2 text-sm font-semibold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover) sm:col-span-3">
          {lookup.formState.isSubmitting ? 'در حال جستجو...' : 'نمایش گفتگو'}
        </button>
      </form>

      {ticket && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap justify-between gap-2 border-b border-(--theme-border) pb-3 text-sm text-(--theme-text)">
            <strong>{ticket.subject}</strong>
            <span>کد {ticket.tracking_number} · وضعیت: {ticket.status}</span>
          </div>
          <div className="space-y-3">
            {ticket.messages.map((message, index) => (
              <article key={`${message.created_at}-${index}`} className="rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-3 text-sm text-(--theme-text)">
                <div className="mb-1 flex justify-between text-xs text-(--theme-text-muted)">
                  <span>{message.author_type === 'customer' ? 'شما' : message.author_name}</span>
                  <time>{new Date(message.created_at).toLocaleString('fa-IR')}</time>
                </div>
                <p className="whitespace-pre-wrap">{message.body}</p>
              </article>
            ))}
          </div>
          <form onSubmit={reply.handleSubmit(sendReply)} className="space-y-3">
            <PublicHoneypotField registration={reply.register('website')} />
            <textarea {...reply.register('message')} rows={3} placeholder="پاسخ شما..." className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
            {reply.formState.errors.message && <p className="text-xs text-red-600">{reply.formState.errors.message.message}</p>}
            <SelfHostedCaptcha
              registration={reply.register('captcha')}
              refreshToken={captchaRefreshToken}
              onKeyChange={setCaptchaKey}
              onRefresh={() => {
                setCaptchaKey('');
                setCaptchaRefreshToken((value) => value + 1);
                reply.setValue('captcha', '');
              }}
              error={reply.formState.errors.captcha?.message}
            />
            <button type="submit" disabled={reply.formState.isSubmitting || !captchaKey} className="rounded-xl bg-(--theme-btn-bg) px-4 py-2 text-sm font-semibold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover) disabled:opacity-50">
              ارسال پاسخ
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

const createMapPopup = (title: string, address: string): HTMLElement => {
  const container = document.createElement('div');
  const heading = document.createElement('strong');
  const location = document.createElement('div');
  heading.textContent = title;
  location.textContent = address;
  container.append(heading, location);
  return container;
};

export const ContactPage: React.FC = () => {
  const { bootstrap, language, addToast } = useAppStore();
  const [submitted, setSubmitted] = useState(false);
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaRefreshToken, setCaptchaRefreshToken] = useState(0);
  const [messageType, setMessageType] = useState<'contact' | 'ticket'>('contact');
  const [trackingNumber, setTrackingNumber] = useState('');
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

    const companyName = language === 'fa' ? bootstrap?.company?.name_fa : bootstrap?.company?.name_en;
    const factoryAddress = language === 'fa' ? bootstrap?.company?.factory_address_fa : bootstrap?.company?.factory_address_en;
    const officeAddress = language === 'fa' ? bootstrap?.company?.office_address_fa : bootstrap?.company?.office_address_en;
    const factoryLabel = language === 'fa' ? 'کارخانه تولیدی' : 'Manufacturing Plant';
    const officeLabel = language === 'fa' ? 'دفتر مرکزی' : 'Head Office';

    L.marker([lat, lng], { icon: pinIcon })
      .addTo(map)
      .bindPopup(createMapPopup(`${companyName || ''} - ${factoryLabel}`, factoryAddress || ''));

    L.marker([oLat, oLng], { icon: pinIcon })
      .addTo(map)
      .bindPopup(createMapPopup(`${companyName || ''} - ${officeLabel}`, officeAddress || ''));

    return () => {
      map.remove();
    };
  }, [bootstrap, language]);

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const response = await apiRequest<{ tracking_number?: string }>('/contact', {
        method: 'POST',
        body: JSON.stringify({ ...data, captcha_key: captchaKey, type: messageType }),
      });
      setSubmitted(true);
      setTrackingNumber(response.tracking_number ?? '');
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
      <CmsPageIntro slug="contact" />

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Form */}
        <div className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-6 shadow-(--theme-card-shadow) sm:p-8 lg:col-span-6">
          <h2 className="text-lg font-bold text-(--theme-text)">ارسال پیام و مکاتبه</h2>
          {submitted && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
              {trackingNumber
                ? `تیکت شما با شماره پیگیری ${trackingNumber} ثبت شد؛ این شماره را برای پیگیری نگه دارید.`
                : 'پیام شما با موفقیت دریافت شد. کارشناسان ما در ساعات اداری پاسخگوی شما خواهند بود.'}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <PublicHoneypotField registration={register('website')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-(--theme-text)">نام و نام خانوادگی</label>
                <input {...register('name')} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--theme-text)">نام شرکت / سازمان</label>
                <input {...register('company')} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-(--theme-text)">ایمیل</label>
                <input {...register('email')} type="email" dir="ltr" className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--theme-text)">شماره تماس</label>
                <input {...register('phone')} dir="ltr" className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-(--theme-text)">نوع درخواست</label>
              <select value={messageType} onChange={(event) => setMessageType(event.target.value as 'contact' | 'ticket')} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)">
                <option value="contact">پیام عمومی</option>
                <option value="ticket">ثبت تیکت قابل پیگیری</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-(--theme-text)">موضوع</label>
              <input {...register('subject')} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
              {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-(--theme-text)">شرح پیام</label>
              <textarea {...register('message')} rows={4} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
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
            <div className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 text-xs text-(--theme-text) shadow-(--theme-card-shadow) space-y-2">
              <div className="font-bold text-sm text-(--theme-primary-ink)">کارخانه تولیدی</div>
              <p className="flex items-start gap-2 text-(--theme-text-muted)">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{company?.factory_address_fa}</span>
              </p>
              <p className="flex items-center gap-2 tabular-nums"><Phone className="h-3.5 w-3.5" /><span dir="ltr">{company?.factory_phone}</span></p>
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><span>{company?.factory_email}</span></p>
            </div>

            <div className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 text-xs text-(--theme-text) shadow-(--theme-card-shadow) space-y-2">
              <div className="font-bold text-sm text-(--theme-accent-ink)">دفتر مرکزی و بازرگانی</div>
              <p className="flex items-start gap-2 text-(--theme-text-muted)">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{company?.office_address_fa}</span>
              </p>
              <p className="flex items-center gap-2 tabular-nums"><Phone className="h-3.5 w-3.5" /><span dir="ltr">{company?.office_phone}</span></p>
              <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /><span>{company?.work_hours_fa}</span></p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) shadow-(--theme-card-shadow)">
            <div ref={mapRef} className="h-85 w-full" />
          </div>
        </div>
      </div>
      <TicketLookupPanel />
    </div>
  );
};
