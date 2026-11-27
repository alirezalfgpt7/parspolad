import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SeoHead } from './SeoHead.tsx';

describe('SeoHead', () => {
  afterEach(() => {
    document.head.querySelector('script[data-seo-page-schema]')?.remove();
    document.head.querySelector('link[rel="canonical"]')?.remove();
  });

  it('updates bilingual social metadata, canonical URL, and page schema', () => {
    render(
      <SeoHead
        title="Wellhead Projects"
        description="Engineering and manufacturing"
        image="/projects/cover.jpg"
        canonicalUrl="/projects/wellhead"
        language="en"
      />,
    );

    expect(document.title).toBe('Wellhead Projects | Pars Poolad Aghaee');
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image');
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(`${window.location.origin}/projects/wellhead`);
    expect(document.querySelector<HTMLScriptElement>('script[data-seo-page-schema]')?.textContent).toContain('"inLanguage":"en-US"');
  });

  it('uses product Open Graph and structured data when provided', () => {
    render(
      <SeoHead
        title="Hydraulic Liner Hanger"
        description="A hydraulic liner hanger"
        image="/storage/products/liner-hanger.webp"
        canonicalUrl="/products/hydraulic-liner-hanger"
        openGraphType="product"
        structuredData={{ '@type': 'Product', sku: 'PPA-LH-01' }}
      />,
    );

    expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('product');
    expect(document.querySelector<HTMLScriptElement>('script[data-seo-page-schema]')?.textContent)
      .toContain('"sku":"PPA-LH-01"');
  });
});
