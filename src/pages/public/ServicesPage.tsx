import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Compass, Settings, Wrench } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Service } from '../../types/index.ts';
import { CmsPageIntro } from '../../components/common/CmsPageIntro.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';
import { PublicBanner } from '../../components/common/PublicBanner.tsx';
import './ServicesPage.css';
import '../../components/effects/FlipCard.css';

export const ServicesPage: React.FC = () => {
  const { language, addToast, bootstrap } = useAppStore();
  const [services, setServices] = useState<Service[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    apiRequest<{ data: Service[]; meta: { last_page: number } }>(`/services?page=${page}&per_page=3`)
      .then((response) => {
        if (!active) return;
        setServices(response.data);
        setLastPage(response.meta.last_page);
      })
      .catch((error: unknown) => {
        if (active) addToast('error', error instanceof Error ? error.message : 'بارگذاری خدمات ناموفق بود.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, addToast]);

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

      <section className="mb-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-(--theme-text)">
              {language === 'fa' ? 'فرآیند ارائه خدمات' : 'Our Service Process'}
            </h2>
            <p className="mt-1 text-sm text-(--theme-text-muted)">
              {language === 'fa' ? 'از نیازسنجی تا پشتیبانی، همراه پروژه شما هستیم.' : 'From initial assessment to field support, we work alongside your project.'}
            </p>
          </div>
          <span className="rounded-full bg-(--theme-primary)/12 px-3 py-1 text-xs font-semibold text-(--theme-primary-ink)">
            {language === 'fa' ? '۴ گام تخصصی' : '4 steps'}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {workflowCards.map((card) => (
            <article
              key={card.id}
              className="relative overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-4 shadow-(--theme-card-shadow) transition-colors hover:border-(--theme-card-border-hover)"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-(--theme-primary)/12 text-(--theme-primary-ink)">
                  {card.icon}
                </span>
                <span className="font-mono text-xs font-bold tracking-wider text-(--theme-text-muted)">{card.id}</span>
              </div>
              <p className="mt-3 text-[11px] font-semibold text-(--theme-primary-ink)">{card.badge}</p>
              <h3 className="mt-1 text-sm font-bold text-(--theme-text)">{card.title}</h3>
              <p className="mt-2 text-xs leading-6 text-(--theme-text-muted)">{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="services-list" aria-busy={isLoading}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-(--theme-text)">
              {language === 'fa' ? 'خدمات تخصصی' : 'Specialized Services'}
            </h2>
            <p className="mt-1 text-sm text-(--theme-text-muted)">
              {language === 'fa' ? 'راهکارهای مهندسی و اجرایی متناسب با نیاز صنعت.' : 'Engineering and field solutions tailored to your operation.'}
            </p>
          </div>
          {!isLoading && services.length > 0 && (
            <span className="text-xs text-(--theme-text-muted)">
              {language === 'fa' ? `${services.length} خدمت در این صفحه` : `${services.length} services on this page`}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface)">
                <div className="aspect-16/10 animate-pulse bg-(--theme-surface-muted)" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-(--theme-surface-muted)" />
                  <div className="h-3 w-full animate-pulse rounded bg-(--theme-surface-muted)" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-(--theme-surface-muted)" />
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-(--theme-border-strong) bg-(--theme-card-surface) px-6 py-12 text-center">
            <p className="text-sm font-semibold text-(--theme-text-muted)">
              {language === 'fa' ? 'در حال حاضر خدمتی برای نمایش ثبت نشده است.' : 'No services are available right now.'}
            </p>
          </div>
        ) : (
          <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((svc, idx) => (
              <article
                key={svc.id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) shadow-(--theme-card-shadow) transition-shadow duration-300 hover:shadow-(--theme-card-shadow-hover)"
              >
                <div className="flip-card-container group/flip">
                  <div className="flip-card">
                    <div className="flip-card-face flip-card-face--front bg-(--theme-card-surface)">
                      <div className="relative aspect-16/10 overflow-hidden bg-(--theme-surface-muted) p-4">
                        <ZeroBrokenImage
                          src={svc.image_url}
                          alt={language === 'fa' ? svc.title_fa : svc.title_en}
                          className="h-full w-full object-contain transition-transform duration-500 group-hover/flip:scale-105"
                        />
                        <span className="absolute inset-s-4 top-4 rounded-full border border-(--theme-border) bg-(--theme-surface)/92 px-2.5 py-1 font-mono text-[11px] font-bold text-(--theme-primary-ink) shadow-sm backdrop-blur-sm">
                          {String((page - 1) * 3 + idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="px-5 pb-5 pt-4">
                        <h3 className="text-base font-bold leading-7 text-(--theme-text)">
                          {language === 'fa' ? svc.title_fa : svc.title_en}
                        </h3>
                        <p className="service-touch-description mt-2 line-clamp-2 text-xs leading-5 text-(--theme-text-muted)">
                          {language === 'fa' ? svc.summary_fa : svc.summary_en}
                        </p>
                        <p className="sr-only">
                          {language === 'fa' ? `${svc.summary_fa} ${svc.description_fa}` : `${svc.summary_en} ${svc.description_en}`}
                        </p>
                      </div>
                    </div>
                    <div
                      aria-hidden="true"
                      className="flip-card-face flip-card-face--back relative bg-(--theme-surface-muted) p-6"
                    >
                      <span className="absolute inset-e-5 top-3 font-mono text-6xl font-black text-(--theme-primary)/12">
                        {String((page - 1) * 3 + idx + 1).padStart(2, '0')}
                      </span>
                      <div className="relative flex h-full flex-col">
                        <span className="mb-4 h-1 w-12 rounded-full bg-(--theme-primary)" />
                        <h3 className="text-lg font-extrabold leading-8 text-(--theme-text)">
                          {language === 'fa' ? svc.title_fa : svc.title_en}
                        </h3>
                        <p className="mt-3 text-sm font-medium leading-7 text-(--theme-text)">
                          {language === 'fa' ? svc.summary_fa : svc.summary_en}
                        </p>
                        <p className="mt-3 text-xs leading-7 text-(--theme-text-muted)">
                          {language === 'fa' ? svc.description_fa : svc.description_en}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-auto flex flex-col gap-2 px-5 pb-5 pt-3 sm:flex-row">
                  <Link
                    to="/rfq"
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-(--theme-btn-bg) px-3 py-2.5 text-xs font-semibold text-(--theme-btn-text) transition-colors hover:bg-(--theme-btn-hover)"
                  >
                    {language === 'fa' ? 'درخواست مشاوره' : 'Request a Quote'}
                  </Link>
                  <Link
                    to="/products"
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) px-3 py-2.5 text-xs font-semibold text-(--theme-text) transition-colors hover:border-(--theme-primary-ink) hover:text-(--theme-primary-ink)"
                  >
                    {language === 'fa' ? 'تجهیزات مرتبط' : 'Related Equipment'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
        {!isLoading && <Pagination page={page} lastPage={lastPage} onChange={setPage} />}
      </section>
      {bootstrap?.banners?.filter((banner) => banner.placement === 'services_bottom').map((banner) => (
        <PublicBanner key={banner.id} banner={banner} language={language} />
      ))}
    </div>
  );
};
