import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Article } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';
import { SelfHostedCaptcha } from '../../components/forms/SelfHostedCaptcha.tsx';
import { PublicHoneypotField } from '../../components/forms/PublicHoneypotField.tsx';
import { sanitizeHtml } from '../../utils/sanitizeHtml.ts';
import { InlineLoader } from '../../components/common/InlineLoader.tsx';
import { CmsPageIntro } from '../../components/common/CmsPageIntro.tsx';

interface ArticleComment {
  id: number;
  author_name: string;
  body: string;
  created_at: string;
}

const commentSchema = z.object({
  author_name: z.string().min(2, 'نام خود را وارد کنید').max(120),
  body: z.string().min(10, 'متن دیدگاه حداقل ۱۰ کاراکتر باشد').max(2000, 'متن دیدگاه حداکثر ۲۰۰۰ کاراکتر باشد'),
  captcha: z.string().min(1, 'کد امنیتی را وارد کنید'),
  website: z.string().optional(),
});

type CommentFormValues = z.infer<typeof commentSchema>;

export const NewsPage: React.FC = () => {
  const { slug } = useParams();
  const language = useAppStore((s) => s.language);
  const addToast = useAppStore((s) => s.addToast);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlePage, setArticlePage] = useState(1);
  const [articleLastPage, setArticleLastPage] = useState(1);
  const [single, setSingle] = useState<Article | null>(null);
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsLastPage, setCommentsLastPage] = useState(1);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaRefreshToken, setCaptchaRefreshToken] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { captcha: '', website: '' },
  });

  const refreshCaptcha = () => {
    setCaptchaKey('');
    setCaptchaRefreshToken((token) => token + 1);
    setValue('captcha', '', { shouldValidate: false });
  };

  useEffect(() => {
    let active = true;

    if (slug) {
      setSingle(null);
      setComments([]);
      setCommentsError('');
      setCommentsPage(1);
      reset();
      apiRequest<{ data: Article }>(`/articles/${slug}`)
        .then((r) => {
          if (active) setSingle(r.data);
        })
        .catch((error: unknown) => {
          if (active) addToast('error', error instanceof Error ? error.message : 'دریافت مقاله ناموفق بود.');
        });
    } else {
      setSingle(null);
      setCommentsLoading(false);
    }

    return () => {
      active = false;
    };
  }, [slug, reset, addToast]);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setCommentsLoading(true);
    setCommentsError('');
    apiRequest<{ data: ArticleComment[]; meta: { last_page: number } }>(
      `/articles/${slug}/comments?page=${commentsPage}&per_page=20`,
    )
      .then((response) => {
        if (active) {
          setComments(response.data);
          setCommentsLastPage(response.meta.last_page);
        }
      })
      .catch(() => {
        if (active) setCommentsError('دریافت دیدگاه‌ها با خطا روبه‌رو شد.');
      })
      .finally(() => {
        if (active) setCommentsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, commentsPage]);

  useEffect(() => {
    if (slug) return;
    let active = true;
    apiRequest<{ data: Article[]; meta: { last_page: number } }>(`/articles?page=${articlePage}&per_page=9`)
      .then((response) => {
        if (active) {
          setArticles(response.data);
          setArticleLastPage(response.meta.last_page);
        }
      })
      .catch((error: unknown) => {
        if (active) addToast('error', error instanceof Error ? error.message : 'دریافت فهرست مقالات ناموفق بود.');
      });

    return () => {
      active = false;
    };
  }, [slug, articlePage, addToast]);

  const submitComment = async (data: CommentFormValues) => {
    if (!slug) return;

    try {
      await apiRequest(`/articles/${slug}/comments`, {
        method: 'POST',
        body: JSON.stringify({ ...data, captcha_key: captchaKey }),
      });
      reset();
      refreshCaptcha();
      addToast('success', 'دیدگاه شما پس از بررسی مدیر منتشر خواهد شد.');
    } catch (error) {
      refreshCaptcha();
      addToast('error', error instanceof Error ? error.message : 'ارسال دیدگاه ناموفق بود.');
    }
  };

  if (slug && single) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <SeoHead
          title={language === 'fa' ? single.title_fa : single.title_en}
          description={language === 'fa' ? single.excerpt_fa : single.excerpt_en}
          image={single.cover_image}
          language={language}
        />
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
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(language === 'fa' ? single.content_fa : single.content_en) }}
            />
            <section className="mt-10 border-t border-slate-200 pt-8 dark:border-slate-800">
              <h2 className="text-lg font-bold">دیدگاه‌ها</h2>
              <p className="mt-1 text-xs text-slate-500">دیدگاه‌ها پس از بررسی مدیر نمایش داده می‌شوند.</p>
              {commentsLoading ? (
                <div className="mt-5 text-sm text-slate-500"><InlineLoader label="در حال بارگذاری دیدگاه‌ها..." /></div>
              ) : commentsError ? (
                <p role="alert" className="mt-5 text-sm text-red-600">{commentsError}</p>
              ) : comments.length === 0 ? (
                <p className="mt-5 text-sm text-slate-500">هنوز دیدگاهی برای این مقاله ثبت نشده است.</p>
              ) : (
                <div className="mt-5 space-y-3">
                  {comments.map((comment) => (
                    <article key={comment.id} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold">{comment.author_name}</h3>
                        <time className="text-xs text-slate-500">
                          {new Date(comment.created_at).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}
                        </time>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                        {comment.body}
                      </p>
                    </article>
                  ))}
                </div>
              )}
              {comments.length > 0 && (
                <Pagination page={commentsPage} lastPage={commentsLastPage} onChange={setCommentsPage} />
              )}

              <form onSubmit={handleSubmit(submitComment)} className="relative mt-8 space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:p-5">
                <PublicHoneypotField registration={register('website')} />
                <h3 className="text-sm font-bold">ثبت دیدگاه</h3>
                <div>
                  <label htmlFor="comment-author" className="mb-1 block text-xs font-medium">نام شما</label>
                  <input
                    {...register('author_name')}
                    id="comment-author"
                    maxLength={120}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  />
                  {errors.author_name && <p className="mt-1 text-xs text-red-600">{errors.author_name.message}</p>}
                </div>
                <div>
                  <label htmlFor="comment-body" className="mb-1 block text-xs font-medium">متن دیدگاه</label>
                  <textarea
                    {...register('body')}
                    id="comment-body"
                    rows={4}
                    maxLength={2000}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  />
                  {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body.message}</p>}
                </div>
                <SelfHostedCaptcha
                  registration={register('captcha')}
                  refreshToken={captchaRefreshToken}
                  onKeyChange={setCaptchaKey}
                  onRefresh={refreshCaptcha}
                  error={errors.captcha?.message}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !captchaKey}
                  className="rounded-lg bg-(--theme-primary) px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isSubmitting ? 'در حال ارسال...' : 'ارسال دیدگاه'}
                </button>
              </form>
            </section>
            <Link to="/news" className="mt-8 inline-flex items-center gap-1.5 text-xs font-semibold text-(--theme-primary) hover:underline">
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
      <CmsPageIntro slug="news" className="mb-8" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {articles.map((art) => (
          <Link
            key={art.id}
            to={`/news/${art.slug}`}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900"
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
              <h2 className="mt-2 text-base font-bold text-slate-900 group-hover:text-(--theme-primary) dark:text-white">
                {language === 'fa' ? art.title_fa : art.title_en}
              </h2>
              <p className="mt-2 line-clamp-3 text-xs text-slate-600 dark:text-slate-300">
                {language === 'fa' ? art.excerpt_fa : art.excerpt_en}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <Pagination page={articlePage} lastPage={articleLastPage} onChange={setArticlePage} />
    </div>
  );
};
