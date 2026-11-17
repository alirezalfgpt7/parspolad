import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { t as Pencil } from "./pencil-DgFD3KzF.js";
import { t as Plus } from "./plus-DOUCSCbs.js";
import { t as Trash2 } from "./trash-2-uk0pNdI5.js";
import { t as ColorPicker } from "./ColorPicker-BC4bX_Le.js";
import { t as ConfirmDialog } from "./ConfirmDialog-5fpwSoSk.js";
import { t as DataTable } from "./DataTable-CJgvJLS4.js";
import { t as MediaUrlField } from "./MediaUrlField-xcz31gVx.js";
import { k as Modal } from "./index-Dacn8Sc3.js";
import { t as Pagination } from "./Pagination-Cy7ez7lz.js";
import { a as object, i as number, o as string, r as boolean, t as _enum } from "./schemas-HxyU5SsU.js";
import { t as SearchableSelect } from "./SearchableSelect-BCBuOYhg.js";
import { t as ZeroBrokenImage } from "./ZeroBrokenImage-CvCIOfg-.js";
// src/pages/admin/ProjectsAdminPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var projectFormSchema = object({
	slug: string().max(160).nullish(),
	title_fa: string().trim().min(1, "عنوان فارسی پروژه الزامی است.").max(255),
	title_en: string().trim().min(1, "عنوان انگلیسی پروژه الزامی است.").max(255),
	category_id: number().int().positive("دسته‌بندی پروژه را انتخاب کنید."),
	client_name_fa: string().trim().min(1, "نام کارفرما الزامی است.").max(255),
	client_name_en: string().trim().min(1, "نام انگلیسی کارفرما الزامی است.").max(255),
	contract_number: string().trim().min(1, "شماره قرارداد الزامی است.").max(120),
	contract_type_fa: string().max(120).nullish(),
	contract_type_en: string().max(120).nullish(),
	location_fa: string().max(200).nullish(),
	location_en: string().max(200).nullish(),
	year: number().int().min(1348).max(1450),
	status: _enum([
		"completed",
		"in_progress",
		"planned",
		"contracted"
	]),
	summary_fa: string().trim().min(1, "خلاصه پروژه الزامی است."),
	summary_en: string().nullish(),
	description_fa: string().nullish(),
	description_en: string().nullish(),
	cover_image: string().trim().min(1, "تصویر کاور پروژه الزامی است.").max(255),
	is_featured: boolean().optional()
});
var categoryFormSchema = object({
	slug: string().trim().min(1).max(120),
	name_fa: string().trim().min(1, "نام فارسی دسته الزامی است.").max(255),
	name_en: string().trim().min(1, "نام انگلیسی دسته الزامی است.").max(255),
	icon: string().max(80).optional(),
	color: string().regex(/^#[0-9A-Fa-f]{6}$/, "رنگ دسته باید کد HEX معتبر باشد."),
	description_fa: string().optional()
});
var ProjectsAdminPage = () => {
	const { addToast, fetchBootstrap } = useAppStore();
	const [projects, setProjects] = (0, import_react.useState)([]);
	const [page, setPage] = (0, import_react.useState)(1);
	const [lastPage, setLastPage] = (0, import_react.useState)(1);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [categories, setCategories] = (0, import_react.useState)([]);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [catModal, setCatModal] = (0, import_react.useState)(null);
	const [deleteId, setDeleteId] = (0, import_react.useState)(null);
	const [deletingProject, setDeletingProject] = (0, import_react.useState)(false);
	const load = async (targetPage = page) => {
		setLoading(true);
		const [pr, ct] = await Promise.all([apiRequest(`/admin/projects?page=${targetPage}&per_page=8`), apiRequest("/admin/categories")]);
		if (targetPage > pr.meta.last_page) {
			setPage(Math.max(1, pr.meta.last_page));
			setLoading(false);
			return;
		}
		setProjects(pr.data);
		setLastPage(pr.meta.last_page);
		setCategories(ct.data);
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		load(page).catch((error) => {
			setLoading(false);
			addToast("error", error instanceof Error ? error.message : "بارگذاری پروژه‌ها ناموفق بود.");
		});
	}, [page]);
	const saveProject = async (e) => {
		e.preventDefault();
		if (!editing) return;
		const parsed = projectFormSchema.safeParse(editing);
		if (!parsed.success) {
			addToast("error", parsed.error.issues[0]?.message ?? "اطلاعات پروژه معتبر نیست.");
			return;
		}
		try {
			if (editing.id) await apiRequest(`/admin/projects/${editing.id}`, {
				method: "PUT",
				body: JSON.stringify({
					...editing,
					...parsed.data
				})
			});
			else await apiRequest("/admin/projects", {
				method: "POST",
				body: JSON.stringify({
					...editing,
					...parsed.data,
					images: [parsed.data.cover_image],
					videos: [],
					documents: [],
					standards: ["API 6A", "ISO 9001"]
				})
			});
			setEditing(null);
			await load();
			addToast("success", "پروژه ذخیره شد.");
		} catch (err) {
			addToast("error", err instanceof Error ? err.message : "خطا در ذخیره");
		}
	};
	const saveCategory = async (e) => {
		e.preventDefault();
		if (!catModal) return;
		const parsed = categoryFormSchema.safeParse(catModal);
		if (!parsed.success) {
			addToast("error", parsed.error.issues[0]?.message ?? "اطلاعات دسته‌بندی معتبر نیست.");
			return;
		}
		try {
			if (catModal.id) await apiRequest(`/admin/categories/${catModal.id}`, {
				method: "PUT",
				body: JSON.stringify(parsed.data)
			});
			else await apiRequest("/admin/categories", {
				method: "POST",
				body: JSON.stringify(parsed.data)
			});
			setCatModal(null);
			await load();
			await fetchBootstrap();
			addToast("success", "دسته‌بندی فنی ذخیره شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "خطا در ذخیره دسته‌بندی");
		}
	};
	const confirmDeleteProject = async () => {
		if (deleteId === null) return;
		setDeletingProject(true);
		try {
			await apiRequest(`/admin/projects/${deleteId}`, { method: "DELETE" });
			setDeleteId(null);
			await load();
			addToast("success", "پروژه حذف شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "حذف پروژه ناموفق بود.");
		} finally {
			setDeletingProject(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-extrabold",
					children: "مدیریت پروژه‌ها و دسته‌بندی‌های فنی"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setCatModal({
							name_fa: "",
							name_en: "",
							slug: `cat-${Date.now()}`,
							icon: "Layers",
							color: "#B91C1C"
						}),
						className: "rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900",
						children: "+ دسته فنی جدید"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setEditing({
							slug: `proj-${Date.now()}`,
							title_fa: "",
							title_en: "",
							category_id: categories[0]?.id || 1,
							client_name_fa: "",
							client_name_en: "",
							contract_number: "",
							contract_type_fa: "ساخت و تولید",
							contract_type_en: "Manufacturing",
							location_fa: "اهواز",
							location_en: "Ahvaz",
							year: 1404,
							status: "in_progress",
							summary_fa: "",
							summary_en: "",
							description_fa: "",
							description_en: "",
							cover_image: "/storage/hero/hero-rig.jpg",
							is_featured: true
						}),
						style: { backgroundColor: "var(--theme-primary)" },
						className: "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "پروژه جدید" })]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-3.5 w-3.5 rounded shrink-0",
							style: { backgroundColor: c.color }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-xs font-bold",
							children: c.name_fa
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setCatModal(c),
						className: "text-xs text-(--theme-primary) hover:underline shrink-0",
						children: "ویرایش"
					})]
				}, c.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				data: projects,
				columns: [
					{
						key: "title",
						header: "عنوان پروژه",
						sortValue: (p) => p.title_fa,
						render: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
									src: p.cover_image,
									alt: p.title_fa,
									className: "h-full w-full object-cover"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: p.title_fa
							})]
						})
					},
					{
						key: "client",
						header: "کارفرما",
						render: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.client_name_fa })
					},
					{
						key: "contract",
						header: "شماره قرارداد",
						render: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs",
							children: p.contract_number
						})
					},
					{
						key: "year",
						header: "سال",
						sortValue: (p) => p.year,
						render: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.year })
					},
					{
						key: "actions",
						header: "عملیات",
						render: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setEditing(p),
								className: "rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setDeleteId(p.id),
								className: "rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
							})]
						})
					}
				],
				pageSize: 8,
				loading,
				searchKeys: [
					(p) => p.title_fa,
					(p) => p.client_name_fa,
					(p) => p.contract_number
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
				page,
				lastPage,
				onChange: setPage
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: Boolean(editing),
				onClose: () => setEditing(null),
				title: editing?.id ? "ویرایش پروژه" : "افزودن پروژه جدید",
				size: "lg",
				children: editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: saveProject,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "mb-1 block text-xs font-medium",
								children: "عنوان فارسی پروژه"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								value: editing.title_fa || "",
								onChange: (e) => setEditing({
									...editing,
									title_fa: e.target.value
								}),
								className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "mb-1 block text-xs font-medium",
								children: "عنوان انگلیسی"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								dir: "ltr",
								value: editing.title_en || "",
								onChange: (e) => setEditing({
									...editing,
									title_en: e.target.value
								}),
								className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
									label: "دسته فنی",
									options: categories.map((c) => ({
										value: String(c.id),
										label: c.name_fa
									})),
									value: String(editing.category_id || ""),
									onChange: (v) => setEditing({
										...editing,
										category_id: Number(v)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1 block text-xs font-medium",
									children: "کارفرما"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									required: true,
									value: editing.client_name_fa || "",
									onChange: (e) => setEditing({
										...editing,
										client_name_fa: e.target.value
									}),
									className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1 block text-xs font-medium",
									children: "کارفرما (انگلیسی)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									required: true,
									dir: "ltr",
									value: editing.client_name_en || "",
									onChange: (e) => setEditing({
										...editing,
										client_name_en: e.target.value
									}),
									className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1 block text-xs font-medium",
									children: "شماره قرارداد"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									required: true,
									dir: "ltr",
									value: editing.contract_number || "",
									onChange: (e) => setEditing({
										...editing,
										contract_number: e.target.value
									}),
									className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1 block text-xs font-medium",
									children: "سال اجرا"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: editing.year || 1404,
									onChange: (e) => setEditing({
										...editing,
										year: Number(e.target.value)
									}),
									className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1 block text-xs font-medium",
									children: "موقعیت جغرافیایی"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: editing.location_fa || "",
									onChange: (e) => setEditing({
										...editing,
										location_fa: e.target.value
									}),
									className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
									label: "وضعیت",
									options: [
										{
											value: "in_progress",
											label: "در حال اجرا"
										},
										{
											value: "completed",
											label: "تکمیل‌شده"
										},
										{
											value: "contracted",
											label: "قرارداد شده"
										}
									],
									value: editing.status || "in_progress",
									onChange: (v) => setEditing({
										...editing,
										status: v
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mb-1 block text-xs font-medium",
							children: "خلاصه و شرح فنی"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							rows: 3,
							value: editing.summary_fa || "",
							onChange: (e) => setEditing({
								...editing,
								summary_fa: e.target.value,
								description_fa: e.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaUrlField, {
							label: "تصویر کاور یا مدرک فنی پروژه",
							value: editing.cover_image || "",
							onChange: (url) => setEditing({
								...editing,
								cover_image: url
							}),
							folder: "projects",
							placeholder: "/storage/hero/hero-rig.jpg"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setEditing(null),
								className: "rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-700",
								children: "انصراف"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								style: { backgroundColor: "var(--theme-primary)" },
								className: "rounded-lg px-5 py-2 text-xs font-semibold text-white",
								children: "ذخیره پروژه"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: Boolean(catModal),
				onClose: () => setCatModal(null),
				title: "مدیریت دسته‌بندی فنی",
				size: "sm",
				children: catModal && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: saveCategory,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mb-1 block text-xs font-medium",
							children: "نام فارسی دسته"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							value: catModal.name_fa || "",
							onChange: (e) => setCatModal({
								...catModal,
								name_fa: e.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mb-1 block text-xs font-medium",
							children: "نام انگلیسی"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							dir: "ltr",
							value: catModal.name_en || "",
							onChange: (e) => setCatModal({
								...catModal,
								name_en: e.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPicker, {
							label: "رنگ دسته فنی",
							value: catModal.color || "#B91C1C",
							onChange: (c) => setCatModal({
								...catModal,
								color: c
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setCatModal(null),
								className: "rounded-lg border border-slate-200 px-4 py-2 text-xs dark:border-slate-700",
								children: "انصراف"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								style: { backgroundColor: "var(--theme-primary)" },
								className: "rounded-lg px-4 py-2 text-xs font-semibold text-white",
								children: "ذخیره"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(deleteId),
				onClose: () => setDeleteId(null),
				message: "آیا از حذف این پروژه اطمینان دارید؟",
				onConfirm: confirmDeleteProject,
				loading: deletingProject
			})
		]
	});
};
export { ProjectsAdminPage };
