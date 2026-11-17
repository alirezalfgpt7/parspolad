import { l as require_react, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { t as Breadcrumb } from "./Breadcrumb-C4l8Yv4F.js";
import { t as BrandLogo } from "./BrandLogo-BGj8yBVG.js";
import { t as SeoHead } from "./SeoHead-g4XZ-3Rd.js";
import { t as useCmsPage } from "./useCmsPage-CoEg_6AT.js";
import { t as sanitizeHtml } from "./sanitizeHtml-B1l_T8WV.js";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var CmsPageIntro = ({ slug, className = "mb-10", titleClassName = "text-3xl font-extrabold text-slate-900 dark:text-white", showContent = true }) => {
	const { page, title, subtitle, content, metaTitle, metaDescription, language, badge, logoUrl } = useCmsPage(slug);
	if (!page) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeoHead, {
			title: metaTitle,
			description: metaDescription,
			image: page.meta_image || void 0,
			canonicalUrl: page.canonical_url || void 0,
			language
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumb, { items: [{ label: title }] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-4",
					children: [logoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xs dark:border-slate-800 dark:bg-slate-900",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLogo, {
							overrideUrl: logoUrl,
							alt: title,
							className: "h-full w-full"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1.5 inline-block rounded-md bg-(--theme-primary)/10 px-2.5 py-0.5 text-xs font-bold text-(--theme-primary)",
							children: badge
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: titleClassName,
							children: title
						})]
					})]
				}),
				subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300",
					children: subtitle
				}),
				showContent && content && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "prose mt-3 max-w-none text-sm leading-relaxed text-slate-600 dark:prose-invert dark:text-slate-300",
					dangerouslySetInnerHTML: { __html: sanitizeHtml(content) }
				})
			]
		})
	] });
};
export { CmsPageIntro as t };
