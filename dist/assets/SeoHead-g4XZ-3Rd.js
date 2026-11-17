import { l as require_react, m as __toESM, o as useAppStore } from "./jsx-runtime-Bazq1AqI.js";
// src/components/common/SeoHead.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var setMeta = (selector, attributes, content) => {
	let element = document.head.querySelector(selector);
	if (!element) {
		element = document.createElement("meta");
		for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
		document.head.append(element);
	}
	element.content = content;
};
var absoluteWebUrl = (value) => {
	if (!value) return "";
	try {
		const url = new URL(value, window.location.origin);
		return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
	} catch {
		return "";
	}
};
var SeoHead = ({ title, description, image, canonicalUrl, language = "fa" }) => {
	const company = useAppStore((state) => state.bootstrap?.company);
	const seo = useAppStore((state) => state.bootstrap?.seo);
	const previewLogos = useAppStore((state) => state.previewLogos);
	const logos = useAppStore((state) => state.bootstrap?.logos);
	const brand = (language === "fa" ? company?.name_fa : company?.name_en) || (language === "fa" ? "پارس پولاد آقایی" : "Pars Poolad Aghaee");
	const siteTitle = (language === "fa" ? seo?.site_title : seo?.site_title_en) || seo?.site_title || brand;
	const defaultDescription = (language === "fa" ? seo?.meta_description : seo?.meta_description_en) || seo?.meta_description || "طراحی، ساخت و تأمین تجهیزات مهندسی‌شده صنعت نفت، گاز و پتروشیمی.";
	const keywords = (language === "fa" ? seo?.keywords : seo?.keywords_en) || seo?.keywords || "";
	const robots = [
		"index,follow",
		"noindex,follow",
		"noindex,nofollow"
	].includes(seo?.robots || "") ? seo?.robots || "index,follow" : "index,follow";
	const rawSeoShare = seo?.meta_image || previewLogos?.seo_share || logos?.seo_share || company?.logo_url || company?.logo_small_url;
	const configuredImage = rawSeoShare && !/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(rawSeoShare) ? rawSeoShare : company?.logo_url || "/storage/logos/logo-main.png";
	const rawFavicon = previewLogos?.favicon || logos?.favicon || company?.logo_small_url;
	const favicon = absoluteWebUrl(rawFavicon && !/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(rawFavicon) ? rawFavicon : company?.logo_small_url || "/storage/logos/logo-small.png") || "/favicon.ico";
	(0, import_react.useEffect)(() => {
		const pageTitle = title.trim() || siteTitle;
		const fullTitle = pageTitle === brand || pageTitle === siteTitle ? pageTitle : `${pageTitle} | ${brand}`;
		const pageDescription = description?.trim() || defaultDescription;
		const canonical = new URL(canonicalUrl || window.location.pathname, window.location.origin);
		canonical.search = "";
		canonical.hash = "";
		const pageUrl = canonical.href;
		const absoluteImage = absoluteWebUrl(image || configuredImage);
		document.title = fullTitle;
		document.documentElement.lang = language;
		setMeta("meta[name=\"description\"]", { name: "description" }, pageDescription);
		setMeta("meta[name=\"robots\"]", { name: "robots" }, robots);
		setMeta("meta[property=\"og:type\"]", { property: "og:type" }, "website");
		setMeta("meta[property=\"og:site_name\"]", { property: "og:site_name" }, brand);
		setMeta("meta[property=\"og:title\"]", { property: "og:title" }, fullTitle);
		setMeta("meta[property=\"og:description\"]", { property: "og:description" }, pageDescription);
		setMeta("meta[property=\"og:url\"]", { property: "og:url" }, pageUrl);
		setMeta("meta[property=\"og:locale\"]", { property: "og:locale" }, language === "fa" ? "fa_IR" : "en_US");
		setMeta("meta[name=\"twitter:card\"]", { name: "twitter:card" }, absoluteImage ? "summary_large_image" : "summary");
		setMeta("meta[name=\"twitter:title\"]", { name: "twitter:title" }, fullTitle);
		setMeta("meta[name=\"twitter:description\"]", { name: "twitter:description" }, pageDescription);
		if (keywords) setMeta("meta[name=\"keywords\"]", { name: "keywords" }, keywords);
		else document.head.querySelector("meta[name=\"keywords\"]")?.remove();
		if (absoluteImage) {
			setMeta("meta[property=\"og:image\"]", { property: "og:image" }, absoluteImage);
			setMeta("meta[name=\"twitter:image\"]", { name: "twitter:image" }, absoluteImage);
		} else {
			document.head.querySelector("meta[property=\"og:image\"]")?.remove();
			document.head.querySelector("meta[name=\"twitter:image\"]")?.remove();
		}
		let faviconLink = document.head.querySelector("link[rel=\"icon\"]");
		if (!faviconLink) {
			faviconLink = document.createElement("link");
			faviconLink.rel = "icon";
			document.head.append(faviconLink);
		}
		faviconLink.href = favicon;
		let canonicalLink = document.head.querySelector("link[rel=\"canonical\"]");
		if (!canonicalLink) {
			canonicalLink = document.createElement("link");
			canonicalLink.rel = "canonical";
			document.head.append(canonicalLink);
		}
		canonicalLink.href = pageUrl;
		let schema = document.head.querySelector("script[data-seo-page-schema]");
		if (!schema) {
			schema = document.createElement("script");
			schema.type = "application/ld+json";
			schema.dataset.seoPageSchema = "true";
			document.head.append(schema);
		}
		schema.textContent = JSON.stringify({
			"@context": "https://schema.org",
			"@type": "WebPage",
			name: fullTitle,
			description: pageDescription,
			url: pageUrl,
			inLanguage: language === "fa" ? "fa-IR" : "en-US",
			...absoluteImage ? { primaryImageOfPage: absoluteImage } : {}
		}).replace(/</g, "\\u003c");
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
		favicon
	]);
	return null;
};
export { SeoHead as t };
