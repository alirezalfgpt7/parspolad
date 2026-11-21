import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Article, Language } from '../../../types/index.ts';
import { Reveal } from '../../effects/index.ts';
import { ZeroBrokenImage } from '../../ui/ZeroBrokenImage.tsx';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.ts';
import { HomeSectionHeading } from './HomeSectionHeading.tsx';

interface HomeNewsSectionProps {
  articles: Article[];
  language: Language;
  text: (key: string) => string;
}

export const HomeNewsSection: React.FC<HomeNewsSectionProps> = ({ articles, language, text }) => {
  const reducedMotion = usePrefersReducedMotion();
  const ArrowIcon = language === 'fa' ? ArrowLeft : ArrowRight;

  return (
    <section id="home-news" className="home-page-snap-section mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <HomeSectionHeading
        eyebrow={text('news_eyebrow')}
        title={text('news_title')}
        actionLabel={text('articles_all')}
        actionTo="/news"
        language={language}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {articles.map((article, index) => (
          <Reveal key={article.id} delay={reducedMotion ? 0 : index * 0.055} className="h-full">
            <Link
              to={`/news/${article.slug}`}
              className="group relative block aspect-4/3 h-full overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-surface-muted) shadow-(--theme-card-shadow) transition-[border-color,box-shadow] duration-300 hover:border-(--theme-card-border-hover) hover:shadow-(--theme-card-shadow-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--theme-primary-ink)"
            >
              <ZeroBrokenImage
                src={article.cover_image}
                alt={language === 'fa' ? article.title_fa : article.title_en}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-slate-950/60 p-5 text-white backdrop-blur-[2px] transition-transform duration-500 ease-out md:translate-y-full md:group-hover:translate-y-0 md:group-focus-visible:translate-y-0 motion-reduce:transition-none">
                <div className="mb-auto flex items-center gap-2 text-xs text-white/80 tabular-nums">
                  <span>{language === 'fa' ? article.category_fa : article.category_en}</span>
                  <span aria-hidden="true">·</span>
                  <time>{article.published_at}</time>
                </div>
                <h3 className="line-clamp-2 text-lg font-bold leading-7">
                  {language === 'fa' ? article.title_fa : article.title_en}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/80">
                  {language === 'fa' ? article.excerpt_fa : article.excerpt_en}
                </p>
                <span
                  className="mt-4 inline-flex items-center gap-2 self-start rounded-lg px-4 py-2 text-sm font-semibold shadow-lg"
                  style={{ backgroundColor: 'var(--theme-btn-bg)', color: 'var(--theme-btn-text)' }}
                >
                  {language === 'fa' ? 'خواندن مقاله' : 'Read article'}
                  <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
