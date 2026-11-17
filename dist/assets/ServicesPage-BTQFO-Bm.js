import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { $ as CircleCheck, F as Settings, b as CardRevealStack, j as Wrench, ot as Link } from "./index-Dacn8Sc3.js";
import { t as Compass } from "./compass-DQdKoZhD.js";
import { t as CmsPageIntro } from "./CmsPageIntro-DZsc0ikM.js";
import { t as Pagination } from "./Pagination-Cy7ez7lz.js";
import { t as ZeroBrokenImage } from "./ZeroBrokenImage-CvCIOfg-.js";
// src/pages/public/ServicesPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var ServicesPage = () => {
	const { language, addToast } = useAppStore();
	const [services, setServices] = (0, import_react.useState)([]);
	const [page, setPage] = (0, import_react.useState)(1);
	const [lastPage, setLastPage] = (0, import_react.useState)(1);
	(0, import_react.useEffect)(() => {
		apiRequest(`/services?page=${page}&per_page=8`).then((response) => {
			setServices(response.data);
			setLastPage(response.meta.last_page);
		}).catch((error) => addToast("error", error instanceof Error ? error.message : "بارگذاری خدمات ناموفق بود."));
	}, [page]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsPageIntro, { slug: "services" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardRevealStack, { items: [
					{
						id: "01",
						badge: language === "fa" ? "گام ۱" : "Step 1",
						title: language === "fa" ? "نیازسنجی و مهندسی معکوس" : "Field Survey & R&D",
						description: language === "fa" ? "بازدید میدانی، اسکن سه‌بعدی قطعات و تدوین نقشه‌های ساخت." : "Dimensional scanning, material assay & detailed manufacturing drawings.",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "h-5 w-5" })
					},
					{
						id: "02",
						badge: language === "fa" ? "گام ۲" : "Step 2",
						title: language === "fa" ? "ساخت و ماشین‌کاری CNC" : "Heavy CNC Fabrication",
						description: language === "fa" ? "تولید با تلرانس میکرونی و عملیات حرارتی کنترل‌شده." : "Tight-tolerance multi-axis machining and certified heat treatment.",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-5 w-5" })
					},
					{
						id: "03",
						badge: language === "fa" ? "گام ۳" : "Step 3",
						title: language === "fa" ? "تست فشار و بازرسی فنی" : "Witness Hydro Testing",
						description: language === "fa" ? "آزمون هیدرواستاتیک و NDT با صدور گواهی‌نامه معتبر." : "Full pressure & NDT validation with third-party witness.",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5" })
					},
					{
						id: "04",
						badge: language === "fa" ? "گام ۴" : "Step 4",
						title: language === "fa" ? "نصب و خدمات پس از تحویل" : "Commissioning & Support",
						description: language === "fa" ? "پشتیبانی کامل بهره‌برداری در میادین نفت و گاز." : "On-site commissioning, maintenance & rapid spare dispatch.",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-5 w-5" })
					}
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-8",
				children: services.map((svc, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-12 dark:border-slate-800 dark:bg-slate-900",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64 md:col-span-5 md:h-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
							src: svc.image_url,
							alt: svc.title_fa,
							className: "h-full w-full object-cover"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col justify-between p-6 sm:p-8 md:col-span-7",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-bold text-(--theme-primary) tabular-nums",
								children: [String((page - 1) * 8 + idx + 1).padStart(2, "0"), "."]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1.5 text-xl font-bold text-slate-900 dark:text-white",
								children: language === "fa" ? svc.title_fa : svc.title_en
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300",
								children: language === "fa" ? svc.summary_fa : svc.summary_en
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400",
								children: language === "fa" ? svc.description_fa : svc.description_en
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/rfq",
								className: "rounded-lg bg-(--theme-primary) px-4 py-2 text-xs font-semibold text-white whitespace-nowrap",
								children: language === "fa" ? "درخواست مشاوره و استعلام" : "Request Service Quote"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/products",
								className: "rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap",
								children: language === "fa" ? "مشاهده تجهیزات مرتبط" : "View Equipment"
							})]
						})]
					})]
				}, svc.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
				page,
				lastPage,
				onChange: setPage
			})
		]
	});
};
export { ServicesPage };
