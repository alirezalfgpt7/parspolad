import React, { useEffect, useState } from 'react';
import { Award, Cpu, Download, Flame, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { PageContent } from '../../types/index.ts';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.tsx';
import { PagePreloader } from '../../components/common/PagePreloader.tsx';
import { sanitizeHtml } from '../../utils/sanitizeHtml.ts';
import {
  CardRevealStack,
  DecorativeCube,
  EffectAction,
  EffectText,
  HueFilterMedia,
  WaveHeroEffect,
} from '../../components/effects/index.ts';

export const AboutPage: React.FC = () => {
  const language = useAppStore((s) => s.language);
  const [page, setPage] = useState<PageContent | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<{ data: PageContent }>('/pages/about')
      .then((r) => setPage(r.data))
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'دریافت صفحه ناموفق بود.'));
  }, []);

  const metadata = page?.metadata ?? {};
  const imageUrl = typeof metadata.image_url === 'string' ? metadata.image_url : '';
  const downloads = [1, 2].flatMap((index) => {
    const url = metadata[`download_${index}_url`];
    const labelFa = metadata[`download_${index}_label_fa`];
    const labelEn = metadata[`download_${index}_label_en`];
    return typeof url === 'string' && typeof labelFa === 'string' && typeof labelEn === 'string'
      ? [{ url, label: language === 'fa' ? labelFa : labelEn }]
      : [];
  });

  const pillars = [
    {
      id: 'api',
      badge: 'API 6A / 11D1',
      title: language === 'fa' ? 'طراحی مطابق استانداردهای API' : 'API Engineered Design',
      description:
        language === 'fa'
          ? 'محاسبات تنش و مدل‌سازی المان محدود برای تجهیزات فشار بالای سرچاهی تا ۱۵,۰۰۰ PSI.'
          : 'FEA thermal & pressure modeling for high-integrity wellhead equipment up to 15,000 PSI.',
      meta: language === 'fa' ? 'گواهی‌نامه معتبر مهندسی' : 'Certified Engineering',
      icon: <Award className="h-5 w-5" />,
    },
    {
      id: 'metallurgy',
      badge: 'CNC / 5-Axis',
      title: language === 'fa' ? 'ماشین‌کاری دقیق و متالورژی' : 'Precision Machining',
      description:
        language === 'fa'
          ? 'تراشکاری سنگین فولادهای آلیاژی AISI 4140 و اینکونل مقاوم در برابر گاز ترش H2S.'
          : 'Heavy CNC machining of AISI 4140 & Inconel alloys resistant to sour gas service.',
      meta: language === 'fa' ? 'کنترل ابعادی لیزری' : 'Laser Metrology',
      icon: <Cpu className="h-5 w-5" />,
    },
    {
      id: 'testing',
      badge: 'NDT & Hydro',
      title: language === 'fa' ? 'آزمون هیدرواستاتیک و غیرمخرب' : 'Hydrostatic & NDT Labs',
      description:
        language === 'fa'
          ? 'تست فشار هیدرواستاتیک، التراسونیک و ذرات مغناطیسی در حضور بازرس کارفرما.'
          : 'Full witness hydrostatic pressure, UT, MT & PT testing prior to dispatch.',
      meta: language === 'fa' ? 'انطباق کامل کیفیت' : 'Zero-Defect QA',
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      id: 'field',
      badge: 'EPC Support',
      title: language === 'fa' ? 'پشتیبانی میدانی میادین نفتی' : 'Field & Rig Deployment',
      description:
        language === 'fa'
          ? 'نصب، راه‌اندازی، تعمیرات اساسی پکرها و شیرآلات سرچاهی در میادین خشکی و دریایی.'
          : 'Turnkey installation, overhauling & emergency support across onshore & offshore fields.',
      meta: language === 'fa' ? 'اهواز و عسلویه' : 'Ahvaz & Asaluyeh',
      icon: <Flame className="h-5 w-5" />,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoHead
        title={page ? (language === 'fa' ? page.meta_title : page.meta_title_en || page.title_en) : ''}
        description={page ? (language === 'fa' ? page.meta_description : page.meta_description_en || page.meta_description) : ''}
        image={page?.meta_image || imageUrl}
        canonicalUrl={page?.canonical_url || undefined}
        language={language}
      />
      <Breadcrumb items={[{ label: language === 'fa' ? 'درباره شرکت' : 'About Us' }]} />

      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : !page ? (
        <PagePreloader label="در حال دریافت محتوا..." />
      ) : (
        <div className="space-y-12">
          {/* Top Brand Spotlight Band with Animated 3D Emblem & Effect 002 Wave Horizon */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 text-white dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-6 px-6 pt-8 pb-16 sm:px-10">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-slate-950 p-1 shadow-xl">
                  <BrandLogo placement="about" alt={page.title_fa} className="h-full w-full" />
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold text-amber-400">
                    {language === 'fa' ? 'درباره ما' : 'About Us'}
                  </p>
                  <h1 className="text-2xl font-extrabold sm:text-3xl">
                    <EffectText inverse>{language === 'fa' ? page.title_fa : page.title_en}</EffectText>
                  </h1>
                  <p className="mt-1.5 text-sm text-slate-300">
                    {language === 'fa' ? page.subtitle_fa : page.subtitle_en}
                  </p>
                </div>
              </div>
              <DecorativeCube
                size="lg"
                className="h-20 w-20 shrink-0 rounded-2xl border border-white/15 bg-white/5"
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0">
              <WaveHeroEffect bottomFill="var(--theme-bg)" tintRgb="255 255 255" heightClassName="!h-12" />
            </div>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-7">
              <div
                className="prose max-w-none text-sm leading-8 text-slate-700 dark:prose-invert dark:text-slate-300"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(language === 'fa' ? page.content_fa : page.content_en) }}
              />
              {downloads.length > 0 && (
                <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
                  {downloads.map((download) => (
                    <EffectAction
                      as="a"
                      key={download.url}
                      href={download.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900"
                    >
                      <span>{download.label}</span>
                      <Download className="h-4 w-4 text-(--theme-primary)" />
                    </EffectAction>
                  ))}
                </div>
              )}
            </div>
            {imageUrl && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/5 p-3 lg:col-span-5 dark:border-slate-800">
                <HueFilterMedia
                  mode="hue-circle"
                  src={imageUrl}
                  alt={page.title_fa}
                  className="mx-auto h-72 w-full rounded-xl object-cover"
                />
              </div>
            )}
          </div>

          {/* Effect 004: Overlapping Card Reveal Stack */}
          <section className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {language === 'fa' ? 'ارکان مهندسی و تضمین کیفیت' : 'Engineering & QA Pillars'}
            </h2>
            <CardRevealStack items={pillars} />
          </section>
        </div>
      )}
    </div>
  );
};
