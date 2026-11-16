import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Service } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';

export const ServicesPage: React.FC = () => {
  const language = useAppStore((s) => s.language);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    apiRequest<{ data: Service[] }>('/services').then((r) => setServices(r.data)).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoHead title={language === 'fa' ? 'خدمات مهندسی و تولیدی' : 'Services'} />
      <Breadcrumb items={[{ label: language === 'fa' ? 'خدمات مهندسی' : 'Services' }]} />

      <div className="mb-10 max-w-3xl">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {language === 'fa' ? 'خدمات طراحی، ساخت، نصب و کنترل کیفیت' : 'Engineering, Manufacturing & Field Services'}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {language === 'fa'
            ? 'ارائه زنجیره کامل مهندسی معکوس، ماشین‌کاری دقیق CNC، آزمون فشار ۱۵۰۰۰ PSI و عملیات سر دکل در میادین نفت و گاز.'
            : 'Complete lifecycle support from CAD/CAE design and CNC machining to 15,000 PSI testing and rig-site installation.'}
        </p>
      </div>

      <div className="space-y-8">
        {services.map((svc, idx) => (
          <div
            key={svc.id}
            className="grid items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-12 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="h-64 md:col-span-5 md:h-auto">
              <ZeroBrokenImage
                src={svc.image_url}
                alt={svc.title_fa}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between p-6 sm:p-8 md:col-span-7">
              <div>
                <span className="text-xs font-bold text-[var(--theme-primary)] tabular-nums">
                  {String(idx + 1).padStart(2, '0')}.
                </span>
                <h2 className="mt-1.5 text-xl font-bold text-slate-900 dark:text-white">
                  {language === 'fa' ? svc.title_fa : svc.title_en}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {language === 'fa' ? svc.summary_fa : svc.summary_en}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {language === 'fa' ? svc.description_fa : svc.description_en}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/rfq"
                  className="rounded-lg bg-[var(--theme-primary)] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap"
                >
                  {language === 'fa' ? 'درخواست مشاوره و استعلام' : 'Request Service Quote'}
                </Link>
                <Link
                  to="/products"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap"
                >
                  {language === 'fa' ? 'مشاهده تجهیزات مرتبط' : 'View Equipment'}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
