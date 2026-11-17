import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { L as Search, ot as Link } from "./index-Dacn8Sc3.js";
import { t as CmsPageIntro } from "./CmsPageIntro-DZsc0ikM.js";
import { t as Pagination } from "./Pagination-Cy7ez7lz.js";
import { t as SearchableSelect } from "./SearchableSelect-BCBuOYhg.js";
import { t as ZeroBrokenImage } from "./ZeroBrokenImage-CvCIOfg-.js";
// src/pages/public/ProjectsPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var ProjectsPage = () => {
	const { language, addToast } = useAppStore();
	const [filterOptions, setFilterOptions] = (0, import_react.useState)({
		categories: [],
		years: [],
		clients: [],
		locations: [],
		contract_types: []
	});
	const [projects, setProjects] = (0, import_react.useState)([]);
	const [page, setPage] = (0, import_react.useState)(1);
	const [lastPage, setLastPage] = (0, import_react.useState)(1);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [category, setCategory] = (0, import_react.useState)("");
	const [year, setYear] = (0, import_react.useState)("");
	const [client, setClient] = (0, import_react.useState)("");
	const [location, setLocation] = (0, import_react.useState)("");
	const [contractType, setContractType] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("");
	const [q, setQ] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let active = true;
		apiRequest("/projects/filters").then((response) => {
			if (active) setFilterOptions(response.data);
		}).catch((error) => {
			if (active) addToast("error", error instanceof Error ? error.message : "دریافت گزینه‌های فیلتر پروژه ناموفق بود.");
		});
		return () => {
			active = false;
		};
	}, [addToast]);
	(0, import_react.useEffect)(() => {
		const params = new URLSearchParams({
			page: String(page),
			per_page: "6"
		});
		if (category) params.set("category", category);
		if (year) params.set("year", year);
		if (client) params.set("client", client);
		if (location) params.set("location", location);
		if (contractType) params.set("contract_type", contractType);
		if (status) params.set("status", status);
		if (q) params.set("q", q);
		setLoading(true);
		let active = true;
		const timer = window.setTimeout(() => {
			apiRequest(`/projects?${params.toString()}`).then((res) => {
				if (active) {
					setProjects(res.data);
					setLastPage(res.meta.last_page);
				}
			}).catch((error) => {
				if (active) addToast("error", error instanceof Error ? error.message : "دریافت فهرست پروژه‌ها ناموفق بود.");
			}).finally(() => {
				if (active) setLoading(false);
			});
		}, 250);
		return () => {
			active = false;
			window.clearTimeout(timer);
		};
	}, [
		category,
		year,
		client,
		location,
		contractType,
		status,
		q,
		page,
		addToast
	]);
	const categoryOpts = (0, import_react.useMemo)(() => [{
		value: "",
		label: "همه دسته‌های فنی"
	}, ...filterOptions.categories.map((c) => ({
		value: c.slug,
		label: language === "fa" ? c.name_fa : c.name_en
	}))], [filterOptions.categories, language]);
	const yearOpts = (0, import_react.useMemo)(() => {
		return [{
			value: "",
			label: "همه سال‌ها"
		}, ...filterOptions.years.map((value) => ({
			value: String(value),
			label: String(value)
		}))];
	}, [filterOptions.years]);
	const clientOpts = (0, import_react.useMemo)(() => {
		return [{
			value: "",
			label: "همه کارفرمایان"
		}, ...filterOptions.clients.map((client) => {
			const value = client.client_name_fa || client.client_name_en || "";
			return {
				value: language === "fa" ? client.client_name_fa || value : client.client_name_en || value,
				label: language === "fa" ? client.client_name_fa || value : client.client_name_en || value
			};
		})];
	}, [filterOptions.clients, language]);
	const locationOpts = (0, import_react.useMemo)(() => {
		return [{
			value: "",
			label: "همه موقعیت‌ها"
		}, ...filterOptions.locations.map((location) => {
			const value = location.location_fa || location.location_en || "";
			return {
				value: language === "fa" ? location.location_fa || value : location.location_en || value,
				label: language === "fa" ? location.location_fa || value : location.location_en || value
			};
		})];
	}, [filterOptions.locations, language]);
	const typeOpts = (0, import_react.useMemo)(() => {
		return [{
			value: "",
			label: "همه انواع قرارداد"
		}, ...filterOptions.contract_types.map((contractType) => {
			const value = contractType.contract_type_fa || contractType.contract_type_en || "";
			return {
				value: language === "fa" ? contractType.contract_type_fa || value : contractType.contract_type_en || value,
				label: language === "fa" ? contractType.contract_type_fa || value : contractType.contract_type_en || value
			};
		})];
	}, [filterOptions.contract_types, language]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsPageIntro, {
				slug: "projects",
				className: "mb-8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300",
							children: "جستجوی متنی (عنوان یا شماره قرارداد)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: q,
								onChange: (e) => {
									setQ(e.target.value);
									setPage(1);
								},
								placeholder: "جستجو...",
								className: "h-10.5 w-full rounded-lg border border-slate-200 bg-white pe-3 ps-9 text-sm focus:border-(--theme-primary) focus:outline-none dark:border-slate-700 dark:bg-slate-900"
							})]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
							label: "دسته‌بندی فنی",
							options: categoryOpts,
							value: category,
							onChange: (v) => {
								setCategory(v);
								setPage(1);
							},
							allowClear: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
							label: "سال اجرا",
							options: yearOpts,
							value: year,
							onChange: (v) => {
								setYear(v);
								setPage(1);
							},
							allowClear: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
							label: "کارفرما",
							options: clientOpts,
							value: client,
							onChange: (v) => {
								setClient(v);
								setPage(1);
							},
							allowClear: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
							label: "موقعیت جغرافیایی",
							options: locationOpts,
							value: location,
							onChange: (v) => {
								setLocation(v);
								setPage(1);
							},
							allowClear: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
							label: "نوع قرارداد",
							options: typeOpts,
							value: contractType,
							onChange: (v) => {
								setContractType(v);
								setPage(1);
							},
							allowClear: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
							label: "وضعیت پروژه",
							options: [
								{
									value: "",
									label: "همه وضعیت‌ها"
								},
								{
									value: "completed",
									label: "تکمیل‌شده"
								},
								{
									value: "in_progress",
									label: "در حال اجرا"
								},
								{
									value: "planned",
									label: "در برنامه‌ریزی"
								},
								{
									value: "contracted",
									label: "قراردادشده"
								}
							],
							value: status,
							onChange: (value) => {
								setStatus(value);
								setPage(1);
							},
							allowClear: true
						})
					]
				})
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
				children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-80 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" }, i))
			}) : projects.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900",
				children: "پروژه‌ای با فیلترهای انتخاب‌شده یافت نشد."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
				children: projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: `/projects/${p.slug}`,
					className: "group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-52 overflow-hidden bg-slate-100 dark:bg-slate-800",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
							src: p.cover_image,
							alt: p.title_fa,
							className: "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-1 flex-col justify-between p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.category?.name_fa }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.year }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.location_fa })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 text-base font-bold text-slate-900 group-hover:text-(--theme-primary) dark:text-white",
								children: language === "fa" ? p.title_fa : p.title_en
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-300",
								children: language === "fa" ? p.summary_fa : p.summary_en
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: p.client_name_fa
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono",
								children: p.contract_number
							})]
						})]
					})]
				}, p.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
				page,
				lastPage,
				onChange: setPage
			})
		]
	});
};
export { ProjectsPage };
