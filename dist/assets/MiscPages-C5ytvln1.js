import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { l as Error404Effect, nt as ChevronDown, ot as Link } from "./index-Dacn8Sc3.js";
import { n as Win11BootSpinnerEffect } from "./Spinners-C6y5-qh3.js";
import { t as BrandLogo } from "./BrandLogo-BGj8yBVG.js";
import { t as CmsPageIntro } from "./CmsPageIntro-DZsc0ikM.js";
import { t as Pagination } from "./Pagination-Cy7ez7lz.js";
import { t as useCmsPage } from "./useCmsPage-CoEg_6AT.js";
import { t as sanitizeHtml } from "./sanitizeHtml-B1l_T8WV.js";
import { s as DEFAULT_PAGES_CONFIG } from "./ZeroBrokenImage-CvCIOfg-.js";
// src/pages/public/MiscPages.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var FaqPage = () => {
	const language = useAppStore((state) => state.language);
	const [openIdx, setOpenIdx] = (0, import_react.useState)(0);
	const [faqs, setFaqs] = (0, import_react.useState)([]);
	const [page, setPage] = (0, import_react.useState)(1);
	const [lastPage, setLastPage] = (0, import_react.useState)(1);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		apiRequest(`/faqs?page=${page}&per_page=20`).then((response) => {
			if (page > response.meta.last_page) {
				setPage(Math.max(1, response.meta.last_page));
				return;
			}
			setFaqs(response.data);
			setLastPage(response.meta.last_page);
			setOpenIdx(response.data[0]?.id ?? null);
			setError("");
		}).catch(() => setError("دریافت سوالات متداول با خطا روبه‌رو شد."));
	}, [page]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsPageIntro, {
				slug: "faq",
				className: "mb-6"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "text-sm text-red-600",
					children: error
				}) : faqs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-slate-500",
					children: "سوال متداولی ثبت نشده است."
				}) : faqs.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setOpenIdx(openIdx === item.id ? null : item.id),
						className: "flex w-full items-center justify-between gap-4 p-4 text-start text-sm font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: language === "fa" ? item.question_fa : item.question_en || item.question_fa }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `h-4 w-4 shrink-0 transition-transform ${openIdx === item.id ? "rotate-180" : ""}` })]
					}), openIdx === item.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300",
						children: language === "fa" ? item.answer_fa : item.answer_en || item.answer_fa
					})]
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
				page,
				lastPage,
				onChange: setPage
			})
		]
	});
};
var LegalPage = () => {
	const { content } = useCmsPage("legal");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsPageIntro, {
			slug: "legal",
			className: "mb-6",
			showContent: false
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "prose max-w-none text-sm leading-8 dark:prose-invert",
				dangerouslySetInnerHTML: { __html: sanitizeHtml(content) }
			})
		})]
	});
};
var SitemapPage = () => {
	const { language, addToast } = useAppStore();
	const [links, setLinks] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		apiRequest("/sitemap").then((response) => setLinks(response.data)).catch((error) => addToast("error", error instanceof Error ? error.message : "دریافت نقشه سایت ناموفق بود."));
	}, [addToast]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsPageIntro, {
			slug: "sitemap",
			className: "mb-6"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-extrabold",
					children: "نقشه سایت (HTML & XML Sitemap)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/sitemap.xml",
					target: "_blank",
					rel: "noreferrer",
					className: "text-xs font-semibold text-(--theme-primary) hover:underline",
					children: "مشاهده sitemap.xml"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2",
				children: links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: link.path,
					className: "rounded-lg border border-slate-100 px-4 py-3 text-sm font-medium hover:border-(--theme-primary) dark:border-slate-800",
					children: language === "fa" ? link.title_fa : link.title_en
				}, link.path))
			})]
		})]
	});
};
var MaintenancePage = () => {
	const { bootstrap, previewPagesConfig, language } = useAppStore();
	const cfg = {
		...DEFAULT_PAGES_CONFIG.maintenance,
		...bootstrap?.pages_config?.maintenance || {},
		...previewPagesConfig?.maintenance || {}
	};
	const title = (language === "fa" ? cfg.title_fa : cfg.title_en) || "حالت بروزرسانی فنی سامانه";
	const subtitle = bootstrap?.site?.maintenance_message_fa || (language === "fa" ? cfg.subtitle_fa : cfg.subtitle_en) || "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 h-20 w-20 overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-2 shadow-lg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLogo, {
					placement: "preloader",
					overrideUrl: cfg.logo_url,
					alt: title,
					className: "h-full w-full"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Win11BootSpinnerEffect, { className: "my-2 text-amber-400" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 text-2xl font-extrabold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-md text-sm text-slate-300",
				children: subtitle
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				className: "mt-6 rounded-lg bg-(--theme-primary) px-5 py-2 text-xs font-semibold text-white",
				children: language === "fa" ? "ورود مدیران سیستم" : "Admin Sign In"
			})
		]
	});
};
var ErrorPage = ({ code }) => {
	const { bootstrap, previewPagesConfig, language } = useAppStore();
	const key = `error_${code}`;
	const cfg = {
		...DEFAULT_PAGES_CONFIG[key] || DEFAULT_PAGES_CONFIG.error_404,
		...bootstrap?.pages_config?.[key] || {},
		...previewPagesConfig?.[key] || {}
	};
	const title = (language === "fa" ? cfg.title_fa : cfg.title_en) || `Error ${code}`;
	const subtitle = (language === "fa" ? cfg.subtitle_fa : cfg.subtitle_en) || "";
	const ctaLabel = (language === "fa" ? cfg.cta_fa : cfg.cta_en) || (language === "fa" ? "بازگشت به صفحه اصلی" : "Return Home");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Error404Effect, {
		code,
		title,
		subtitle,
		ctaLabel,
		logoElement: cfg.logo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-14 w-14 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLogo, {
				overrideUrl: cfg.logo_url,
				alt: title,
				className: "h-full w-full"
			})
		}) : void 0
	});
};
export { ErrorPage, FaqPage, LegalPage, MaintenancePage, SitemapPage };
