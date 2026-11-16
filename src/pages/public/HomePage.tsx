import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Article, Project } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { StatCounter } from '../../components/ui/StatCounter.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';
import { sanitizeHtml } from '../../utils/sanitizeHtml.ts';
import { useCmsPage } from '../../hooks/useCmsPage.ts';

export const HomePage: React.FC = () => {
  const { bootstrap, language } = useAppStore();
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

  return (
    <div>
      <SeoHead
        title={bootstrap?.seo?.site_title ?? ''}
        description={bootstrap?.seo?.meta_description}
      />

      {/* KPI Counter Strip */}
      <section className="border-b border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {kpis.map((k) => (
            <StatCounter
              key={k.id}
              target={k.value}
              suffix={language === 'fa' ? k.suffix_fa : k.suffix_en}
              label={language === 'fa' ? k.label_fa : k.label_en}
              lang={language}
            />
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
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
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
                    <ZeroBrokenImage
                      src={svc.image_url}
                      alt={language === 'fa' ? svc.title_fa : svc.title_en}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {spotlight && (
        <section className="border-y border-slate-200 bg-slate-900 py-16 text-white dark:border-slate-800">
          <div className="mx-auto grid max-w-7xl items-stretch gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:col-span-6">
              <div>
                <p className="text-xs font-semibold text-amber-400">
                  {language === 'fa' ? spotlight.subtitle_fa : spotlight.subtitle_en}
                </p>
                <h2 className="mt-2 text-2xl font-extrabold leading-snug sm:text-3xl" style={{ textWrap: 'balance' }}>
                  {language === 'fa' ? spotlight.title_fa : spotlight.title_en}
                </h2>
                <div
                  className="prose prose-invert mt-4 max-w-none text-sm leading-relaxed text-slate-300"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(language === 'fa' ? spotlight.content_fa : spotlight.content_en) }}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                {typeof spotlight.metadata?.primary_link === 'string' && (
                  <Link to={spotlight.metadata.primary_link} className="rounded-lg bg-(--theme-primary) px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap">
                    {String(spotlight.metadata[language === 'fa' ? 'primary_label_fa' : 'primary_label_en'] || '')}
                  </Link>
                )}
                {typeof spotlight.metadata?.secondary_link === 'string' && (
                  <Link to={spotlight.metadata.secondary_link} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 whitespace-nowrap">
                    <PlayCircle className="h-4 w-4" />
                    <span>{String(spotlight.metadata[language === 'fa' ? 'secondary_label_fa' : 'secondary_label_en'] || '')}</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:col-span-6">
              {[spotlight.metadata?.image_url, spotlight.metadata?.secondary_image_url]
                .filter((image): image is string => typeof image === 'string' && image.length > 0)
                .map((image) => (
                  <div key={image} className="overflow-hidden rounded-xl border border-white/10">
                    <ZeroBrokenImage src={image} alt={spotlight.title_fa} className="h-full min-h-55 w-full object-cover" />
                  </div>
                ))}
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
          {featuredProjects.slice(0, 6).map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <ZeroBrokenImage
                  src={p.cover_image}
                  alt={language === 'fa' ? p.title_fa : p.title_en}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
          ))}
        </div>
      </section>

      {/* Rotating Partners & Clients Strip */}
      <section className="border-y border-slate-200 bg-white py-12 overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-8 max-w-7xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold text-(--theme-primary)">{homeText('partners_eyebrow')}</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
            {homeText('partners_title')}
          </h2>
        </div>

        <div className="relative overflow-hidden">
          <div className="animate-marquee flex items-center gap-10">
            {[...partners, ...partners].map((partner, idx) => (
              <div
                key={`${partner.id}-${idx}`}
                className="flex h-24 w-48 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <ZeroBrokenImage
                  src={partner.logo_url}
                  alt={partner.name_fa}
                  className="h-11 max-w-35 object-contain"
                />
                <span className="truncate max-w-full text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {language === 'fa' ? partner.name_fa : partner.name_en}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

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
          {articles.map((art) => (
            <Link
              key={art.id}
              to={`/news/${art.slug}`}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <ZeroBrokenImage
                  src={art.cover_image}
                  alt={art.title_fa}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
