import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass, Factory, PlayCircle, ShieldCheck, Wrench } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Article, Project } from '../../types/index.ts';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { StatCounter } from '../../components/ui/StatCounter.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';
import { sanitizeHtml } from '../../utils/sanitizeHtml.ts';
import { DEFAULT_PAGES_CONFIG } from '../../utils/brandingDefaults.ts';
import { useCmsPage } from '../../hooks/useCmsPage.ts';
import {
  CssSlideshowEffect,
  EffectAction,
  EffectImage,
  InfiniteBrandSlider,
  ParticleTextEffect,
  Reveal,
} from '../../components/effects/index.ts';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.ts';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const { bootstrap, previewPagesConfig, language } = useAppStore();
  const shouldReduceMotion = usePrefersReducedMotion();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const { page: spotlight } = useCmsPage('home-spotlight');

  useEffect(() => {
    apiRequest<{ data: Project[] }>('/projects?per_page=6')
      .then((res) => {
        if (!Array.isArray(res.data)) {
          throw new TypeError('The projects API response must include a data array.');
        }
        setFeaturedProjects(res.data);
      })
      .catch((error: unknown) => console.error('Could not load featured projects:', error));
    apiRequest<{ data: Article[] }>('/articles?per_page=3')
      .then((res) => {
        if (!Array.isArray(res.data)) {
          throw new TypeError('The articles API response must include a data array.');
        }
        setArticles(res.data);
      })
      .catch((error: unknown) => console.error('Could not load home page articles:', error));
  }, []);

  const kpis = bootstrap?.kpis || [];
  const services = bootstrap?.services || [];
  const capabilityStages = [
    {
      slug: 'design-engineering',
      label_fa: 'طراحی و مهندسی',
      label_en: 'Design & Engineering',
      icon: <Compass className="h-5 w-5" />,
    },
    {
      slug: 'precision-manufacturing',
      label_fa: 'ساخت دقیق',
      label_en: 'Precision Manufacturing',
      icon: <Factory className="h-5 w-5" />,
    },
    {
      slug: 'qc-hydrostatic-testing',
      label_fa: 'آزمون و تضمین کیفیت',
      label_en: 'Testing & Quality',
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      slug: 'field-installation',
      label_fa: 'نصب و پشتیبانی',
      label_en: 'Field Installation',
      icon: <Wrench className="h-5 w-5" />,
    },
  ];
  const capabilityServices = [...services]
    .sort((a, b) => {
      const stageRank = (slug: string, sortOrder: number) => {
        const index = capabilityStages.findIndex((stage) => stage.slug === slug);
        return index === -1 ? capabilityStages.length + sortOrder : index;
      };
      return stageRank(a.slug, a.sort_order) - stageRank(b.slug, b.sort_order);
    })
    .slice(0, 4);
  const partners = bootstrap?.partners || [];
  const banner = bootstrap?.banners?.find((b) => b.placement === 'landing_mid');
  const ArrowIcon = language === 'fa' ? ArrowLeft : ArrowRight;
  const homeText = (key: string): string => {
    const value = spotlight?.metadata?.[`${key}_${language}`];
    return typeof value === 'string' ? value : '';
  };

  const spotlightOverride = {
    ...DEFAULT_PAGES_CONFIG.home_spotlight,
    ...(bootstrap?.pages_config?.home_spotlight || {}),
    ...(previewPagesConfig?.home_spotlight || {}),
  };
  const spotlightBadge =
    (language === 'fa' ? spotlightOverride.badge_fa : spotlightOverride.badge_en) ||
    (spotlight ? (language === 'fa' ? spotlight.subtitle_fa : spotlight.subtitle_en) : '');
  const spotlightTitle =
    (language === 'fa' ? spotlightOverride.title_fa : spotlightOverride.title_en) ||
    (spotlight ? (language === 'fa' ? spotlight.title_fa : spotlight.title_en) : '');
  const spotlightSubtitle =
    language === 'fa' ? spotlightOverride.subtitle_fa : spotlightOverride.subtitle_en;
  const spotlightImages = spotlight
    ? [spotlight.metadata?.image_url, spotlight.metadata?.secondary_image_url].filter(
        (image): image is string => typeof image === 'string' && image.length > 0,
      )
    : [];
  const companyTitle =
    (language === 'fa' ? bootstrap?.company?.name_fa : bootstrap?.company?.name_en) ||
    (language === 'fa' ? 'پارس پولاد آقایی' : 'PARS POOLAD AGHAEE');

  return (
    <div>
      <SeoHead
        title={(language === 'fa' ? bootstrap?.seo?.site_title : bootstrap?.seo?.site_title_en)
          || bootstrap?.seo?.site_title
          || ''}
        language={language}
      />

      {/* KPI Counter Strip */}
      <section className="border-b border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {kpis.map((k, index) => (
            <Reveal key={k.id} delay={shouldReduceMotion ? 0 : index * 0.06}>
              <StatCounter
                target={k.value}
                suffix={language === 'fa' ? k.suffix_fa : k.suffix_en}
                label={language === 'fa' ? k.label_fa : k.label_en}
                lang={language}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Full-cycle wellhead engineering and manufacturing route */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-(--theme-primary)">{homeText('capabilities_eyebrow')}</p>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white" style={{ textWrap: 'balance' }}>
              {homeText('capabilities_title')}
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--theme-link) hover:underline whitespace-nowrap"
          >
            <span>{homeText('services_all')}</span>
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="home-capability-panel">
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
            <svg viewBox="0 0 180 480" className="absolute -end-2 top-1/2 h-[110%] w-36 -translate-y-1/2 text-cyan-200/50" fill="none">
              <g stroke="currentColor" strokeWidth="2">
                <path d="M90 10v460M54 82h72M42 96h96M58 108h64M66 108v48h48v-48M74 156v64h32v-64M45 220h90M53 236h74M78 236v58h24v-58M58 294h64M50 308h80M84 308v92M96 308v92M62 400h56M54 414h72M70 428h44" />
                <path d="M54 82V52h72v30M42 96V76h96v20M45 220v-26h36v26M99 220v-26h36v26M58 294v-22h-22v-40M122 294v-22h22v-40" />
                <circle cx="34" cy="214" r="13" />
                <circle cx="146" cy="214" r="13" />
                <circle cx="90" cy="40" r="10" />
                <rect x="64" y="448" width="52" height="16" rx="3" />
              </g>
            </svg>
          </div>
          <div className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-cyan-200/80" dir="ltr">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              WELLHEAD ENGINEERING FLOW
            </div>
            <div className="flex flex-wrap gap-2 text-[9px] font-semibold tracking-wider text-slate-300/80" dir="ltr">
              <span className="rounded border border-white/10 px-2 py-1">DESIGN</span>
              <span className="rounded border border-white/10 px-2 py-1">BUILD</span>
              <span className="rounded border border-white/10 px-2 py-1">TEST</span>
              <span className="rounded border border-white/10 px-2 py-1">DEPLOY</span>
            </div>
          </div>

          <ol
            dir={language === 'fa' ? 'rtl' : 'ltr'}
            aria-label={language === 'fa' ? 'مراحل طراحی، ساخت و نصب تجهیزات' : 'Equipment design, manufacturing and installation stages'}
            className="home-capability-flow relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {capabilityServices.map((svc, index) => {
              const stageIndex = capabilityStages.findIndex((stage) => stage.slug === svc.slug);
              const stage = capabilityStages[stageIndex === -1 ? index : stageIndex];

              return (
                <li key={svc.id} className="home-capability-station relative min-w-0">
                  <span className="home-capability-node grid place-items-center rounded-full border border-cyan-200/50 bg-slate-950 text-cyan-100 shadow-[0_0_24px_rgb(34_211_238_/_18%)]">
                    {stage?.icon || <Factory className="h-5 w-5" />}
                  </span>
                  <Reveal delay={shouldReduceMotion ? 0 : index * 0.06} className="h-full">
                    <article className="home-capability-card flex h-full flex-col rounded-2xl border border-white/10 bg-slate-900/75 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200/40 hover:bg-slate-900">
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <span className="rounded-md bg-amber-300/10 px-2 py-1 text-[10px] font-bold text-amber-200">
                          {language === 'fa' ? stage?.label_fa || `مرحله ${index + 1}` : stage?.label_en || `Stage ${index + 1}`}
                        </span>
                        <span className="font-mono text-[11px] font-bold tracking-widest text-cyan-100/60">
                          {String(index + 1).padStart(2, '0')} / {String(capabilityServices.length).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold leading-6 text-white">
                        {language === 'fa' ? svc.title_fa : svc.title_en}
                      </h3>
                      <p className="mt-2 line-clamp-3 flex-1 text-xs leading-6 text-slate-300">
                        {language === 'fa' ? svc.summary_fa : svc.summary_en}
                      </p>
                      <Link
                        to="/services"
                        className="mt-4 inline-flex items-center gap-1.5 border-t border-white/10 pt-3 text-[11px] font-semibold text-cyan-100 transition-colors hover:text-amber-200"
                      >
                        <span>{homeText('service_details')}</span>
                        <ArrowIcon className="h-3.5 w-3.5" />
                      </Link>
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {spotlight && (
        <section className="border-y border-slate-200 bg-slate-900 py-16 text-white dark:border-slate-800">
          <div className="mx-auto grid max-w-7xl items-stretch gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:col-span-6">
              <div>
                <div className="flex items-center gap-3.5">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-slate-950/70 p-1">
                    <BrandLogo
                      placement="about"
                      overrideUrl={spotlightOverride.logo_url}
                      alt={companyTitle}
                      className="h-full w-full"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-400">{spotlightBadge}</p>
                    <h2 className="mt-1 text-2xl font-extrabold leading-snug sm:text-3xl" style={{ textWrap: 'balance' }}>
                      {spotlightTitle}
                    </h2>
                  </div>
                </div>
                {spotlightSubtitle && (
                  <p className="mt-3 text-xs leading-relaxed text-amber-200/90">{spotlightSubtitle}</p>
                )}
                <div
                  className="prose prose-invert mt-4 max-w-none text-sm leading-relaxed text-slate-300"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(language === 'fa' ? spotlight.content_fa : spotlight.content_en) }}
                />
                {/* Effect 079: Interactive Particle Text Wordmark */}
                <div
                  className="mt-4 overflow-hidden rounded-xl border border-amber-400/20 px-4 py-2"
                  style={{ backgroundColor: '#020617', borderColor: 'rgb(251 191 36 / 0.2)' }}
                >
                  <ParticleTextEffect
                    text={language === 'en' ? companyTitle : 'PARS POOLAD'}
                    color="#fde68a"
                    height={76}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {typeof spotlight.metadata?.primary_link === 'string' && (
                  <EffectAction
                    as={Link}
                    to={spotlight.metadata.primary_link}
                    className="rounded-lg bg-(--theme-primary) px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
                  >
                    {String(spotlight.metadata[language === 'fa' ? 'primary_label_fa' : 'primary_label_en'] || '')}
                  </EffectAction>
                )}
                {typeof spotlight.metadata?.secondary_link === 'string' && (
                  <Link to={spotlight.metadata.secondary_link} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 whitespace-nowrap">
                    <PlayCircle className="h-4 w-4" />
                    <span>{String(spotlight.metadata[language === 'fa' ? 'secondary_label_fa' : 'secondary_label_en'] || '')}</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-6">
              {spotlightImages.length > 0 && (
                <div
                  className="relative min-h-64 flex-1 overflow-hidden rounded-2xl border border-white/10"
                  style={{ backgroundColor: '#020617' }}
                >
                  <CssSlideshowEffect images={spotlightImages} intervalPerSlideSeconds={5} />
                </div>
              )}
              {spotlightImages.length > 1 && (
                <div className="grid grid-cols-2 gap-3">
                  {spotlightImages.map((image) => (
                    <div key={image} className="h-24 overflow-hidden rounded-xl border border-white/10">
                      <EffectImage src={image} alt={spotlightTitle} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Projects */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-(--theme-primary)">{homeText('projects_eyebrow')}</p>
            <h2 className="mt-1.5 text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white">
              {homeText('projects_title')}
            </h2>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--theme-link) hover:underline whitespace-nowrap"
          >
            <span>{homeText('projects_all')}</span>
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.slice(0, 6).map((p, index) => (
            <Reveal key={p.id} delay={shouldReduceMotion ? 0 : index * 0.045} className="h-full">
              <Link
                to={`/projects/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <EffectImage
                    src={p.cover_image}
                    alt={language === 'fa' ? p.title_fa : p.title_en}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>{p.category?.name_fa}</span>
                      <span aria-hidden="true">·</span>
                      <span>{p.year}</span>
                      <span aria-hidden="true">·</span>
                      <span>{p.status === 'completed' ? homeText('project_completed') : homeText('project_in_progress')}</span>
                    </div>
                    <h3 className="mt-2 text-base font-bold leading-snug text-slate-900 group-hover:text-(--theme-primary) dark:text-white">
                      {language === 'fa' ? p.title_fa : p.title_en}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {language === 'fa' ? p.summary_fa : p.summary_en}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                    <span className="truncate">{language === 'fa' ? p.client_name_fa : p.client_name_en}</span>
                    <span className="font-mono shrink-0">{p.contract_number}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Effect 067: Infinite Brand Partners Strip */}
      {partners.length > 0 && (
        <Reveal>
          <section className="overflow-hidden border-y border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-8 max-w-7xl px-4 text-center sm:px-6">
              <p className="text-xs font-semibold text-(--theme-primary)">{homeText('partners_eyebrow')}</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                {homeText('partners_title')}
              </h2>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <InfiniteBrandSlider
                items={partners.map((partner) => ({
                  id: partner.id,
                  name: language === 'fa' ? partner.name_fa : partner.name_en,
                  logoUrl: partner.logo_url,
                  sector: partner.sector_fa,
                }))}
              />
            </div>
          </section>
        </Reveal>
      )}

      {/* Latest News & Technical Articles */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold text-(--theme-primary)">{homeText('news_eyebrow')}</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
              {homeText('news_title')}
            </h2>
          </div>
          <Link to="/news" className="text-sm font-semibold text-(--theme-link) hover:underline">
            {homeText('articles_all')}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {articles.map((art, index) => (
            <Reveal key={art.id} delay={shouldReduceMotion ? 0 : index * 0.055} className="h-full">
              <Link
                to={`/news/${art.slug}`}
                className="group relative block aspect-[4/3] h-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-(--theme-primary) hover:shadow-xl hover:shadow-slate-900/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--theme-primary) dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/30"
              >
                <ZeroBrokenImage
                  src={art.cover_image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
                />
                <div className="absolute inset-0 flex translate-y-0 flex-col justify-end bg-slate-950/60 p-5 text-white backdrop-blur-sm transition-transform duration-500 ease-out md:translate-y-full md:group-hover:translate-y-0 md:group-focus-visible:translate-y-0 motion-reduce:transition-none">
                  <div className="mb-auto flex items-center gap-2 text-xs text-white/80 tabular-nums">
                    <span>{language === 'fa' ? art.category_fa : art.category_en}</span>
                    <span aria-hidden="true">·</span>
                    <span>{art.published_at}</span>
                  </div>
                  <div>
                    <h3 className="line-clamp-2 text-lg font-bold leading-7">
                      {language === 'fa' ? art.title_fa : art.title_en}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/80">
                      {language === 'fa' ? art.excerpt_fa : art.excerpt_en}
                    </p>
                    <span
                      className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-lg"
                      style={{ backgroundColor: 'var(--theme-btn-bg)', color: 'var(--theme-btn-text)' }}
                    >
                      {language === 'fa' ? 'خواندن مقاله' : 'Read article'}
                      <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Mid/Bottom Conversion CTA Banner */}
      {banner && (
        <section className="mx-auto mb-16 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-12 text-white sm:px-12">
            <ZeroBrokenImage
              src={banner.image_url}
              alt={banner.title_fa}
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
            <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-extrabold sm:text-3xl" style={{ textWrap: 'balance' }}>
                  {language === 'fa' ? banner.title_fa : banner.title_en}
                </h2>
                <p className="mt-2.5 text-sm text-slate-200">
                  {language === 'fa' ? banner.subtitle_fa : banner.subtitle_en}
                </p>
              </div>
              <Link
                to={banner.cta_link}
                style={{ backgroundColor: 'var(--theme-btn-bg)', color: 'var(--theme-btn-text)' }}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-lg transition-transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
              >
                <span>{language === 'fa' ? banner.cta_text_fa : banner.cta_text_en}</span>
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
