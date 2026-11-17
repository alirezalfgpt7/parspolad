import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { C as PagePreloader, Q as Download, ct as useParams, ot as Link } from "./index-Dacn8Sc3.js";
import { t as Lock } from "./lock-Ce3l9B4q.js";
import { t as SeoHead } from "./SeoHead-g4XZ-3Rd.js";
import { t as Breadcrumb } from "./Breadcrumb-C4l8Yv4F.js";
import { t as ZeroBrokenImage } from "./ZeroBrokenImage-CvCIOfg-.js";
// src/pages/public/ProjectDetailPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var ProjectDetailPage = () => {
	const { slug } = useParams();
	const { language, user } = useAppStore();
	const [project, setProject] = (0, import_react.useState)(null);
	const [activeImage, setActiveImage] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!slug) return;
		apiRequest(`/projects/${slug}`).then((res) => {
			setProject(res.data);
			setActiveImage(res.data.cover_image);
		}).catch(() => setProject(null));
	}, [slug]);
	if (!project) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PagePreloader, { label: "در حال دریافت اطلاعات پروژه..." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeoHead, {
				title: language === "fa" ? project.title_fa : project.title_en,
				description: language === "fa" ? project.description_fa : project.description_en,
				image: project.cover_image,
				language
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumb, { items: [{
				label: language === "fa" ? "پروژه‌ها" : "Projects",
				to: "/projects"
			}, { label: language === "fa" ? project.title_fa : project.title_en }] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-8 lg:grid-cols-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 lg:col-span-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
								src: activeImage || project.cover_image,
								alt: project.title_fa,
								className: "h-full w-full object-cover"
							})
						}),
						project.images.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-3",
							children: project.images.map((img, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setActiveImage(img),
								className: `h-20 w-28 overflow-hidden rounded-lg border-2 transition-colors ${activeImage === img ? "border-(--theme-primary)" : "border-transparent"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
									src: img,
									alt: "",
									className: "h-full w-full object-cover"
								})
							}, i))
						}),
						project.videos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl border border-slate-200 bg-slate-950 p-3 dark:border-slate-800",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
								src: project.videos[0],
								controls: true,
								className: "max-h-80 w-full rounded-xl"
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6 lg:col-span-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: project.category?.name_fa }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["سال ", project.year] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: project.status === "completed" ? "تکمیل‌شده" : "در حال اجرا" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-2 text-2xl font-extrabold text-slate-900 dark:text-white",
								children: language === "fa" ? project.title_fa : project.title_en
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300",
								children: language === "fa" ? project.description_fa : project.description_en
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-6 space-y-2.5 border-t border-slate-100 pt-4 text-xs dark:border-slate-800 tabular-nums",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-slate-500",
											children: "کارفرما"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "font-semibold",
											children: project.client_name_fa
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-slate-500",
											children: "شماره قرارداد"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "font-mono font-semibold",
											children: project.contract_number
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-slate-500",
											children: "نوع قرارداد"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "font-semibold",
											children: project.contract_type_fa
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-slate-500",
											children: "موقعیت جغرافیایی"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "font-semibold",
											children: project.location_fa
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-slate-500",
											children: "استانداردها"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "font-mono font-semibold",
											children: project.standards.join(" · ")
										})]
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-bold text-slate-900 dark:text-white",
							children: "مدارک فنی و مستندات قابل دانلود"
						}), project.documents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-xs text-slate-500",
							children: "فایل فنی عمومی برای این پروژه پیوست نشده است. جهت دریافت مدارک از فرم استعلام استفاده نمایید."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-2.5",
							children: project.documents.map((doc) => {
								return doc.requires_auth && !user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/login",
									className: "flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [doc.title_fa, " (مخصوص کاربران ثبت‌نام‌شده)"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 shrink-0" })]
								}, doc.id) : !doc.file_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-700",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [doc.title_fa, " · فایل محافظت‌شده در دسترس نیست"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 shrink-0" })]
								}, doc.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: doc.file_url,
									target: "_blank",
									rel: "noreferrer",
									className: "flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold hover:border-(--theme-primary) dark:border-slate-700",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										doc.title_fa,
										" · ",
										doc.file_type
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 text-(--theme-primary) shrink-0" })]
								}, doc.id);
							})
						})]
					})]
				})]
			})
		]
	});
};
export { ProjectDetailPage };
