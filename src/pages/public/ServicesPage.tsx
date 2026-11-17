import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Compass, Settings, Wrench } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Service } from '../../types/index.ts';
import { CmsPageIntro } from '../../components/common/CmsPageIntro.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';
import { CardRevealStack } from '../../components/effects/index.ts';

export const ServicesPage: React.FC = () => {
  const { language, addToast } = useAppStore();
  const [services, setServices] = useState<Service[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    apiRequest<{ data: Service[]; meta: { last_page: number } }>(`/services?page=${page}&per_page=8`)
      .then((response) => {
        setServices(response.data);
        setLastPage(response.meta.last_page);
      })
      .catch((error: unknown) => addToast('error', error instanceof Error ? error.message : 'بارگذاری خدمات ناموفق بود.'));
  }, [page]);

  const workflowCards = [
    {
      id: '01',
      badge: language === 'fa' ? 'گام ۱' : 'Step 1',
      title: language === 'fa' ? 'نیازسنجی و مهندسی معکوس' : 'Field Survey & R&D',
      description: language === 'fa' ? 'بازدید میدانی، اسکن سه‌بعدی قطعات و تدوین نقشه‌های ساخت.' : 'Dimensional scanning, material assay & detailed manufacturing drawings.',
      icon: <Compass className="h-5 w-5" />,
    },
    {
      id: '02',
      badge: language === 'fa' ? 'گام ۲' : 'Step 2',
      title: language === 'fa' ? 'ساخت و ماشین‌کاری CNC' : 'Heavy CNC Fabrication',
      description: language === 'fa' ? 'تولید با تلرانس میکرونی و عملیات حرارتی کنترل‌شده.' : 'Tight-tolerance multi-axis machining and certified heat treatment.',
      icon: <Settings className="h-5 w-5" />,
    },
    {
      id: '03',
      badge: language === 'fa' ? 'گام ۳' : 'Step 3',
      title: language === 'fa' ? 'تست فشار و بازرسی فنی' : 'Witness Hydro Testing',
      description: language === 'fa' ? 'آزمون هیدرواستاتیک و NDT با صدور گواهی‌نامه معتبر.' : 'Full pressure & NDT validation with third-party witness.',
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    {
      id: '04',
      badge: language === 'fa' ? 'گام ۴' : 'Step 4',
      title: language === 'fa' ? 'نصب و خدمات پس از تحویل' : 'Commissioning & Support',
      description: language === 'fa' ? 'پشتیبانی کامل بهره‌برداری در میادین نفت و گاز.' : 'On-site commissioning, maintenance & rapid spare dispatch.',
      icon: <Wrench className="h-5 w-5" />,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <CmsPageIntro slug="services" />

      <div className="mb-10">
        <CardRevealStack items={workflowCards} />
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
                <span className="text-xs font-bold text-(--theme-primary) tabular-nums">
                  {String((page - 1) * 8 + idx + 1).padStart(2, '0')}.
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
                  className="rounded-lg bg-(--theme-primary) px-4 py-2 text-xs font-semibold text-white whitespace-nowrap"
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
      <Pagination page={page} lastPage={lastPage} onChange={setPage} />
    </div>
  );
};
