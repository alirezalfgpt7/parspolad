import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Article } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';

export const NewsPage: React.FC = () => {
  const { slug } = useParams();
  const language = useAppStore((s) => s.language);
  const [articles, setArticles] = useState<Article[]>([]);
  const [single, setSingle] = useState<Article | null>(null);

  useEffect(() => {
    if (slug) {
      apiRequest<{ data: Article }>(`/articles/${slug}`).then((r) => setSingle(r.data)).catch(() => {});
    } else {
      apiRequest<{ data: Article[] }>('/articles').then((r) => setArticles(r.data)).catch(() => {});
    }
  }, [slug]);

  if (slug && single) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <SeoHead title={language === 'fa' ? single.title_fa : single.title_en} />
        <Breadcrumb items={[{ label: 'اخبار و مقالات', to: '/news' }, { label: single.title_fa }]} />
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="h-72 bg-slate-100 dark:bg-slate-800">
            <ZeroBrokenImage src={single.cover_image} alt={single.title_fa} className="h-full w-full object-cover" />
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
              <span>{single.category_fa}</span>
              <span>·</span>
              <span>{single.published_at}</span>
              <span>·</span>
              <span>{single.author_fa}</span>
              <span>·</span>
              <span>زمان مطالعه: {single.read_minutes} دقیقه</span>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
              {language === 'fa' ? single.title_fa : single.title_en}
            </h1>
            <div
              className="prose mt-6 max-w-none text-sm leading-8 text-slate-700 dark:prose-invert dark:text-slate-300"
              dangerouslySetInnerHTML={{ __html: language === 'fa' ? single.content_fa : single.content_en }}
            />
            <Link to="/news" className="mt-8 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--theme-primary)] hover:underline">
              <ArrowRight className="h-3.5 w-3.5" />
              <span>بازگشت به فهرست مقالات</span>
            </Link>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoHead title="اخبار و مقالات فنی" />
      <Breadcrumb items={[{ label: 'اخبار و مقالات' }]} />
      <h1 className="mb-8 text-3xl font-extrabold text-slate-900 dark:text-white">
        اخبار صنعتی و مقالات مهندسی
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {articles.map((art) => (
          <Link
            key={art.id}
            to={`/news/${art.slug}`}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-[var(--theme-primary)] dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <ZeroBrokenImage src={art.cover_image} alt={art.title_fa} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
                <span>{art.category_fa}</span>
                <span>·</span>
                <span>{art.published_at}</span>
              </div>
              <h2 className="mt-2 text-base font-bold text-slate-900 group-hover:text-[var(--theme-primary)] dark:text-white">
                {language === 'fa' ? art.title_fa : art.title_en}
              </h2>
              <p className="mt-2 line-clamp-3 text-xs text-slate-600 dark:text-slate-300">
                {language === 'fa' ? art.excerpt_fa : art.excerpt_en}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
