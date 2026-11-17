import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { PageContent } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';
import { PagePreloader } from '../../components/common/PagePreloader.tsx';
import { sanitizeHtml } from '../../utils/sanitizeHtml.ts';
import { DecorativeCube, EffectAction, EffectText } from '../../components/effects/index.ts';

export const AboutPage: React.FC = () => {
  const language = useAppStore((s) => s.language);
  const [page, setPage] = useState<PageContent | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<{ data: PageContent }>('/pages/about')
      .then((r) => setPage(r.data))
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'دریافت صفحه ناموفق بود.'));
  }, []);

  const metadata = page?.metadata ?? {};
  const imageUrl = typeof metadata.image_url === 'string' ? metadata.image_url : '';
  const downloads = [1, 2].flatMap((index) => {
    const url = metadata[`download_${index}_url`];
    const labelFa = metadata[`download_${index}_label_fa`];
    const labelEn = metadata[`download_${index}_label_en`];
    return typeof url === 'string' && typeof labelFa === 'string' && typeof labelEn === 'string'
      ? [{ url, label: language === 'fa' ? labelFa : labelEn }]
      : [];
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoHead
        title={page ? (language === 'fa' ? page.meta_title : page.meta_title_en || page.title_en) : ''}
        description={page ? (language === 'fa' ? page.meta_description : page.meta_description_en || page.meta_description) : ''}
        image={page?.meta_image || imageUrl}
        canonicalUrl={page?.canonical_url || undefined}
        language={language}
      />
      <Breadcrumb items={[{ label: language === 'fa' ? 'درباره شرکت' : 'About Us' }]} />

      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : !page ? (
        <PagePreloader label="در حال دریافت محتوا..." />
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-semibold text-(--theme-primary)">
                  {language === 'fa' ? 'درباره ما' : 'About us'}
                </p>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  <EffectText>{language === 'fa' ? page.title_fa : page.title_en}</EffectText>
                </h1>
              </div>
              <DecorativeCube size="lg" className="h-20 w-20 shrink-0 rounded-2xl border border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-900/70" />
            </div>
            <p className="text-base font-medium text-(--theme-primary)">
              {language === 'fa' ? page.subtitle_fa : page.subtitle_en}
            </p>
            <div
              className="prose max-w-none text-sm leading-8 text-slate-700 dark:prose-invert dark:text-slate-300"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(language === 'fa' ? page.content_fa : page.content_en) }}
            />
            {downloads.length > 0 && (
              <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
                {downloads.map((download) => (
                  <EffectAction
                    as="a"
                    key={download.url}
                    href={download.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900"
                  >
                    <span>{download.label}</span>
                    <Download className="h-4 w-4 text-(--theme-primary)" />
                  </EffectAction>
                ))}
              </div>
            )}
          </div>
          {imageUrl && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 lg:col-span-5 dark:border-slate-800">
              <ZeroBrokenImage src={imageUrl} alt={page.title_fa} className="h-full min-h-80 w-full object-cover" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
