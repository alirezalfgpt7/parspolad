import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { Q as Download, Z as Eye, k as Modal, ot as Link } from "./index-Dacn8Sc3.js";
import { t as Lock } from "./lock-Ce3l9B4q.js";
import { t as CmsPageIntro } from "./CmsPageIntro-DZsc0ikM.js";
import { t as DataTable } from "./DataTable-CJgvJLS4.js";
import { t as Pagination } from "./Pagination-Cy7ez7lz.js";
import { t as ZeroBrokenImage } from "./ZeroBrokenImage-CvCIOfg-.js";
// src/pages/public/ContractsLicensesPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var ContractsLicensesPage = () => {
	const { language, user, addToast } = useAppStore();
	const [contracts, setContracts] = (0, import_react.useState)([]);
	const [licenses, setLicenses] = (0, import_react.useState)([]);
	const [contractPage, setContractPage] = (0, import_react.useState)(1);
	const [contractLastPage, setContractLastPage] = (0, import_react.useState)(1);
	const [licensePage, setLicensePage] = (0, import_react.useState)(1);
	const [licenseLastPage, setLicenseLastPage] = (0, import_react.useState)(1);
	const [previewLicense, setPreviewLicense] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let active = true;
		Promise.all([apiRequest(`/contracts?page=${contractPage}&per_page=8`), apiRequest(`/licenses?page=${licensePage}&per_page=8`)]).then(([contractResponse, licenseResponse]) => {
			if (!active) return;
			setContracts(contractResponse.data);
			setContractLastPage(contractResponse.meta.last_page);
			setLicenses(licenseResponse.data);
			setLicenseLastPage(licenseResponse.meta.last_page);
		}).catch((error) => {
			if (active) addToast("error", error instanceof Error ? error.message : "دریافت قراردادها و گواهینامه‌ها ناموفق بود.");
		});
		return () => {
			active = false;
		};
	}, [
		contractPage,
		licensePage,
		addToast
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsPageIntro, { slug: "contracts-licenses" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-14",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-5 text-xl font-bold text-slate-900 dark:text-white",
						children: "گواهینامه‌ها و لایسنس‌های استاندارد"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4",
						children: licenses.map((lic) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setPreviewLicense(lic),
								className: "group relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
									src: lic.image_url,
									alt: lic.title_fa,
									className: "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "absolute bottom-2 end-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] text-white",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "بزرگنمایی" })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-1 flex-col justify-between p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-mono text-xs font-bold text-(--theme-primary)",
										children: lic.code
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-1 text-sm font-bold text-slate-900 dark:text-white",
										children: language === "fa" ? lic.title_fa : lic.title_en
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-slate-500",
										children: lic.issuer_fa
									})
								] }), lic.document_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: lic.document_url,
									target: "_blank",
									rel: "noreferrer",
									className: "mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-(--theme-link) hover:underline",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "دانلود گواهینامه PDF" })]
								})]
							})]
						}, lic.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
						page: licensePage,
						lastPage: licenseLastPage,
						onChange: setLicensePage
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-5 text-xl font-bold text-slate-900 dark:text-white",
					children: "فهرست قراردادهای شاخص سرچاهی و درون‌چاهی"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					data: contracts,
					columns: [
						{
							key: "number",
							header: "شماره قرارداد",
							sortValue: (c) => c.contract_number,
							render: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs font-semibold",
								children: c.contract_number
							})
						},
						{
							key: "title",
							header: "موضوع قرارداد",
							sortValue: (c) => c.title_fa,
							render: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold text-slate-900 dark:text-white",
								children: language === "fa" ? c.title_fa : c.title_en
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-slate-500",
								children: c.client_fa
							})] })
						},
						{
							key: "year",
							header: "دوره اجرا",
							sortValue: (c) => c.start_year,
							render: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								c.start_year,
								" – ",
								c.end_year || "جاری"
							] })
						},
						{
							key: "status",
							header: "وضعیت",
							render: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: c.status === "completed" ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold",
								children: c.status === "completed" ? "تکمیل‌شده" : "در حال اجرا"
							})
						},
						{
							key: "doc",
							header: "مستندات",
							render: (c) => c.document_url ? c.requires_auth && (!user || !c.document_url) ? !user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/login",
								className: "inline-flex items-center gap-1 text-xs text-amber-600 hover:underline",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ورود" })]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 text-xs text-slate-400",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "مدرک محافظت‌شده در دسترس نیست" })]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: c.document_url,
								target: "_blank",
								rel: "noreferrer",
								className: "inline-flex items-center gap-1 text-xs font-semibold text-(--theme-primary) hover:underline",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PDF" })]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-slate-400",
								children: "—"
							})
						}
					],
					pageSize: 8,
					searchKeys: [
						(c) => c.title_fa,
						(c) => c.client_fa,
						(c) => c.contract_number
					],
					searchPlaceholder: "جستجو در شماره قرارداد، عنوان یا کارفرما..."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
					page: contractPage,
					lastPage: contractLastPage,
					onChange: setContractPage
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: Boolean(previewLicense),
				onClose: () => setPreviewLicense(null),
				title: previewLicense?.title_fa || "",
				size: "lg",
				children: previewLicense && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
						src: previewLicense.image_url,
						alt: previewLicense.title_fa,
						className: "max-h-[70vh] w-full rounded-lg object-contain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs text-slate-500 tabular-nums",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"صادرکننده: ",
							previewLicense.issuer_fa,
							" · تاریخ صدور: ",
							previewLicense.issue_date
						] }), previewLicense.document_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: previewLicense.document_url,
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex items-center gap-1 font-semibold text-(--theme-primary) hover:underline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "دریافت فایل اصلی" })]
						})]
					})]
				})
			})
		]
	});
};
export { ContractsLicensesPage };
