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

interface MachineryAssetRecord {
  id: number;
  name_fa: string | null;
  name_en: string | null;
  asset_code: string | null;
  model: string | null;
  year: string | null;
  location_fa: string | null;
  location_en: string | null;
  manufacturer_fa: string | null;
  manufacturer_en: string | null;
  serial_number: string | null;
  notes_fa: string | null;
  notes_en: string | null;
}

export const AboutPage: React.FC = () => {
  const language = useAppStore((s) => s.language);
  const [page, setPage] = useState<PageContent | null>(null);
  const [error, setError] = useState('');
  const [machinery, setMachinery] = useState<MachineryAssetRecord[]>([]);
  const [machineryError, setMachineryError] = useState('');
  const [machineryLoading, setMachineryLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ data: PageContent }>('/pages/about')
      .then((r) => setPage(r.data))
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'دریافت صفحه ناموفق بود.'));
  }, []);

  useEffect(() => {
    let active = true;
    apiRequest<{ data: MachineryAssetRecord[] }>('/machinery')
      .then(({ data }) => {
        if (active) setMachinery(data);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setMachineryError(requestError instanceof Error ? requestError.message : 'دریافت فهرست ماشین‌آلات ناموفق بود.');
        }
      })
      .finally(() => {
        if (active) setMachineryLoading(false);
      });

    return () => {
      active = false;
    };
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
          <div className="relative overflow-hidden rounded-3xl border border-(--theme-border) bg-slate-900 text-white">
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
                className="prose max-w-none text-sm leading-8 text-(--theme-text-muted) dark:prose-invert"
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
                      className="flex items-center justify-between rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-4 text-sm font-semibold text-(--theme-text) shadow-(--theme-card-shadow) transition hover:border-(--theme-card-border-hover) hover:shadow-(--theme-card-shadow-hover)"
                    >
                      <span>{download.label}</span>
                      <Download className="h-4 w-4 text-(--theme-primary-ink)" />
                    </EffectAction>
                  ))}
                </div>
              )}
            </div>
            {imageUrl && (
              <div className="overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-surface-muted) p-3 shadow-(--theme-card-shadow) lg:col-span-5">
                <HueFilterMedia
                  mode="hue-circle"
                  src={imageUrl}
                  alt={page.title_fa}
                  className="mx-auto h-72 w-full rounded-xl object-cover"
                />
              </div>
            )}
          </div>

          <section id="machinery-inventory" className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-(--theme-text)">
                {language === 'fa' ? 'فهرست ماشین‌آلات و تجهیزات تولیدی' : 'Manufacturing Machinery & Equipment'}
              </h2>
              <p className="mt-1 text-sm text-(--theme-text-muted)">
                {language === 'fa'
                  ? 'مشخصات و شماره‌سریال‌ها مطابق فهرست منبع؛ موارد ناموجود در سند با خط تیره نمایش داده می‌شوند.'
                  : 'Details and serial numbers are shown as recorded in the source register; unavailable source values are shown as a dash.'}
              </p>
            </div>
            {machineryError ? (
              <p role="alert" className="text-sm text-red-600">{machineryError}</p>
            ) : machineryLoading ? (
              <p className="text-sm text-(--theme-text-muted)">
                {language === 'fa' ? 'در حال دریافت فهرست ماشین‌آلات...' : 'Loading machinery inventory...'}
              </p>
            ) : machinery.length === 0 ? (
              <p className="text-sm text-(--theme-text-muted)">
                {language === 'fa' ? 'اطلاعاتی برای نمایش ثبت نشده است.' : 'No machinery records are available.'}
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) shadow-(--theme-card-shadow)">
                <table dir={language === 'fa' ? 'rtl' : 'ltr'} className="min-w-[1100px] w-full text-sm">
                  <thead className="bg-(--theme-surface-muted) text-(--theme-text)">
                    <tr>
                      {[
                        language === 'fa' ? 'نام دستگاه' : 'Equipment',
                        language === 'fa' ? 'کد دستگاه' : 'Asset code',
                        language === 'fa' ? 'مدل / مشخصات' : 'Model / specifications',
                        language === 'fa' ? 'سال ساخت/خرید' : 'Built / purchased',
                        language === 'fa' ? 'محل استقرار' : 'Location',
                        language === 'fa' ? 'کشور/کارخانه سازنده' : 'Manufacturer',
                        language === 'fa' ? 'شماره سریال' : 'Serial number',
                        language === 'fa' ? 'یادداشت' : 'Notes',
                      ].map((label) => (
                        <th key={label} scope="col" className="whitespace-nowrap px-4 py-3 text-start font-bold">{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--theme-border)">
                    {machinery.map((asset) => {
                      const value = (text: string | null): string => text?.trim() || '—';
                      return (
                        <tr key={asset.id} className="align-top text-(--theme-text-muted)">
                          <td className="px-4 py-3 font-semibold text-(--theme-text)">{value(language === 'fa' ? asset.name_fa : asset.name_en)}</td>
                          <td className="px-4 py-3 font-mono">{value(asset.asset_code)}</td>
                          <td className="px-4 py-3">{value(asset.model)}</td>
                          <td className="px-4 py-3 tabular-nums">{value(asset.year)}</td>
                          <td className="px-4 py-3">{value(language === 'fa' ? asset.location_fa : asset.location_en)}</td>
                          <td className="px-4 py-3">{value(language === 'fa' ? asset.manufacturer_fa : asset.manufacturer_en)}</td>
                          <td className="px-4 py-3 font-mono">{value(asset.serial_number)}</td>
                          <td className="max-w-sm px-4 py-3">{value(language === 'fa' ? asset.notes_fa : asset.notes_en)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Effect 004: Overlapping Card Reveal Stack */}
          <section className="space-y-4">
            <h2 className="text-xl font-extrabold text-(--theme-text)">
              {language === 'fa' ? 'ارکان مهندسی و تضمین کیفیت' : 'Engineering & QA Pillars'}
            </h2>
            <CardRevealStack items={pillars} />
          </section>
        </div>
      )}
    </div>
  );
};
