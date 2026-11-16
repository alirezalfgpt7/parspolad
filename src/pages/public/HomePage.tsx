import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Article, Project } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { HeroSlider } from '../../components/slider/HeroSlider.tsx';
import { StatCounter } from '../../components/ui/StatCounter.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';

export const HomePage: React.FC = () => {
  const { bootstrap, language } = useAppStore();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    apiRequest<{ data: Project[] }>('/projects?per_page=6')
      .then((res) => setFeaturedProjects(res.data))
      .catch(() => {});
    apiRequest<{ data: Article[] }>('/articles')
      .then((res) => setArticles(res.data.slice(0, 3)))
      .catch(() => {});
  }, []);

  const heroSlider = bootstrap?.sliders?.find((s) => s.key === 'landing_hero') || bootstrap?.sliders?.[0];
  const kpis = bootstrap?.kpis || [];
  const services = bootstrap?.services || [];
  const partners = bootstrap?.partners || [];
  const banner = bootstrap?.banners?.find((b) => b.placement === 'landing_mid');
  const ArrowIcon = language === 'fa' ? ArrowLeft : ArrowRight;

  return (
    <div>
      <SeoHead
        title={language === 'fa' ? 'صفحه اصلی' : 'Home'}
        description={bootstrap?.seo?.meta_description}
      />

      {heroSlider && <HeroSlider slides={heroSlider.slides} />}

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
            <p className="text-xs font-semibold text-[var(--theme-primary)]">
              {language === 'fa' ? 'توانمندی‌های مهندسی و تولیدی' : 'Engineering & Manufacturing Capabilities'}
            </p>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white" style={{ textWrap: 'balance' }}>
              {language === 'fa'
                ? 'چرخه کامل طراحی تا نصب تجهیزات سرچاهی و درون‌چاهی'
                : 'End-to-End Oilfield Wellhead & Downhole Hardware'}
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--theme-link)] hover:underline whitespace-nowrap"
          >
            <span>{language === 'fa' ? 'همه خدمات مهندسی' : 'All Services'}</span>
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
                className={`group overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-[var(--theme-primary)] dark:border-slate-800 dark:bg-slate-900 ${
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
                      className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--theme-primary)] hover:underline"
                    >
                      <span>{language === 'fa' ? 'مشاهده شرح فنی' : 'Technical Scope'}</span>
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

      {/* Industrial Facility & QC Lab Spotlight */}
      <section className="border-y border-slate-200 bg-slate-900 py-16 text-white dark:border-slate-800">
        <div className="mx-auto grid max-w-7xl items-stretch gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:col-span-6">
            <div>
              <p className="text-xs font-semibold text-amber-400">
                {language === 'fa' ? 'زیرساخت کارخانه اهواز · تاییدیه دانش‌بنیان' : 'Ahvaz Manufacturing Plant · Knowledge-Based'}
              </p>
              <h2 className="mt-2 text-2xl font-extrabold leading-snug sm:text-3xl" style={{ textWrap: 'balance' }}>
                {language === 'fa'
                  ? 'تولید بومی تجهیزات حیاتی نفت و گاز با یک‌دهم هزینه نمونه‌های وارداتی'
                  : 'Domestic Oilfield Precision Manufacturing at 1/10th Import Cost'}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                {language === 'fa'
                  ? 'مجموعه پارس پولاد آقایی با بیش از ۲۰۰ دستگاه تحویلی به وزارت نفت، تولید ۱۴۰ قلم قطعه توربین و کمپرسورهای الیوت، راستون و رولزرویس و آزمایشگاه تست فشار تا ۱۵۰۰۰ PSI، ضامن پایداری عملیات حفاری کشور است.'
                  : 'With over 200 critical assemblies delivered to the Ministry of Oil and 140+ turbine & compressor bearings localized, Pars Poolad ensures continuous drilling uptime.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/about"
                className="rounded-lg bg-[var(--theme-primary)] px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
              >
                {language === 'fa' ? 'تاریخچه و توان تولید' : 'Plant & Heritage'}
              </Link>
              <Link
                to="/contracts-licenses"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 whitespace-nowrap"
              >
                <PlayCircle className="h-4 w-4" />
                <span>{language === 'fa' ? 'گواهینامه‌های API و ISO' : 'API & ISO Certificates'}</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:col-span-6">
            <div className="overflow-hidden rounded-xl border border-white/10">
              <ZeroBrokenImage
                src="/src/assets/images/factory_ahvaz_exterior_1794834721582.jpg"
                alt="کارخانه پارس پولاد آقایی اهواز"
                className="h-full min-h-[220px] w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <ZeroBrokenImage
                src="/src/assets/images/qc_testing_lab_1794834723950.jpg"
                alt="آزمایشگاه کنترل کیفیت و تست فشار ۱۵۰۰۰ PSI"
                className="h-full min-h-[220px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[var(--theme-primary)]">
              {language === 'fa' ? 'کارنامه اجرایی در میادین نفت و گاز' : 'Field Proven Track Record'}
            </p>
            <h2 className="mt-1.5 text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white">
              {language === 'fa' ? 'پروژه‌های شاخص سرچاهی و درون‌چاهی' : 'Selected Oilfield Projects'}
            </h2>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--theme-link)] hover:underline whitespace-nowrap"
          >
            <span>{language === 'fa' ? 'فیلتر پیشرفته همه پروژه‌ها' : 'Filter All Projects'}</span>
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.slice(0, 6).map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-[var(--theme-primary)] dark:border-slate-800 dark:bg-slate-900"
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
                    <span>{p.status === 'completed' ? 'تکمیل‌شده' : 'در حال اجرا'}</span>
                  </div>
                  <h3 className="mt-2 text-base font-bold leading-snug text-slate-900 group-hover:text-[var(--theme-primary)] dark:text-white">
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
          <p className="text-xs font-semibold text-[var(--theme-primary)]">
            {language === 'fa' ? 'اعتماد کارفرمایان بزرگ صنعت نفت، گاز و حفاری' : 'Trusted by Major National Oil & Drilling Operators'}
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
            {language === 'fa' ? 'کارفرمایان و شرکای راهبردی' : 'Clients & Strategic Partners'}
          </h2>
        </div>

        <div className="relative overflow-hidden">
          <div className="animate-marquee flex items-center gap-10">
            {[...partners, ...partners].map((partner, idx) => (
              <div
                key={`${partner.id}-${idx}`}
                className="flex h-24 w-48 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <img
                  src={partner.logo_url}
                  alt={partner.name_fa}
                  loading="lazy"
                  className="h-11 max-w-[140px] object-contain"
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
            <p className="text-xs font-semibold text-[var(--theme-primary)]">
              {language === 'fa' ? 'دانش مهندسی و تازه‌ها' : 'Engineering Insights'}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
              {language === 'fa' ? 'مقالات فنی و اخبار صنعتی' : 'Technical Articles & News'}
            </h2>
          </div>
          <Link to="/news" className="text-sm font-semibold text-[var(--theme-link)] hover:underline">
            {language === 'fa' ? 'آرشیو مقالات' : 'All Articles'}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {articles.map((art) => (
            <Link
              key={art.id}
              to={`/news/${art.slug}`}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-[var(--theme-primary)] dark:border-slate-800 dark:bg-slate-900"
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
                <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-[var(--theme-primary)] dark:text-white">
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
            <img
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
