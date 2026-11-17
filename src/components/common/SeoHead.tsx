import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore.ts';

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

const absoluteWebUrl = (value: string | undefined): string => {
  if (!value) return '';

  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
};

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  image,
  canonicalUrl,
  language = 'fa',
}) => {
  const company = useAppStore((state) => state.bootstrap?.company);
  const seo = useAppStore((state) => state.bootstrap?.seo);
  const brand = (language === 'fa' ? company?.name_fa : company?.name_en)
    || (language === 'fa' ? 'پارس پولاد آقایی' : 'Pars Poolad Aghaee');
  const siteTitle = (language === 'fa' ? seo?.site_title : seo?.site_title_en)
    || seo?.site_title
    || brand;
  const defaultDescription = (language === 'fa' ? seo?.meta_description : seo?.meta_description_en)
    || seo?.meta_description
    || 'طراحی، ساخت و تأمین تجهیزات مهندسی‌شده صنعت نفت، گاز و پتروشیمی.';
  const keywords = (language === 'fa' ? seo?.keywords : seo?.keywords_en) || seo?.keywords || '';
  const robots = ['index,follow', 'noindex,follow', 'noindex,nofollow'].includes(seo?.robots || '')
    ? seo?.robots || 'index,follow'
    : 'index,follow';
  const configuredImage = seo?.meta_image || company?.logo_url || company?.logo_small_url;
  const favicon = absoluteWebUrl(company?.logo_small_url) || '/favicon.ico';

  useEffect(() => {
    const pageTitle = title.trim() || siteTitle;
    const fullTitle = pageTitle === brand || pageTitle === siteTitle
      ? pageTitle
      : `${pageTitle} | ${brand}`;
    const pageDescription = description?.trim() || defaultDescription;
    const canonical = new URL(canonicalUrl || window.location.pathname, window.location.origin);
    canonical.search = '';
    canonical.hash = '';
    const pageUrl = canonical.href;
    const absoluteImage = absoluteWebUrl(image || configuredImage);

    document.title = fullTitle;
    document.documentElement.lang = language;

    setMeta('meta[name="description"]', { name: 'description' }, pageDescription);
    setMeta('meta[name="robots"]', { name: 'robots' }, robots);
    setMeta('meta[property="og:type"]', { property: 'og:type' }, 'website');
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, brand);
    setMeta('meta[property="og:title"]', { property: 'og:title' }, fullTitle);
    setMeta('meta[property="og:description"]', { property: 'og:description' }, pageDescription);
    setMeta('meta[property="og:url"]', { property: 'og:url' }, pageUrl);
    setMeta('meta[property="og:locale"]', { property: 'og:locale' }, language === 'fa' ? 'fa_IR' : 'en_US');
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, absoluteImage ? 'summary_large_image' : 'summary');
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, fullTitle);
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, pageDescription);
    if (keywords) {
      setMeta('meta[name="keywords"]', { name: 'keywords' }, keywords);
    } else {
      document.head.querySelector('meta[name="keywords"]')?.remove();
    }

    if (absoluteImage) {
      setMeta('meta[property="og:image"]', { property: 'og:image' }, absoluteImage);
      setMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, absoluteImage);
    } else {
      document.head.querySelector('meta[property="og:image"]')?.remove();
      document.head.querySelector('meta[name="twitter:image"]')?.remove();
    }

    let faviconLink = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.append(faviconLink);
    }
    faviconLink.href = favicon;

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
  }, [
    title,
    description,
    image,
    canonicalUrl,
    language,
    brand,
    siteTitle,
    defaultDescription,
    keywords,
    robots,
    configuredImage,
    favicon,
  ]);

  return null;
};
