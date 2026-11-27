import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Download } from 'lucide-react';
import { ApiError, apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Product } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.tsx';
import { PagePreloader } from '../../components/common/PagePreloader.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams();
  const { bootstrap, language } = useAppStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    setProduct(null);
    setLoadError('');
    setLoading(true);

    if (!slug) {
      setLoadError(language === 'fa' ? 'شناسه محصول معتبر نیست.' : 'Invalid product identifier.');
      setLoading(false);
      return () => {
        active = false;
      };
    }

    apiRequest<{ data: Product }>(`/products/${encodeURIComponent(slug)}`)
      .then(({ data }) => {
        if (active) setProduct(data);
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error('Could not load product details:', error);
        setLoadError(
          error instanceof ApiError && error.status === 404
            ? (language === 'fa' ? 'محصول موردنظر پیدا نشد.' : 'The requested product was not found.')
            : (language === 'fa' ? 'دریافت اطلاعات محصول ناموفق بود.' : 'Could not load product details.'),
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, language]);

  if (loading) {
    return <PagePreloader label={language === 'fa' ? 'در حال دریافت اطلاعات محصول...' : 'Loading product details...'} />;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <div className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-8 shadow-(--theme-card-shadow)">
          <h1 className="text-xl font-extrabold text-(--theme-text)">
            {loadError || (language === 'fa' ? 'محصول در دسترس نیست.' : 'Product unavailable.')}
          </h1>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) px-4 py-2.5 text-sm font-semibold text-(--theme-text) transition-colors hover:border-(--theme-primary-ink) hover:text-(--theme-primary-ink)"
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            {language === 'fa' ? 'بازگشت به محصولات' : 'Back to products'}
          </Link>
        </div>
      </div>
    );
  }

  const name = language === 'fa' ? product.name_fa : product.name_en || product.name_fa;
  const summary = language === 'fa' ? product.summary_fa : product.summary_en || product.summary_fa;
  const specs = language === 'fa' ? product.specs || {} : product.specs_en || product.specs || {};
  const brandName = (language === 'fa' ? bootstrap?.company?.name_fa : bootstrap?.company?.name_en)
    || 'پارس پولاد آقایی';

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoHead
        title={name}
        description={summary}
        image={product.image_url}
        canonicalUrl={`/products/${product.slug}`}
        language={language}
        openGraphType="product"
        structuredData={{
          '@type': 'Product',
          name,
          description: summary,
          image: product.image_url,
          sku: product.model_code || undefined,
          category: language === 'fa' ? product.category_fa : product.category_en,
          brand: { '@type': 'Brand', name: brandName },
        }}
      />
      <Breadcrumb
        items={[
          { label: language === 'fa' ? 'محصولات' : 'Products', to: '/products' },
          { label: name },
        ]}
      />

      <article className="grid gap-8 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow) md:grid-cols-2 md:p-8">
        <div className="flex min-h-72 items-center justify-center rounded-xl bg-(--theme-surface-muted) p-5 md:min-h-[28rem]">
          <ZeroBrokenImage
            src={product.image_url}
            alt={name}
            className="max-h-[28rem] w-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-(--theme-primary-ink)">
            {language === 'fa' ? product.category_fa : product.category_en}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-relaxed text-(--theme-text) sm:text-3xl">
            {name}
          </h1>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-(--theme-text-muted)">
            {product.model_code && <span>{language === 'fa' ? 'مدل' : 'Model'}: {product.model_code}</span>}
            {product.standard && <span>{language === 'fa' ? 'استاندارد' : 'Standard'}: {product.standard}</span>}
            {product.pressure_rating && <span>{language === 'fa' ? 'فشار کاری' : 'Pressure rating'}: {product.pressure_rating}</span>}
          </div>
          {summary && <p className="mt-6 text-sm leading-8 text-(--theme-text-muted)">{summary}</p>}

          {Object.keys(specs).length > 0 && (
            <dl className="mt-6 space-y-2 border-t border-(--theme-border) pt-4 text-sm">
              {Object.entries(specs).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-(--theme-text-muted)">{label}</dt>
                  <dd className="text-end font-semibold text-(--theme-text)">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-auto flex flex-wrap gap-3 pt-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl border border-(--theme-border) px-4 py-2.5 text-sm font-semibold text-(--theme-text) transition-colors hover:border-(--theme-primary-ink) hover:text-(--theme-primary-ink)"
            >
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              {language === 'fa' ? 'همه محصولات' : 'All products'}
            </Link>
            {product.catalog_url && (
              <a
                href={product.catalog_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-(--theme-primary) px-4 py-2.5 text-sm font-semibold text-(--theme-primary-foreground) transition-colors hover:bg-(--theme-primary-hover)"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {language === 'fa' ? 'دریافت کاتالوگ فنی' : 'Download technical catalog'}
              </a>
            )}
          </div>
        </div>
      </article>
    </main>
  );
};
