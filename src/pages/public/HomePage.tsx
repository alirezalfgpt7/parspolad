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
  const banners = bootstrap?.banners?.filter((b) => b.placement === 'landing_mid') || [];
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
  const performanceText = {
    eyebrow: language === 'fa' ? spotlightOverride.performance_eyebrow_fa : spotlightOverride.performance_eyebrow_en,
    title: language === 'fa' ? spotlightOverride.performance_title_fa : spotlightOverride.performance_title_en,
    titleAccent: language === 'fa' ? spotlightOverride.performance_title_accent_fa : spotlightOverride.performance_title_accent_en,
    subtitle: language === 'fa' ? spotlightOverride.performance_subtitle_fa : spotlightOverride.performance_subtitle_en,
    footer: language === 'fa' ? spotlightOverride.performance_footer_fa : spotlightOverride.performance_footer_en,
  };
  const performanceBackgroundUrl = spotlightOverride.performance_background_url || '';
  const configuredBackgroundColor = spotlightOverride.performance_background_color || '';
  const performanceBackgroundColor = /^#[\da-f]{6}$/i.test(configuredBackgroundColor)
    ? configuredBackgroundColor
    : '';
  const configuredOverlayColor = spotlightOverride.performance_overlay_color || '#080d17';
  const performanceOverlayColor = /^#[\da-f]{6}$/i.test(configuredOverlayColor)
    ? configuredOverlayColor
    : '#080d17';
  const configuredOverlayOpacity = Number(spotlightOverride.performance_overlay_opacity);
  const performanceOverlayOpacity = Number.isFinite(configuredOverlayOpacity)
    ? Math.min(100, Math.max(0, configuredOverlayOpacity)) / 100
    : 0;
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
        (image): image is string => typeof image === 'string' && image.trim().length > 0,
      )
    : [];
  const spotlightPrimaryLink =
    typeof spotlight?.metadata?.primary_link === 'string' ? spotlight.metadata.primary_link.trim() : '';
  const spotlightPrimaryLabel = String(
    spotlight?.metadata?.[language === 'fa' ? 'primary_label_fa' : 'primary_label_en'] || '',
  ).trim();
  const spotlightSecondaryLink =
    typeof spotlight?.metadata?.secondary_link === 'string' ? spotlight.metadata.secondary_link.trim() : '';
  const spotlightSecondaryLabel = String(
    spotlight?.metadata?.[language === 'fa' ? 'secondary_label_fa' : 'secondary_label_en'] || '',
  ).trim();
  const getHexColor = (value: string | undefined, fallback: string): string =>
    value && /^#[\da-f]{6}$/i.test(value) ? value : fallback;
  const spotlightBackgroundColor = getHexColor(spotlightOverride.section_background_color, '#0f172a');
  const spotlightTextColor = getHexColor(spotlightOverride.section_text_color, '#ffffff');
  const spotlightAccentColor = getHexColor(spotlightOverride.section_accent_color, '#fbbf24');
  const spotlightBackgroundUrl =
    typeof spotlight?.metadata?.section_background_url === 'string'
      ? spotlight.metadata.section_background_url.trim()
      : '';
  const configuredBackgroundOpacity = Number(spotlight?.metadata?.section_background_overlay_opacity);
  const spotlightBackgroundOpacity = Number.isFinite(configuredBackgroundOpacity)
    ? Math.min(100, Math.max(0, configuredBackgroundOpacity)) / 100
    : 0.35;
  const companyTitle =
    (language === 'fa' ? bootstrap?.company?.name_fa : bootstrap?.company?.name_en) ||
    (language === 'fa' ? 'پارس پولاد آقایی' : 'PARS POOLAD AGHAEE');

  return (
    <div className="home-page-content">
      <SeoHead
        title={(language === 'fa' ? bootstrap?.seo?.site_title : bootstrap?.seo?.site_title_en)
          || bootstrap?.seo?.site_title
          || ''}
        language={language}
      />

      {/* Industrial performance metrics */}
      <section
        className={`industrial-performance home-page-snap-section${performanceBackgroundColor ? ' industrial-performance--custom-background' : ''}`}
        dir={language === 'fa' ? 'rtl' : 'ltr'}
        style={{
          '--industrial-overlay-color': performanceOverlayColor,
          '--industrial-overlay-opacity': performanceOverlayOpacity,
          '--industrial-background-color': performanceBackgroundColor || undefined,
        } as React.CSSProperties}
      >
        {performanceBackgroundUrl && (
          <img
            src={performanceBackgroundUrl}
            alt=""
            aria-hidden="true"
            className="industrial-performance-background-image"
            onError={(event) => {
              console.error('Could not load the industrial KPI background image:', event.currentTarget.src);
              event.currentTarget.hidden = true;
            }}
          />
        )}
        <div className="industrial-performance-overlay" aria-hidden="true" />
        <div className="industrial-performance-scene" aria-hidden="true">
          <svg
            viewBox="0 0 1440 520"
            preserveAspectRatio="xMidYMid slice"
            className="industrial-scene-svg"
          >
            <defs>
              <linearGradient id="industrialSteel" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#64748b" />
                <stop offset=".5" stopColor="#1e293b" />
                <stop offset="1" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="industrialRed" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#991b1b" />
                <stop offset=".5" stopColor="#ef4444" />
                <stop offset="1" stopColor="#991b1b" />
              </linearGradient>
            </defs>

            <g fill="none" stroke="url(#industrialSteel)" strokeWidth="3" opacity=".55">
              <path d="M90 450 L190 80 L290 450 Z" />
              <path d="M115 350 H265 M130 290 H250 M145 230 H235 M160 170 H220" />
              <path d="M90 450 L265 350 L115 350 L250 290 L130 290 L235 230 L145 230 L220 170 L160 170 L190 80" />
              <path d="M290 450 L115 350 L265 290 L130 230 L235 170 L160 80" />
              <path d="M190 80 V40 M165 40 H215 M175 25 H205" />
            </g>

            <g fill="none" stroke="#64748b" strokeWidth="3" opacity=".5">
              <path d="M400 450 V280 H470 V450 M430 280 V210 H490 V280" />
              <path d="M460 450 V330 H530 V450 M480 330 V260 H510 V330" />
              <path d="M550 450 V200 H610 V450 M570 200 V130 H590 V200" />
              <path d="M650 450 V310 H720 V450 M680 310 V230 H700 V310" />
              <path d="M780 450 V270 H840 V450 M800 270 V180 H820 V270" />
              <path d="M900 450 V300 H980 V450 M930 300 V220 H950 V300" />
              <path d="M1040 450 V250 H1100 V450 M1060 250 V140 H1080 V250" />
              <path d="M1180 450 V320 H1260 V450 M1200 320 V250 H1240 V320" />
              <path d="M360 370 H1280 M390 400 H1250 M430 430 H1230" />
            </g>

            <g fill="none" stroke="url(#industrialRed)" strokeWidth="6" opacity=".85">
              <path d="M0 470 H180 Q220 470 220 430 V400 H400 V440 H640 V400 H820 V460 H1040 V420 H1440" />
              <path d="M0 495 H300 V460 H550 V485 H950 V455 H1300 V485 H1440" />
            </g>

            <g stroke="#94a3b8" strokeWidth="4" fill="none" opacity=".6">
              <path d="M1300 450 L1350 150 L1400 450 Z" />
              <path d="M1320 330 H1380 M1330 270 H1370 M1340 210 H1360" />
              <path d="M1300 450 L1380 330 L1320 330 L1370 270 L1330 270 L1360 210" />
            </g>
            <path
              d="M1350 145 C1325 120 1345 90 1365 70 C1360 105 1395 110 1370 145 Z"
              fill="#ef4444"
              opacity=".7"
            />
            <path
              d="M1358 145 C1350 120 1367 108 1368 95 C1382 118 1375 135 1358 145 Z"
              fill="#fbbf24"
            />
            <path
              d="M0 510 Q350 450 650 500 T1440 470"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
              opacity=".65"
            />
          </svg>
        </div>

        <div className="industrial-performance-grid" aria-hidden="true" />
        <div className="industrial-performance-glow" aria-hidden="true" />

        <div className="industrial-performance-header">
          <div className="industrial-performance-heading">
            <span className="industrial-eyebrow">
              <span className="industrial-eyebrow-line" />
              {performanceText.eyebrow}
            </span>
            <h2>
              {performanceText.title}
              {performanceText.titleAccent && <> <span>{performanceText.titleAccent}</span></>}
            </h2>
            <p>{performanceText.subtitle}</p>
          </div>

        </div>

        <div className="industrial-performance-content">
          <div className="industrial-performance-rail" aria-hidden="true">
            <span />
          </div>
          <div className="industrial-performance-stats">
            {kpis.map((k, index) => (
              <Reveal key={k.id} delay={shouldReduceMotion ? 0 : index * 0.12}>
                <StatCounter
                  target={k.value}
                  suffix={language === 'fa' ? k.suffix_fa : k.suffix_en}
                  label={language === 'fa' ? k.label_fa : k.label_en}
                  lang={language}
                  index={index}
                  icon={k.icon}
                  backgroundColor={k.background_color}
                />
              </Reveal>
            ))}
          </div>
        </div>

        <div className="industrial-performance-footer">
          <span className="industrial-footer-status">
            <span className="industrial-footer-dot" />
            {performanceText.footer}
          </span>
          <span className="industrial-footer-coordinates" dir="ltr">
            35° / 51° — ENGINEERING
          </span>
        </div>
      </section>

      {/* Full-cycle wellhead engineering and manufacturing route */}
      <section className="home-page-snap-section mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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

        <div className="home-capability-panel home-engineering-road">
          <div className="home-oilfield-bg" aria-hidden="true">
            <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
              <g fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M100 420 L165 80 L230 420 M120 320 H210 M135 250 H195 M145 180 H185 M155 120 H175" />
                <path d="M100 420 L230 420 M115 350 L215 350 M125 280 L205 280 M140 210 L190 210 M155 140 L175 140" />
                <path d="M100 420 L215 350 L120 320 L195 280 L135 250 L185 210 L145 180 L175 140" />
                <path d="M230 420 L115 350 L210 320 L125 280 L205 250 L140 210 L190 180 L155 140" />
                <path d="M720 420 L770 170 L820 420 M735 330 H805 M745 260 H795 M755 200 H785" />
                <path d="M720 420 L805 330 L735 330 L795 260 L745 260 L785 200" />
                <path d="M820 420 L735 330 L805 260 L745 200" />
                <path d="M30 440 H360 V400 H520 V440 H970 M40 460 H300 V430 H490 V460 H950" />
                <rect x="360" y="380" width="160" height="60" rx="4" />
                <rect x="400" y="350" width="80" height="30" />
                <circle cx="440" cy="350" r="20" />
                <path d="M440 330 V280 M430 280 H450 M440 280 L460 260" />
              </g>
            </svg>
          </div>

          <div className="home-road-header">
            <div className="home-road-status" dir="ltr">
              <span className="home-road-status-dot" />
              WELLHEAD ENGINEERING JOURNEY
            </div>
            <div className="home-road-legend" dir="ltr">
              <span>DESIGN</span>
              <span>BUILD</span>
              <span>TEST</span>
              <span>DEPLOY</span>
            </div>
          </div>

          <ol
            dir={language === 'fa' ? 'rtl' : 'ltr'}
            aria-label={language === 'fa' ? 'مسیر کامل طراحی، ساخت، آزمون و نصب تجهیزات' : 'Complete engineering and manufacturing journey'}
            className="home-capability-flow home-roadmap relative grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
          >
            <svg
              className={`home-road-svg ${language === 'en' ? 'home-road-svg-ltr' : ''}`}
              viewBox="0 0 1200 250"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="roadMainGradient" x1="1200" y1="0" x2="0" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="40%" stopColor="#38bdf8" />
                  <stop offset="68%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
                <filter id="roadNeonGlow">
                  <feGaussianBlur stdDeviation="8" />
                </filter>
              </defs>
              <path className="home-road-glow" d="M1120 90 C1030 90 990 150 900 135 S740 45 620 85 S450 155 340 105 S180 40 80 120" stroke="url(#roadMainGradient)" strokeWidth="30" filter="url(#roadNeonGlow)" />
              <path className="home-road-main" d="M1120 90 C1030 90 990 150 900 135 S740 45 620 85 S450 155 340 105 S180 40 80 120" stroke="url(#roadMainGradient)" strokeWidth="18" />
              <path d="M1120 90 C1030 90 990 150 900 135 S740 45 620 85 S450 155 340 105 S180 40 80 120" stroke="#10253b" strokeWidth="12" />
              <path className="home-road-dashes" d="M1120 90 C1030 90 990 150 900 135 S740 45 620 85 S450 155 340 105 S180 40 80 120" stroke="#dbeafe" strokeWidth="1.5" strokeDasharray="8 12" />
              <path className="home-road-connectors" d="M1050 90 V200 M750 80 V200 M450 105 V200 M150 115 V200" />
              <circle cx="1120" cy="90" r="8" className="home-road-endpoint" />
              <circle cx="80" cy="120" r="8" className="home-road-endpoint home-road-endpoint-finish" />
            </svg>

            <li className="home-road-start">
              <span className="home-road-start-label">{language === 'fa' ? 'شروع مسیر' : 'START'}</span>
            </li>

            {capabilityServices.map((svc, index) => {
              const stageIndex = capabilityStages.findIndex((stage) => stage.slug === svc.slug);
              const stage = capabilityStages[stageIndex === -1 ? index : stageIndex];

              return (
                <li key={svc.id} className={`home-road-station home-road-station-${index + 1}`}>
                  <span className="home-road-node">
                    {stage?.icon || <Factory className="h-5 w-5" />}
                  </span>
                  <Reveal delay={shouldReduceMotion ? 0 : index * 0.08} className="h-full">
                    <article className="home-road-card">
                      <div className="home-road-card-top">
                        <span className="home-road-stage-label">
                          {language === 'fa' ? stage?.label_fa || `مرحله ${index + 1}` : stage?.label_en || `Stage ${index + 1}`}
                        </span>
                        <span dir="ltr" className="home-road-number">
                          {String(index + 1).padStart(2, '0')} / {String(capabilityServices.length).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="home-road-title">
                        {language === 'fa' ? svc.title_fa : svc.title_en}
                      </h3>
                      <div className="home-road-title-line" />
                      <p className="home-road-description">
                        {language === 'fa' ? svc.summary_fa : svc.summary_en}
                      </p>
                      <Link to="/services" className="home-road-link">
                        <span>{homeText('service_details')}</span>
                        <ArrowIcon className="h-4 w-4" />
                      </Link>
                    </article>
                  </Reveal>
                </li>
              );
            })}

            <li className="home-road-finish">
              <span className="home-road-finish-label">{language === 'fa' ? 'پایان مسیر' : 'FINISH'}</span>
            </li>
          </ol>
        </div>
      </section>

      {spotlight && (
        <section
          className="home-spotlight-section home-page-snap-section relative isolate overflow-hidden border-y border-slate-200 py-16 dark:border-slate-800"
          style={{
            '--spotlight-background': spotlightBackgroundColor,
            '--spotlight-text': spotlightTextColor,
            '--spotlight-accent': spotlightAccentColor,
            backgroundColor: spotlightBackgroundColor,
            color: spotlightTextColor,
          } as React.CSSProperties}
        >
          {spotlightBackgroundUrl && (
            <img
              src={spotlightBackgroundUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 -z-10 h-full w-full object-cover"
              onError={(event) => {
                console.error('Could not load the home spotlight background image:', event.currentTarget.src);
                event.currentTarget.hidden = true;
              }}
            />
          )}
          {spotlightBackgroundUrl && (
            <div
              className="absolute inset-0 -z-10"
              aria-hidden="true"
              style={{ backgroundColor: spotlightBackgroundColor, opacity: spotlightBackgroundOpacity }}
            />
          )}
          <div className="relative mx-auto grid max-w-7xl items-stretch gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:col-span-6">
              <div>
                <div className="flex items-center gap-3.5">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-black/30 p-1">
                    <BrandLogo
                      placement="about"
                      overrideUrl={spotlightOverride.logo_url}
                      alt={companyTitle}
                      className="h-full w-full"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: spotlightAccentColor }}>{spotlightBadge}</p>
                    <h2 className="mt-1 text-2xl font-extrabold leading-snug sm:text-3xl" style={{ textWrap: 'balance' }}>
                      {spotlightTitle}
                    </h2>
                  </div>
                </div>
                {spotlightSubtitle && (
                  <p className="mt-3 text-xs leading-relaxed" style={{ color: spotlightAccentColor }}>{spotlightSubtitle}</p>
                )}
                <div
                  className="prose prose-invert mt-4 max-w-none text-sm leading-relaxed"
                  style={{ color: spotlightTextColor }}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(language === 'fa' ? spotlight.content_fa : spotlight.content_en) }}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                {spotlightPrimaryLink && spotlightPrimaryLabel && (
                  <EffectAction
                    as={Link}
                    to={spotlightPrimaryLink}
                    style={{ backgroundColor: spotlightAccentColor, color: spotlightBackgroundColor }}
                    className="rounded-lg px-5 py-2.5 text-xs font-semibold transition-opacity hover:opacity-90 whitespace-nowrap"
                  >
                    {spotlightPrimaryLabel}
                  </EffectAction>
                )}
                {spotlightSecondaryLink && spotlightSecondaryLabel && (
                  <Link to={spotlightSecondaryLink} style={{ borderColor: `${spotlightTextColor}55`, color: spotlightTextColor }} className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-xs font-semibold hover:bg-white/10 whitespace-nowrap">
                    <PlayCircle className="h-4 w-4" />
                    <span>{spotlightSecondaryLabel}</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-6">
              {spotlightImages.length > 0 && (
                <div
                  className="relative min-h-64 flex-1 overflow-hidden rounded-2xl border border-white/10"
                  style={{ backgroundColor: 'rgb(2 6 23 / 45%)', borderColor: `${spotlightTextColor}33` }}
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
      <section className="home-page-snap-section mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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
          <section className="home-page-snap-section overflow-hidden border-y border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900">
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
      <section className="home-page-snap-section mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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
                className="group relative block aspect-4/3 h-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-(--theme-primary) hover:shadow-xl hover:shadow-slate-900/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--theme-primary) dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/30"
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
      {banners.map((banner) => (
        <section key={banner.id} className="home-page-snap-section mx-auto mb-16 max-w-7xl px-4 sm:px-6 lg:px-8">
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
      ))}
    </div>
  );
};
