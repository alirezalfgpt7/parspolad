import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { CmsPageIntro } from '../../components/common/CmsPageIntro.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { useCmsPage } from '../../hooks/useCmsPage.ts';
import { sanitizeHtml } from '../../utils/sanitizeHtml.ts';
import { DEFAULT_PAGES_CONFIG } from '../../utils/brandingDefaults.ts';
import { Error404Effect, Win11BootSpinnerEffect } from '../../components/effects/index.ts';

interface FaqItem {
  id: number;
  question_fa: string;
  question_en?: string | null;
  answer_fa: string;
  answer_en?: string | null;
}

export const FaqPage: React.FC = () => {
  const language = useAppStore((state) => state.language);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<{ data: FaqItem[]; meta: { last_page: number } }>(`/faqs?page=${page}&per_page=20`)
      .then((response) => {
        if (page > response.meta.last_page) {
          setPage(Math.max(1, response.meta.last_page));
          return;
        }
        setFaqs(response.data);
        setLastPage(response.meta.last_page);
        setOpenIdx(response.data[0]?.id ?? null);
        setError('');
      })
      .catch(() => setError('دریافت سوالات متداول با خطا روبه‌رو شد.'));
  }, [page]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <CmsPageIntro slug="faq" className="mb-6" />
      <div className="space-y-3">
        {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : faqs.length === 0 ? (
          <p className="text-sm text-slate-500">سوال متداولی ثبت نشده است.</p>
        ) : faqs.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setOpenIdx(openIdx === item.id ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 p-4 text-start text-sm font-bold"
            >
              <span>{language === 'fa' ? item.question_fa : item.question_en || item.question_fa}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${openIdx === item.id ? 'rotate-180' : ''}`} />
            </button>
            {openIdx === item.id && (
              <div className="border-t border-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300">
                {language === 'fa' ? item.answer_fa : item.answer_en || item.answer_fa}
              </div>
            )}
          </div>
        ))}
      </div>
      <Pagination page={page} lastPage={lastPage} onChange={setPage} />
    </div>
  );
};

export const LegalPage: React.FC = () => {
  const { content } = useCmsPage('legal');
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <CmsPageIntro slug="legal" className="mb-6" showContent={false} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="prose max-w-none text-sm leading-8 dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
      </div>
    </div>
  );
};

export const SitemapPage: React.FC = () => {
  const { language, addToast } = useAppStore();
  const [links, setLinks] = useState<Array<{ path: string; title_fa: string; title_en: string }>>([]);

  useEffect(() => {
    apiRequest<{ data: Array<{ path: string; title_fa: string; title_en: string }> }>('/sitemap')
      .then((response) => setLinks(response.data))
      .catch((error: unknown) => addToast('error', error instanceof Error ? error.message : 'دریافت نقشه سایت ناموفق بود.'));
  }, [addToast]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <CmsPageIntro slug="sitemap" className="mb-6" />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">نقشه سایت (HTML & XML Sitemap)</h2>
          <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-xs font-semibold text-(--theme-primary) hover:underline">
            مشاهده sitemap.xml
          </a>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {links.map((link) => (
            <Link key={link.path} to={link.path} className="rounded-lg border border-slate-100 px-4 py-3 text-sm font-medium hover:border-(--theme-primary) dark:border-slate-800">
              {language === 'fa' ? link.title_fa : link.title_en}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MaintenancePage: React.FC = () => {
  const { bootstrap, previewPagesConfig, language } = useAppStore();
  const cfg = {
    ...DEFAULT_PAGES_CONFIG.maintenance,
    ...(bootstrap?.pages_config?.maintenance || {}),
    ...(previewPagesConfig?.maintenance || {}),
  };
  const title = (language === 'fa' ? cfg.title_fa : cfg.title_en) || 'حالت بروزرسانی فنی سامانه';
  const subtitle =
    bootstrap?.site?.maintenance_message_fa ||
    (language === 'fa' ? cfg.subtitle_fa : cfg.subtitle_en) ||
    '';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
      <div className="mb-4 h-20 w-20 overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-2 shadow-lg">
        <BrandLogo placement="preloader" overrideUrl={cfg.logo_url} alt={title} className="h-full w-full" />
      </div>
      <Win11BootSpinnerEffect className="my-2 text-amber-400" />
      <h1 className="mt-4 text-2xl font-extrabold">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-slate-300">{subtitle}</p>
      <Link to="/login" className="mt-6 rounded-lg bg-(--theme-primary) px-5 py-2 text-xs font-semibold text-white">
        {language === 'fa' ? 'ورود مدیران سیستم' : 'Admin Sign In'}
      </Link>
    </div>
  );
};

export const ErrorPage: React.FC<{ code: 403 | 404 | 500 }> = ({ code }) => {
  const { bootstrap, previewPagesConfig, language } = useAppStore();
  const key = `error_${code}`;
  const cfg = {
    ...(DEFAULT_PAGES_CONFIG[key] || DEFAULT_PAGES_CONFIG.error_404),
    ...(bootstrap?.pages_config?.[key] || {}),
    ...(previewPagesConfig?.[key] || {}),
  };

  const title = (language === 'fa' ? cfg.title_fa : cfg.title_en) || `Error ${code}`;
  const subtitle = (language === 'fa' ? cfg.subtitle_fa : cfg.subtitle_en) || '';
  const ctaLabel = (language === 'fa' ? cfg.cta_fa : cfg.cta_en) || (language === 'fa' ? 'بازگشت به صفحه اصلی' : 'Return Home');

  return (
    <Error404Effect
      code={code}
      title={title}
      subtitle={subtitle}
      ctaLabel={ctaLabel}
      logoElement={
        cfg.logo_url ? (
          <div className="h-14 w-14 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <BrandLogo overrideUrl={cfg.logo_url} alt={title} className="h-full w-full" />
          </div>
        ) : undefined
      }
    />
  );
};
