import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Wrench } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { PageContent } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.tsx';

const FAQS = [
  {
    q: 'آیا تجهیزات سرچاهی و درون‌چاهی پارس پولاد آقایی دارای تاییدیه‌های استاندارد بین‌المللی هستند؟',
    a: 'بله، تمامی تجهیزات بر اساس استانداردهای API 6A، API 6FA، API 19LH و سیستم‌های مدیریت کیفیت ISO 29001:2020 و ISO 10423:2022 طراحی، ساخته و آزمون می‌شوند.',
  },
  {
    q: 'آیا شرکت خدمات نصب سر دکل و عملیات راندن لاینر هنگر را نیز انجام می‌دهد؟',
    a: 'بله، تیم عملیات میدانی پارس پولاد آقایی با تجربه اجرا در میادین کیش، پارس جنوبی، آزادگان و مناطق نفت‌خیز جنوب، خدمات کامل نصب، راه‌اندازی و راندن آستری را ارائه می‌دهد.',
  },
  {
    q: 'چگونه می‌توان کاتالوگ‌های فنی یا سوابق پروژه‌ها را دریافت کرد؟',
    a: 'از بخش پروژه‌ها و قراردادها می‌توانید فایل‌های PDF عمومی را مستقیماً دریافت نمایید. برخی اسناد تفصیلی کنترل کیفیت نیز پس از ورود به پرتال کاربری قابل دانلود هستند.',
  },
  {
    q: 'آیا امکان ساخت سفارشی قطعات توربین، کمپرسور و شیرآلات فشارقوی وجود دارد؟',
    a: 'بله، واحد R&D و مهندسی معکوس شرکت تاکنون بیش از ۱۴۰ قلم قطعه حساس کمپرسورهای Elliott، Ruston و Rolls-Royce را با دقت میکرونی بومی‌سازی کرده است.',
  },
];

export const FaqPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoHead title="سوالات متداول" />
      <Breadcrumb items={[{ label: 'سوالات متداول' }]} />
      <h1 className="mb-6 text-3xl font-extrabold text-slate-900 dark:text-white">سوالات متداول</h1>
      <div className="space-y-3">
        {FAQS.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="flex w-full items-center justify-between gap-4 p-4 text-start text-sm font-bold"
            >
              <span>{item.q}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`} />
            </button>
            {openIdx === idx && (
              <div className="border-t border-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const LegalPage: React.FC = () => {
  const [page, setPage] = useState<PageContent | null>(null);
  useEffect(() => {
    apiRequest<{ data: PageContent }>('/pages/legal').then((r) => setPage(r.data)).catch(() => {});
  }, []);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoHead title="حریم خصوصی، قوانین و کوکی‌ها" />
      <Breadcrumb items={[{ label: 'حریم خصوصی و قوانین' }]} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-extrabold">{page?.title_fa || 'حریم خصوصی و قوانین استفاده'}</h1>
        <p className="mt-2 text-xs text-slate-500">{page?.subtitle_fa}</p>
        <div className="prose mt-6 max-w-none text-sm leading-8 dark:prose-invert" dangerouslySetInnerHTML={{ __html: page?.content_fa || '' }} />
      </div>
    </div>
  );
};

export const SitemapPage: React.FC = () => {
  const links = [
    { to: '/', label: 'صفحه اصلی و لندینگ' },
    { to: '/about', label: 'درباره شرکت پارس پولاد آقایی' },
    { to: '/services', label: 'خدمات مهندسی، ساخت و نصب' },
    { to: '/products', label: 'محصولات سرچاهی و درون‌چاهی' },
    { to: '/projects', label: 'پروژه‌ها و سوابق اجرایی' },
    { to: '/contracts-licenses', label: 'قراردادها و گواهینامه‌های بین‌المللی' },
    { to: '/org-chart', label: 'ساختار سازمانی و مدیریت' },
    { to: '/news', label: 'اخبار و مقالات فنی' },
    { to: '/rfq', label: 'فرم درخواست همکاری (RFQ)' },
    { to: '/contact', label: 'تماس با ما و نقشه کارخانه' },
    { to: '/faq', label: 'سوالات متداول' },
    { to: '/legal', label: 'حریم خصوصی، قوانین و کوکی‌ها' },
  ];
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoHead title="نقشه سایت" />
      <Breadcrumb items={[{ label: 'نقشه سایت' }]} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">نقشه سایت (HTML & XML Sitemap)</h1>
          <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-xs font-semibold text-[var(--theme-primary)] hover:underline">
            مشاهده sitemap.xml
          </a>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="rounded-lg border border-slate-100 px-4 py-3 text-sm font-medium hover:border-[var(--theme-primary)] dark:border-slate-800">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MaintenancePage: React.FC = () => {
  const msg = useAppStore((s) => s.bootstrap?.site?.maintenance_message_fa);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
      <Wrench className="h-12 w-12 text-amber-400" />
      <h1 className="mt-4 text-2xl font-extrabold">حالت بروزرسانی فنی سامانه</h1>
      <p className="mt-2 max-w-md text-sm text-slate-300">{msg}</p>
      <Link to="/login" className="mt-6 rounded-lg bg-[var(--theme-primary)] px-5 py-2 text-xs font-semibold text-white">
        ورود مدیران سیستم
      </Link>
    </div>
  );
};

export const ErrorPage: React.FC<{ code: 403 | 404 | 500 }> = ({ code }) => {
  const map = {
    403: { title: 'عدم دسترسی مجاز (403)', desc: 'شما مجوز لازم برای مشاهده این بخش را ندارید.' },
    404: { title: 'صفحه مورد نظر یافت نشد (404)', desc: 'نشانی واردشده وجود ندارد یا منتقل شده است.' },
    500: { title: 'خطای داخلی سرور (500)', desc: 'در پردازش درخواست خطایی رخ داد. لطفاً مجدداً تلاش کنید.' },
  }[code];

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="text-6xl font-extrabold text-[var(--theme-primary)] tabular-nums">{code}</div>
      <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{map.title}</h1>
      <p className="mt-2 text-sm text-slate-500">{map.desc}</p>
      <Link to="/" className="mt-6 rounded-lg bg-[var(--theme-primary)] px-5 py-2.5 text-xs font-semibold text-white">
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
};
