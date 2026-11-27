import { useAppStore } from '../store/useAppStore.ts';

export const useCmsPage = (slug: string) => {
  const language = useAppStore((state) => state.language);
  const page = useAppStore((state) => state.bootstrap?.pages.find((item) => item.slug === slug) ?? null);
  const bootstrapOverride = useAppStore((state) => state.bootstrap?.pages_config?.[slug]);
  const previewOverride = useAppStore((state) => state.previewPagesConfig?.[slug]);
  const override = { ...(bootstrapOverride || {}), ...(previewOverride || {}) };

  const cmsTitle = page ? (language === 'fa' ? page.title_fa : page.title_en) : '';
  const cmsSubtitle = page ? (language === 'fa' ? page.subtitle_fa : page.subtitle_en) : '';
  const metadataValue = (key: string): string | undefined => {
    const value = page?.metadata?.[key];
    return typeof value === 'string' ? value : undefined;
  };
  const pageBadge = metadataValue(language === 'fa' ? 'badge_fa' : 'badge_en');
  const legacyBadge = language === 'fa' ? override.badge_fa : override.badge_en;

  return {
    page,
    language,
    badge: pageBadge ?? legacyBadge ?? '',
    logoUrl: metadataValue('logo_url') ?? override.logo_url ?? '',
    title: cmsTitle,
    subtitle: cmsSubtitle,
    content: page ? (language === 'fa' ? page.content_fa : page.content_en) : '',
    metaTitle: page
      ? language === 'fa'
        ? page.meta_title || page.title_fa
        : page.meta_title_en || page.title_en
      : '',
    metaDescription: page
      ? language === 'fa'
        ? page.meta_description || page.subtitle_fa || ''
        : page.meta_description_en || page.meta_description || page.subtitle_en || page.subtitle_fa || ''
      : '',
  };
};
