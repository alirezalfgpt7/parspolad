import { o as useAppStore } from "./jsx-runtime-Bazq1AqI.js";
// src/hooks/useCmsPage.ts
var useCmsPage = (slug) => {
	const language = useAppStore((state) => state.language);
	const page = useAppStore((state) => state.bootstrap?.pages.find((item) => item.slug === slug) ?? null);
	const bootstrapOverride = useAppStore((state) => state.bootstrap?.pages_config?.[slug]);
	const previewOverride = useAppStore((state) => state.previewPagesConfig?.[slug]);
	const override = {
		...bootstrapOverride || {},
		...previewOverride || {}
	};
	const cmsTitle = page ? language === "fa" ? page.title_fa : page.title_en : "";
	const cmsSubtitle = page ? language === "fa" ? page.subtitle_fa : page.subtitle_en : "";
	const overrideTitle = language === "fa" ? override.title_fa : override.title_en;
	const overrideSubtitle = language === "fa" ? override.subtitle_fa : override.subtitle_en;
	return {
		page,
		language,
		badge: (language === "fa" ? override.badge_fa : override.badge_en) || "",
		logoUrl: override.logo_url || "",
		title: overrideTitle && overrideTitle.trim() || cmsTitle,
		subtitle: overrideSubtitle && overrideSubtitle.trim() || cmsSubtitle,
		content: page ? language === "fa" ? page.content_fa : page.content_en : "",
		metaTitle: page ? language === "fa" ? page.meta_title || overrideTitle && overrideTitle.trim() || page.title_fa : page.meta_title_en || overrideTitle && overrideTitle.trim() || page.title_en : "",
		metaDescription: page ? language === "fa" ? page.meta_description || "" : page.meta_description_en || page.meta_description || "" : ""
	};
};
export { useCmsPage as t };
