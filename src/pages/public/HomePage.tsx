import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, PlayCircle } from 'lucide-react';
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

      {/* Core Capabilities Asymmetric Bento Section */}
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {services.map((svc, idx) => {
            const isWide = idx === 0 || idx === 3;
            return (
              <Reveal
                key={svc.id}
                delay={idx * 0.06}
                className={`group overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900 ${
                  isWide ? 'md:col-span-2' : 'md:col-span-1'
                }`}
              >
                <div className={`grid h-full ${isWide ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                  <div className="flex flex-col justify-between p-6">
                    <div>
                      <span className="text-xs font-bold text-slate-400 tabular-nums">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                        {language === 'fa' ? svc.title_fa : svc.title_en}
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {language === 'fa' ? svc.summary_fa : svc.summary_en}
                      </p>
                    </div>
                    <Link
                      to="/services"
                      className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-(--theme-primary) hover:underline"
                    >
                      <span>{homeText('service_details')}</span>
                      <ArrowIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="h-52 overflow-hidden bg-slate-100 sm:h-full dark:bg-slate-800">
                    <EffectImage
                      src={svc.image_url}
                      alt={language === 'fa' ? svc.title_fa : svc.title_en}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </Reveal>
            );
          })}
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
                <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-1">
                  <ParticleTextEffect
                    text={language === 'en' ? companyTitle : 'PARS POOLAD'}
                    color="#fbbf24"
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
                <div className="relative min-h-64 flex-1 overflow-hidden rounded-2xl border border-white/10">
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
                className="group h-full overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <EffectImage
                    src={art.cover_image}
                    alt={art.title_fa}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
                    <span>{language === 'fa' ? art.category_fa : art.category_en}</span>
                    <span>·</span>
                    <span>{art.published_at}</span>
                  </div>
                  <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-(--theme-primary) dark:text-white">
                    {language === 'fa' ? art.title_fa : art.title_en}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                    {language === 'fa' ? art.excerpt_fa : art.excerpt_en}
                  </p>
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
