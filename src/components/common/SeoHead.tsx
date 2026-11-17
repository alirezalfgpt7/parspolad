import React, { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
  language?: 'fa' | 'en';
}

const setMeta = (selector: string, attributes: Record<string, string>, content: string): void => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    document.head.append(element);
  }
  element.content = content;
};

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  image,
  canonicalUrl,
  language = 'fa',
}) => {
  useEffect(() => {
    const brand = language === 'fa' ? 'پارس پولاد آقایی' : 'Pars Poolad Aghaee';
    const pageTitle = title.trim() || brand;
    const fullTitle = pageTitle === brand ? brand : `${pageTitle} | ${brand}`;
    const pageDescription = description?.trim()
      || 'طراحی، ساخت و تأمین تجهیزات مهندسی‌شده صنعت نفت، گاز و پتروشیمی.';
    const canonical = new URL(canonicalUrl || window.location.pathname, window.location.origin);
    canonical.search = '';
    canonical.hash = '';
    const pageUrl = canonical.href;
    const absoluteImage = image ? new URL(image, window.location.origin).href : '';

    document.title = fullTitle;
    document.documentElement.lang = language;

    setMeta('meta[name="description"]', { name: 'description' }, pageDescription);
    setMeta('meta[property="og:type"]', { property: 'og:type' }, 'website');
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, brand);
    setMeta('meta[property="og:title"]', { property: 'og:title' }, fullTitle);
    setMeta('meta[property="og:description"]', { property: 'og:description' }, pageDescription);
    setMeta('meta[property="og:url"]', { property: 'og:url' }, pageUrl);
    setMeta('meta[property="og:locale"]', { property: 'og:locale' }, language === 'fa' ? 'fa_IR' : 'en_US');
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, absoluteImage ? 'summary_large_image' : 'summary');
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, fullTitle);
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, pageDescription);

    if (absoluteImage) {
      setMeta('meta[property="og:image"]', { property: 'og:image' }, absoluteImage);
      setMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, absoluteImage);
    } else {
      document.head.querySelector('meta[property="og:image"]')?.remove();
      document.head.querySelector('meta[name="twitter:image"]')?.remove();
    }

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.append(canonicalLink);
    }
    canonicalLink.href = pageUrl;

    let schema = document.head.querySelector<HTMLScriptElement>('script[data-seo-page-schema]');
    if (!schema) {
      schema = document.createElement('script');
      schema.type = 'application/ld+json';
      schema.dataset.seoPageSchema = 'true';
      document.head.append(schema);
    }
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: fullTitle,
      description: pageDescription,
      url: pageUrl,
      inLanguage: language === 'fa' ? 'fa-IR' : 'en-US',
      ...(absoluteImage ? { primaryImageOfPage: absoluteImage } : {}),
    }).replace(/</g, '\\u003c');
  }, [title, description, image, canonicalUrl, language]);

  return null;
};
