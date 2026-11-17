import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { C as PagePreloader, Q as Download, _ as EffectAction, at as Award, b as CardRevealStack, h as HueFilterMedia, t as WaveHeroEffect, v as DecorativeCube, w as EffectText } from "./index-Dacn8Sc3.js";
import { n as Cpu, t as Flame } from "./flame-CSG2tNU7.js";
import { t as ShieldCheck } from "./shield-check-Dq3Mld6F.js";
import { t as BrandLogo } from "./BrandLogo-BGj8yBVG.js";
import { t as SeoHead } from "./SeoHead-g4XZ-3Rd.js";
import { t as Breadcrumb } from "./Breadcrumb-C4l8Yv4F.js";
import { t as sanitizeHtml } from "./sanitizeHtml-B1l_T8WV.js";
// src/pages/public/AboutPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var AboutPage = () => {
	const language = useAppStore((s) => s.language);
	const [page, setPage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		apiRequest("/pages/about").then((r) => setPage(r.data)).catch((requestError) => setError(requestError instanceof Error ? requestError.message : "دریافت صفحه ناموفق بود."));
	}, []);
	const metadata = page?.metadata ?? {};
	const imageUrl = typeof metadata.image_url === "string" ? metadata.image_url : "";
	const downloads = [1, 2].flatMap((index) => {
		const url = metadata[`download_${index}_url`];
		const labelFa = metadata[`download_${index}_label_fa`];
		const labelEn = metadata[`download_${index}_label_en`];
		return typeof url === "string" && typeof labelFa === "string" && typeof labelEn === "string" ? [{
			url,
			label: language === "fa" ? labelFa : labelEn
		}] : [];
	});
	const pillars = [
		{
			id: "api",
			badge: "API 6A / 11D1",
			title: language === "fa" ? "طراحی مطابق استانداردهای API" : "API Engineered Design",
			description: language === "fa" ? "محاسبات تنش و مدل‌سازی المان محدود برای تجهیزات فشار بالای سرچاهی تا ۱۵,۰۰۰ PSI." : "FEA thermal & pressure modeling for high-integrity wellhead equipment up to 15,000 PSI.",
			meta: language === "fa" ? "گواهی‌نامه معتبر مهندسی" : "Certified Engineering",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "h-5 w-5" })
		},
		{
			id: "metallurgy",
			badge: "CNC / 5-Axis",
			title: language === "fa" ? "ماشین‌کاری دقیق و متالورژی" : "Precision Machining",
			description: language === "fa" ? "تراشکاری سنگین فولادهای آلیاژی AISI 4140 و اینکونل مقاوم در برابر گاز ترش H2S." : "Heavy CNC machining of AISI 4140 & Inconel alloys resistant to sour gas service.",
			meta: language === "fa" ? "کنترل ابعادی لیزری" : "Laser Metrology",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cpu, { className: "h-5 w-5" })
		},
		{
			id: "testing",
			badge: "NDT & Hydro",
			title: language === "fa" ? "آزمون هیدرواستاتیک و غیرمخرب" : "Hydrostatic & NDT Labs",
			description: language === "fa" ? "تست فشار هیدرواستاتیک، التراسونیک و ذرات مغناطیسی در حضور بازرس کارفرما." : "Full witness hydrostatic pressure, UT, MT & PT testing prior to dispatch.",
			meta: language === "fa" ? "انطباق کامل کیفیت" : "Zero-Defect QA",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5" })
		},
		{
			id: "field",
			badge: "EPC Support",
			title: language === "fa" ? "پشتیبانی میدانی میادین نفتی" : "Field & Rig Deployment",
			description: language === "fa" ? "نصب، راه‌اندازی، تعمیرات اساسی پکرها و شیرآلات سرچاهی در میادین خشکی و دریایی." : "Turnkey installation, overhauling & emergency support across onshore & offshore fields.",
			meta: language === "fa" ? "اهواز و عسلویه" : "Ahvaz & Asaluyeh",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "h-5 w-5" })
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeoHead, {
				title: page ? language === "fa" ? page.meta_title : page.meta_title_en || page.title_en : "",
				description: page ? language === "fa" ? page.meta_description : page.meta_description_en || page.meta_description : "",
				image: page?.meta_image || imageUrl,
				canonicalUrl: page?.canonical_url || void 0,
				language
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumb, { items: [{ label: language === "fa" ? "درباره شرکت" : "About Us" }] }),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm text-red-600",
				children: error
			}) : !page ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PagePreloader, { label: "در حال دریافت محتوا..." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 text-white dark:border-slate-800",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-6 px-6 pt-8 pb-16 sm:px-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-slate-950 p-1 shadow-xl",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLogo, {
										placement: "about",
										alt: page.title_fa,
										className: "h-full w-full"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-1 text-xs font-semibold text-amber-400",
										children: language === "fa" ? "درباره ما" : "About Us"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "text-2xl font-extrabold sm:text-3xl",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectText, {
											inverse: true,
											children: language === "fa" ? page.title_fa : page.title_en
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1.5 text-sm text-slate-300",
										children: language === "fa" ? page.subtitle_fa : page.subtitle_en
									})
								] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DecorativeCube, {
								size: "lg",
								className: "h-20 w-20 shrink-0 rounded-2xl border border-white/15 bg-white/5"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute inset-x-0 bottom-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveHeroEffect, {
								bottomFill: "var(--theme-bg)",
								tintRgb: "255 255 255",
								heightClassName: "!h-12"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid items-start gap-8 lg:grid-cols-12",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-5 lg:col-span-7",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "prose max-w-none text-sm leading-8 text-slate-700 dark:prose-invert dark:text-slate-300",
								dangerouslySetInnerHTML: { __html: sanitizeHtml(language === "fa" ? page.content_fa : page.content_en) }
							}), downloads.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2",
								children: downloads.map((download) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(EffectAction, {
									as: "a",
									href: download.url,
									target: "_blank",
									rel: "noreferrer",
									className: "flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: download.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 text-(--theme-primary)" })]
								}, download.url))
							})]
						}), imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/5 p-3 lg:col-span-5 dark:border-slate-800",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HueFilterMedia, {
								mode: "hue-circle",
								src: imageUrl,
								alt: page.title_fa,
								className: "mx-auto h-72 w-full rounded-xl object-cover"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-extrabold text-slate-900 dark:text-white",
							children: language === "fa" ? "ارکان مهندسی و تضمین کیفیت" : "Engineering & QA Pillars"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardRevealStack, { items: pillars })]
					})
				]
			})
		]
	});
};
export { AboutPage };
