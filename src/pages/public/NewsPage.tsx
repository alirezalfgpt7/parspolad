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
import { getArticleImageObjectFit } from '../../utils/articleImageFit.ts';

interface ArticleComment {
  id: number;
  parent_id?: number | null;
  author_name: string;
  body: string;
  created_at: string;
  replies?: ArticleComment[];
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
  const [replyTo, setReplyTo] = useState<ArticleComment | null>(null);
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
      setReplyTo(null);
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
        body: JSON.stringify({ ...data, parent_id: replyTo?.id ?? null, captcha_key: captchaKey }),
      });
      reset();
      setReplyTo(null);
      refreshCaptcha();
      addToast('success', replyTo
        ? 'پاسخ شما پس از بررسی مدیر منتشر خواهد شد.'
        : 'دیدگاه شما پس از بررسی مدیر منتشر خواهد شد.');
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
        <article className="overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) shadow-(--theme-card-shadow)">
          <div className="h-72 bg-(--theme-surface-muted)">
            <ZeroBrokenImage
              src={single.cover_image}
              alt={single.title_fa}
              className="h-full w-full"
              style={{ objectFit: getArticleImageObjectFit(single.image_fit), objectPosition: 'center' }}
            />
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-(--theme-text-muted) tabular-nums">
              <span>{language === 'fa' ? single.category_fa : single.category_en}</span>
              <span>·</span>
              <span>{single.published_at}</span>
              <span>·</span>
              <span>{single.author_fa}</span>
              <span>·</span>
              <span>زمان مطالعه: {single.read_minutes} دقیقه</span>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold text-(--theme-text)">
              {language === 'fa' ? single.title_fa : single.title_en}
            </h1>
            <div
              className="prose mt-6 max-w-none text-sm leading-8 text-(--theme-text-muted) dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(language === 'fa' ? single.content_fa : single.content_en) }}
            />
            <section className="mt-10 border-t border-(--theme-border) pt-8">
              <h2 className="text-lg font-bold text-(--theme-text)">دیدگاه‌ها</h2>
              <p className="mt-1 text-xs text-(--theme-text-muted)">دیدگاه‌ها پس از بررسی مدیر نمایش داده می‌شوند.</p>
              {commentsLoading ? (
                <div className="mt-5 text-sm text-(--theme-text-muted)"><InlineLoader label="در حال بارگذاری دیدگاه‌ها..." /></div>
              ) : commentsError ? (
                <p role="alert" className="mt-5 text-sm text-red-600">{commentsError}</p>
              ) : comments.length === 0 ? (
                <p className="mt-5 text-sm text-(--theme-text-muted)">هنوز دیدگاهی برای این مقاله ثبت نشده است.</p>
              ) : (
                <div className="relative mt-6 space-y-5 before:absolute before:inset-y-4 before:right-3 before:w-px before:bg-(--theme-border)">
                  {comments.map((comment) => (
                    <div key={comment.id} className="relative pe-10">
                      <span aria-hidden="true" className="absolute right-0 top-5 z-10 h-6 w-6 rounded-full border-4 border-(--theme-surface) bg-(--theme-primary) shadow-sm" />
                      <article className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-4 shadow-(--theme-card-shadow) sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-(--theme-text)">{comment.author_name}</h3>
                          <time className="text-[11px] text-(--theme-text-muted)">
                            {new Date(comment.created_at).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}
                          </time>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-(--theme-text-muted)">
                          {comment.body}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyTo(comment);
                            document.getElementById('comment-body')?.focus();
                          }}
                          className="mt-3 text-xs font-bold text-(--theme-primary-ink) hover:underline"
                        >
                          پاسخ به این دیدگاه
                        </button>
                      </article>
                      {comment.replies?.map((reply) => (
                        <article key={reply.id} className="ms-5 mt-3 rounded-2xl border border-(--theme-primary)/20 bg-(--theme-primary)/8 p-4 sm:ms-8">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-(--theme-text)">{reply.author_name}</h4>
                            <time className="text-[11px] text-(--theme-text-muted)">
                              {new Date(reply.created_at).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}
                            </time>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-(--theme-text-muted)">
                            {reply.body}
                          </p>
                        </article>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {comments.length > 0 && (
                <Pagination page={commentsPage} lastPage={commentsLastPage} onChange={setCommentsPage} />
              )}

              <form onSubmit={handleSubmit(submitComment)} className="relative mt-8 space-y-4 rounded-2xl border border-(--theme-border) bg-(--theme-surface-muted) p-4 sm:p-5">
                <PublicHoneypotField registration={register('website')} />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-(--theme-text)">{replyTo ? `پاسخ به ${replyTo.author_name}` : 'ثبت دیدگاه'}</h3>
                    <p className="mt-1 text-[11px] text-(--theme-text-muted)">دیدگاه یا پاسخ شما پس از تأیید مدیر نمایش داده می‌شود.</p>
                  </div>
                  {replyTo && (
                    <button type="button" onClick={() => setReplyTo(null)} className="text-xs font-semibold text-(--theme-text-muted) hover:text-(--theme-primary-ink)">
                      لغو پاسخ
                    </button>
                  )}
                </div>
                <div>
                  <label htmlFor="comment-author" className="mb-1 block text-xs font-medium text-(--theme-text)">نام شما</label>
                  <input
                    {...register('author_name')}
                    id="comment-author"
                    maxLength={120}
                    className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)"
                  />
                  {errors.author_name && <p className="mt-1 text-xs text-red-600">{errors.author_name.message}</p>}
                </div>
                <div>
                  <label htmlFor="comment-body" className="mb-1 block text-xs font-medium text-(--theme-text)">متن دیدگاه</label>
                  <textarea
                    {...register('body')}
                    id="comment-body"
                    rows={4}
                    maxLength={2000}
                    className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)"
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
                  className="rounded-xl bg-(--theme-btn-bg) px-5 py-2.5 text-sm font-semibold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover) disabled:opacity-60"
                >
                  {isSubmitting ? 'در حال ارسال...' : replyTo ? 'ارسال پاسخ' : 'ارسال دیدگاه'}
                </button>
              </form>
            </section>
            <Link to="/news" className="mt-8 inline-flex items-center gap-1.5 text-xs font-semibold text-(--theme-link) hover:underline">
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
      <div id="news-list" className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {articles.map((art) => (
          <Link
            key={art.id}
            to={`/news/${art.slug}`}
            className="group overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) shadow-(--theme-card-shadow) transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-(--theme-card-border-hover) hover:shadow-(--theme-card-shadow-hover)"
          >
            <div className="h-48 overflow-hidden bg-(--theme-surface-muted)">
              <ZeroBrokenImage
                src={art.cover_image}
                alt={art.title_fa}
                className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                style={{ objectFit: getArticleImageObjectFit(art.image_fit), objectPosition: 'center' }}
              />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs text-(--theme-text-muted) tabular-nums">
                <span>{language === 'fa' ? art.category_fa : art.category_en}</span>
                <span>·</span>
                <span>{art.published_at}</span>
                {art.author_fa && (
                  <>
                    <span>·</span>
                    <span>نویسنده: {art.author_fa}</span>
                  </>
                )}
              </div>
              <h2 className="mt-2 text-base font-bold text-(--theme-text) group-hover:text-(--theme-primary-ink)">
                {language === 'fa' ? art.title_fa : art.title_en}
              </h2>
              <p className="mt-2 line-clamp-3 text-xs text-(--theme-text-muted)">
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
