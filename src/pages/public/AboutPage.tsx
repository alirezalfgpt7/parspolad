import React, { useEffect, useState } from 'react';
import { Download, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { PageContent } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';

export const AboutPage: React.FC = () => {
  const language = useAppStore((s) => s.language);
  const [page, setPage] = useState<PageContent | null>(null);

  useEffect(() => {
    apiRequest<{ data: PageContent }>('/pages/about').then((r) => setPage(r.data)).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoHead title={language === 'fa' ? 'درباره ما' : 'About Us'} />
      <Breadcrumb items={[{ label: language === 'fa' ? 'درباره شرکت' : 'About Us' }]} />

      <div className="grid items-stretch gap-8 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {page ? (language === 'fa' ? page.title_fa : page.title_en) : 'شرکت پارس پولاد آقایی'}
          </h1>
          <p className="text-base font-medium text-[var(--theme-primary)]">
            {page ? (language === 'fa' ? page.subtitle_fa : page.subtitle_en) : ''}
          </p>
          <div
            className="prose max-w-none text-sm leading-8 text-slate-700 dark:prose-invert dark:text-slate-300"
            dangerouslySetInnerHTML={{
              __html: page ? (language === 'fa' ? page.content_fa : page.content_en) : '',
            }}
          />

          <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
            <a
              href="/storage/documents/machinery-list.pdf"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold hover:border-[var(--theme-primary)] dark:border-slate-800 dark:bg-slate-900"
            >
              <span>فهرست ماشین‌آلات CNC و تولیدی کارخانه</span>
              <Download className="h-4 w-4 text-[var(--theme-primary)]" />
            </a>
            <a
              href="/storage/documents/qc-equipment-list.pdf"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold hover:border-[var(--theme-primary)] dark:border-slate-800 dark:bg-slate-900"
            >
              <span>فهرست تجهیزات آزمایشگاه و کنترل کیفیت</span>
              <Download className="h-4 w-4 text-[var(--theme-primary)]" />
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 lg:col-span-5 dark:border-slate-800">
          <ZeroBrokenImage
            src="/src/assets/images/factory_ahvaz_exterior_1794834721582.jpg"
            alt="کارخانه پارس پولاد آقایی اهواز"
            className="h-full min-h-[320px] w-full object-cover"
          />
        </div>
      </div>

      {/* Vision & HSE Policy */}
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <ShieldCheck className="h-6 w-6 text-[var(--theme-primary)]" />
          <h3 className="mt-3 text-base font-bold">چشم‌انداز و اهداف آرمانی</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            برترین برند ملی در ارائه خدمات و تجهیزات درون‌چاهی و سرچاهی با نگاه بنگاه‌داری اقتصادی و تبدیل‌شدن به صادرکننده برجسته خدمات مهندسی در سطح منطقه.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          <h3 className="mt-3 text-base font-bold">خط‌مشی کیفیت و HSE</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            استقرار کامل نظام مدیریت ایمنی، بهداشت و محیط‌زیست مطابق استانداردهای ISO 14001:2015، ISO 45001:2018 و ISO 29001:2020 با هدف حذف حوادث شغلی.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <ShieldCheck className="h-6 w-6 text-amber-600" />
          <h3 className="mt-3 text-base font-bold">دستاوردهای دانش‌بنیان</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            ساخت بیش از ۱۴۰ قلم قطعه توربین و کمپرسورهای Elliott، Ruston، Rolls-Royce و Sulzer برای نخستین بار در خاورمیانه و تحویل بیش از ۲۰۰ دستگاه به وزارت نفت.
          </p>
        </div>
      </div>
    </div>
  );
};
