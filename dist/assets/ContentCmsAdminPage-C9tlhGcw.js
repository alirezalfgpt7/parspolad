import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { t as Plus } from "./plus-DOUCSCbs.js";
import { t as Save } from "./save-CsxfzoRu.js";
import { t as Trash2 } from "./trash-2-uk0pNdI5.js";
import { t as RichTextEditor } from "./RichTextEditor-Cl-tKHcM.js";
import { n as gregorianToJalali, t as PersianDatePicker } from "./PersianDatePicker-Tb3-es4g.js";
import { t as ConfirmDialog } from "./ConfirmDialog-5fpwSoSk.js";
import { t as MediaUrlField } from "./MediaUrlField-xcz31gVx.js";
import { t as ZeroBrokenImage } from "./ZeroBrokenImage-CvCIOfg-.js";
// src/pages/admin/ContentCmsAdminPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var getTodayJalali = () => {
	const date = /* @__PURE__ */ new Date();
	const localDate = [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, "0"),
		String(date.getDate()).padStart(2, "0")
	].join("-");
	return gregorianToJalali(localDate);
};
var ContentCmsAdminPage = () => {
	const { addToast, fetchBootstrap } = useAppStore();
	const [tab, setTab] = (0, import_react.useState)("pages");
	const [pages, setPages] = (0, import_react.useState)([]);
	const [services, setServices] = (0, import_react.useState)([]);
	const [products, setProducts] = (0, import_react.useState)([]);
	const [articles, setArticles] = (0, import_react.useState)([]);
	const [banners, setBanners] = (0, import_react.useState)([]);
	const [kpis, setKpis] = (0, import_react.useState)([]);
	const [editPage, setEditPage] = (0, import_react.useState)(null);
	const [newArticleTitle, setNewArticleTitle] = (0, import_react.useState)("");
	const [newArticleDate, setNewArticleDate] = (0, import_react.useState)(getTodayJalali);
	const [deleteArticle, setDeleteArticle] = (0, import_react.useState)(null);
	const [deletingArticle, setDeletingArticle] = (0, import_react.useState)(false);
	const load = async () => {
		const [pg, sv, pr, ar, bn, kp] = await Promise.all([
			apiRequest("/admin/pages"),
			apiRequest("/admin/services"),
			apiRequest("/admin/products"),
			apiRequest("/admin/articles"),
			apiRequest("/admin/banners"),
			apiRequest("/admin/kpis")
		]);
		setPages(pg.data);
		setServices(sv.data);
		setProducts(pr.data);
		setArticles(ar.data);
		setBanners(bn.data);
		setKpis(kp.data);
		if (!editPage && pg.data[0]) setEditPage(pg.data[0]);
	};
	(0, import_react.useEffect)(() => {
		load().catch(() => {});
	}, []);
	const confirmDeleteArticle = async () => {
		if (!deleteArticle) return;
		setDeletingArticle(true);
		try {
			await apiRequest(`/admin/articles/${deleteArticle.id}`, { method: "DELETE" });
			setDeleteArticle(null);
			await load();
			addToast("success", "مقاله حذف شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "حذف مقاله ناموفق بود.");
		} finally {
			setDeletingArticle(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900",
				children: [
					{
						key: "pages",
						label: "صفحات داینامیک"
					},
					{
						key: "services",
						label: "خدمات مهندسی"
					},
					{
						key: "products",
						label: "محصولات"
					},
					{
						key: "articles",
						label: "اخبار و مقالات"
					},
					{
						key: "banners",
						label: "بنرها و CTA"
					},
					{
						key: "kpis",
						label: "شمارنده‌های آماری"
					}
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(t.key),
					className: `rounded-lg px-4 py-2 text-xs font-semibold ${tab === t.key ? "bg-(--theme-primary) text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`,
					children: t.label
				}, t.key))
			}),
			tab === "pages" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2 lg:col-span-3",
					children: pages.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setEditPage(p),
						className: `block w-full rounded-xl border p-3.5 text-start text-xs font-bold ${editPage?.id === p.id ? "border-(--theme-primary) bg-red-50/40 dark:bg-red-950/30" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`,
						children: p.title_fa
					}, p.id))
				}), editPage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 rounded-xl border border-slate-200 bg-white p-5 lg:col-span-9 dark:border-slate-800 dark:bg-slate-900",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: editPage.title_fa,
							onChange: (e) => setEditPage({
								...editPage,
								title_fa: e.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: editPage.subtitle_fa,
							onChange: (e) => setEditPage({
								...editPage,
								subtitle_fa: e.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaUrlField, {
							label: "تصویر کاور / پیش‌نمایش صفحه (Meta Image)",
							value: editPage.meta_image || "",
							onChange: (url) => setEditPage({
								...editPage,
								meta_image: url
							}),
							folder: "pages",
							accept: ".jpg,.jpeg,.png,.webp,.gif",
							placeholder: "/storage/hero/hero-banner.jpg"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichTextEditor, {
							label: "محتوای صفحه",
							value: editPage.content_fa,
							onChange: (html) => setEditPage({
								...editPage,
								content_fa: html
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: async () => {
								await apiRequest(`/admin/pages/${editPage.id}`, {
									method: "PUT",
									body: JSON.stringify(editPage)
								});
								addToast("success", "صفحه ذخیره شد.");
								load();
							},
							style: { backgroundColor: "var(--theme-primary)" },
							className: "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ذخیره تغییرات صفحه" })]
						})
					]
				})]
			}),
			tab === "articles" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[1fr_220px_auto]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: newArticleTitle,
							onChange: (e) => setNewArticleTitle(e.target.value),
							placeholder: "عنوان مقاله یا خبر جدید...",
							className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-xs",
							children: ["تاریخ انتشار", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersianDatePicker, {
								value: newArticleDate,
								onChange: setNewArticleDate,
								className: "mt-1"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: async () => {
								if (!newArticleTitle.trim() || !newArticleDate) {
									addToast("error", "عنوان و تاریخ انتشار را وارد کنید.");
									return;
								}
								await apiRequest("/admin/articles", {
									method: "POST",
									body: JSON.stringify({
										slug: `news-${Date.now()}`,
										title_fa: newArticleTitle,
										title_en: newArticleTitle,
										excerpt_fa: "گزارش فنی شرکت پارس پولاد آقایی",
										excerpt_en: "Pars Poolad Technical Report",
										content_fa: `<p>${newArticleTitle}</p>`,
										content_en: `<p>${newArticleTitle}</p>`,
										category_fa: "اخبار شرکت",
										category_en: "Corporate News",
										cover_image: "/storage/hero/hero-rig.jpg",
										author_fa: "روابط عمومی و مهندسی",
										published_at: newArticleDate,
										read_minutes: 3
									})
								});
								setNewArticleTitle("");
								setNewArticleDate(getTodayJalali());
								load();
								addToast("success", "مقاله منتشر شد.");
							},
							style: { backgroundColor: "var(--theme-primary)" },
							className: "inline-flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-semibold text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "انتشار" })]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: articles.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3 min-w-0",
							children: [a.cover_image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
									src: a.cover_image,
									alt: a.title_fa,
									className: "h-full w-full object-cover"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-sm font-bold",
									children: a.title_fa
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-xs text-slate-500",
									children: a.published_at
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setDeleteArticle(a),
							className: "shrink-0 text-red-600",
							"aria-label": "حذف مقاله",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
						})]
					}, a.id))
				})]
			}),
			(tab === "services" || tab === "products" || tab === "banners" || tab === "kpis") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: (tab === "services" ? services : tab === "products" ? products : tab === "banners" ? banners : kpis).map((item) => {
					const thumb = typeof item.image_url === "string" ? item.image_url : "";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [thumb && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
									src: thumb,
									alt: String(item.title_fa || item.name_fa || ""),
									className: "h-full w-full object-cover"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-sm font-bold",
									children: String(item.title_fa || item.name_fa || item.label_fa)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-xs text-slate-500",
									children: String(item.summary_fa || item.model_code || item.subtitle_fa || `مقدار فعلی: ${item.value} ${item.suffix_fa}`)
								})]
							})]
						}), tab === "kpis" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								defaultValue: Number(item.value),
								id: `kpi-input-${item.id}`,
								className: "w-28 rounded-lg border border-slate-200 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: async () => {
									const el = document.getElementById(`kpi-input-${item.id}`);
									const nextVal = el ? Number(el.value) : Number(item.value);
									if (!Number.isNaN(nextVal)) {
										await apiRequest(`/admin/kpis/${item.id}`, {
											method: "PUT",
											body: JSON.stringify({ value: nextVal })
										});
										await fetchBootstrap();
										load();
										addToast("success", "آمار داشبورد بروزرسانی شد.");
									}
								},
								className: "rounded-lg bg-(--theme-primary) px-3 py-1 text-xs font-semibold text-white",
								children: "ذخیره KPI"
							})]
						})]
					}, Number(item.id));
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(deleteArticle),
				onClose: () => setDeleteArticle(null),
				onConfirm: confirmDeleteArticle,
				message: "آیا از حذف این مقاله اطمینان دارید؟",
				loading: deletingArticle
			})
		]
	});
};
export { ContentCmsAdminPage };
