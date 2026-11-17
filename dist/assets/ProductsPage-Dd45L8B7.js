import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { Q as Download, S as AnimatedTabsEffect, W as Layers } from "./index-Dacn8Sc3.js";
import { t as CmsPageIntro } from "./CmsPageIntro-DZsc0ikM.js";
import { t as Pagination } from "./Pagination-Cy7ez7lz.js";
import { t as SearchableSelect } from "./SearchableSelect-BCBuOYhg.js";
import { t as ZeroBrokenImage } from "./ZeroBrokenImage-CvCIOfg-.js";
// src/pages/public/ProductsPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var ProductsPage = () => {
	const { language, addToast } = useAppStore();
	const [products, setProducts] = (0, import_react.useState)([]);
	const [categoryFilters, setCategoryFilters] = (0, import_react.useState)([]);
	const [catFilter, setCatFilter] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(1);
	const [lastPage, setLastPage] = (0, import_react.useState)(1);
	(0, import_react.useEffect)(() => {
		apiRequest("/products/filters").then((response) => setCategoryFilters(response.data)).catch((error) => addToast("error", error instanceof Error ? error.message : "دریافت دسته‌های محصولات ناموفق بود."));
	}, [addToast]);
	(0, import_react.useEffect)(() => {
		const query = new URLSearchParams({
			page: String(page),
			per_page: "9"
		});
		if (catFilter) query.set("category", catFilter);
		apiRequest(`/products?${query.toString()}`).then((response) => {
			setProducts(response.data);
			setLastPage(response.meta.last_page);
		}).catch((error) => addToast("error", error instanceof Error ? error.message : "دریافت محصولات ناموفق بود."));
	}, [
		catFilter,
		page,
		addToast
	]);
	const categories = (0, import_react.useMemo)(() => {
		return [{
			value: "",
			label: language === "fa" ? "همه دسته‌های تجهیزاتی" : "All Categories"
		}, ...categoryFilters.map((category) => ({
			value: language === "fa" ? category.category_fa : category.category_en,
			label: language === "fa" ? category.category_fa : category.category_en
		}))];
	}, [categoryFilters, language]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsPageIntro, { slug: "products" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto pb-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedTabsEffect, {
						items: categories.map((cat) => ({
							id: cat.value,
							label: cat.label,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-3.5 w-3.5" })
						})),
						activeId: catFilter,
						onChange: (next) => {
							setCatFilter(next);
							setPage(1);
						}
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full shrink-0 sm:w-64",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
						options: categories,
						value: catFilter,
						onChange: (value) => {
							setCatFilter(value);
							setPage(1);
						},
						placeholder: language === "fa" ? "فیلتر بر اساس دسته فنی..." : "Filter by category...",
						allowClear: true
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
				children: products.map((pr) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-56 bg-slate-50 p-4 dark:bg-slate-800/50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
							src: pr.image_url,
							alt: pr.name_fa,
							className: "h-full w-full object-contain"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-1 flex-col justify-between p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2 text-xs text-slate-500",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: language === "fa" ? pr.category_fa : pr.category_en }), pr.model_code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono font-semibold",
									children: pr.model_code
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 text-base font-bold text-slate-900 dark:text-white",
								children: language === "fa" ? pr.name_fa : pr.name_en
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300",
								children: language === "fa" ? pr.summary_fa : pr.summary_en
							}),
							Object.keys(pr.specs).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
								className: "mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs dark:border-slate-800",
								children: Object.entries(pr.specs).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-slate-500",
										children: k
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "font-medium text-slate-800 dark:text-slate-200 tabular-nums",
										children: v
									})]
								}, k))
							})
						] }), pr.catalog_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: pr.catalog_url,
							target: "_blank",
							rel: "noreferrer",
							className: "mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:border-(--theme-primary) hover:text-(--theme-primary) dark:border-slate-700 dark:text-slate-200",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "دریافت کاتالوگ فنی PDF" })]
						})]
					})]
				}, pr.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
				page,
				lastPage,
				onChange: setPage
			})
		]
	});
};
export { ProductsPage };
