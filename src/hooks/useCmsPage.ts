import { useAppStore } from '../store/useAppStore.ts';

export const useCmsPage = (slug: string) => {
  const language = useAppStore((state) => state.language);
  const page = useAppStore((state) => state.bootstrap?.pages.find((item) => item.slug === slug) ?? null);

  return {
    page,
    title: page ? (language === 'fa' ? page.title_fa : page.title_en) : '',
    subtitle: page ? (language === 'fa' ? page.subtitle_fa : page.subtitle_en) : '',
    content: page ? (language === 'fa' ? page.content_fa : page.content_en) : '',
    metaTitle: page ? (language === 'fa' ? page.meta_title || page.title_fa : page.title_en) : '',
    metaDescription: page?.meta_description ?? '',
  };
};
