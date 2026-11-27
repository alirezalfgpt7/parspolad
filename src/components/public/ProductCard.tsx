import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Download, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Language, Product } from '../../types/index.ts';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';
import '../effects/FlipCard.css';

interface ProductCardProps {
  product: Product;
  language: Language;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, language }) => {
  const [flipped, setFlipped] = useState(false);
  const previousFlipped = useRef(false);
  const frontToggleRef = useRef<HTMLButtonElement>(null);
  const backToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (previousFlipped.current === flipped) return;
    (flipped ? backToggleRef : frontToggleRef).current?.focus({ preventScroll: true });
    previousFlipped.current = flipped;
  }, [flipped]);

  const name = language === 'fa' ? product.name_fa : product.name_en || product.name_fa;
  const summary = language === 'fa' ? product.summary_fa : product.summary_en || product.summary_fa;
  const category = language === 'fa' ? product.category_fa : product.category_en || product.category_fa;
  const specs = language === 'fa' ? product.specs || {} : product.specs_en || product.specs || {};
  const detailsLabel = language === 'fa' ? 'مشاهده جزئیات محصول' : 'View product details';

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) shadow-(--theme-card-shadow) transition-shadow hover:shadow-(--theme-card-shadow-hover)">
      <div
        className="flip-card-container product-card-flip h-full"
        data-flipped={flipped ? 'true' : 'false'}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') setFlipped(true);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') setFlipped(false);
        }}
      >
        <div className="flip-card h-full min-h-[21rem]">
          <div className="flip-card-face flip-card-face--front bg-(--theme-card-surface)">
            <div className="aspect-[16/10] overflow-hidden bg-(--theme-surface-muted) p-3">
              <ZeroBrokenImage
                src={product.image_url}
                alt={name}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="text-[11px] text-(--theme-text-muted)">{category}</p>
              <h2 className="mt-1.5 line-clamp-2 text-sm font-bold leading-6 text-(--theme-text)">
                {name}
              </h2>
              <button
                ref={frontToggleRef}
                type="button"
                aria-expanded={flipped}
                onClick={() => setFlipped(true)}
                className="mt-auto inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-(--theme-border) px-3 py-2 text-xs font-semibold text-(--theme-primary-ink) transition-colors hover:bg-(--theme-surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--theme-primary-ink)"
              >
                {language === 'fa' ? 'اطلاعات فنی' : 'Technical details'}
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flip-card-face flip-card-face--back bg-(--theme-surface-muted) p-4">
            <button
              ref={backToggleRef}
              type="button"
              onClick={() => setFlipped(false)}
              className="mb-2 inline-flex min-h-8 items-center gap-1.5 self-start rounded-md px-2 text-[11px] font-semibold text-(--theme-text-muted) transition-colors hover:bg-(--theme-card-surface) hover:text-(--theme-text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--theme-primary-ink)"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {language === 'fa' ? 'بازگشت به تصویر' : 'Back to image'}
            </button>

            <p className="text-[11px] text-(--theme-text-muted)">{category}</p>
            <h2 className="mt-1 line-clamp-2 text-sm font-bold leading-6 text-(--theme-text)">
              {name}
            </h2>

            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-(--theme-text-muted)">
              {product.model_code && <span className="rounded-md bg-(--theme-card-surface) px-2 py-1">{product.model_code}</span>}
              {product.standard && <span className="rounded-md bg-(--theme-card-surface) px-2 py-1">{product.standard}</span>}
              {product.pressure_rating && <span className="rounded-md bg-(--theme-card-surface) px-2 py-1">{product.pressure_rating}</span>}
            </div>

            {summary && <p className="mt-2 line-clamp-2 text-xs leading-5 text-(--theme-text-muted)">{summary}</p>}

            {Object.keys(specs).length > 0 && (
              <dl className="mt-2 space-y-1 border-t border-(--theme-border) pt-2 text-[10px]">
                {Object.entries(specs).slice(0, 3).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <dt className="text-(--theme-text-muted)">{label}</dt>
                    <dd className="text-end font-semibold text-(--theme-text)">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-auto flex gap-2 pt-3">
              <Link
                to={`/products/${product.slug}`}
                className="inline-flex min-h-9 flex-1 items-center justify-center gap-1 rounded-lg bg-(--theme-primary) px-2 py-2 text-[11px] font-semibold text-(--theme-primary-foreground) transition-colors hover:bg-(--theme-primary-hover)"
              >
                {detailsLabel}
              </Link>
              {product.catalog_url && (
                <a
                  href={product.catalog_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={language === 'fa' ? 'دریافت کاتالوگ فنی PDF' : 'Download technical catalog PDF'}
                  className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-(--theme-border) px-2 py-2 text-[11px] font-semibold text-(--theme-text) transition-colors hover:bg-(--theme-card-surface)"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  PDF
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
