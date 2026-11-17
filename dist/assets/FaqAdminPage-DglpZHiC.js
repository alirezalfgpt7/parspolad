import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { t as Pencil } from "./pencil-DgFD3KzF.js";
import { t as Save } from "./save-CsxfzoRu.js";
import { t as Trash2 } from "./trash-2-uk0pNdI5.js";
import { n as useForm, t as u } from "./zod-DW8XBK3S.js";
import { t as ConfirmDialog } from "./ConfirmDialog-5fpwSoSk.js";
import { t as Pagination } from "./Pagination-Cy7ez7lz.js";
import { a as object, i as number, o as string, r as boolean } from "./schemas-HxyU5SsU.js";
// src/pages/admin/FaqAdminPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var emptyFaq = {
	question_fa: "",
	answer_fa: "",
	sort_order: 0,
	is_active: true
};
var faqSchema = object({
	question_fa: string().trim().min(1, "پرسش الزامی است.").max(500, "پرسش نمی‌تواند بیش از ۵۰۰ نویسه باشد."),
	answer_fa: string().trim().min(1, "پاسخ الزامی است.").max(1e4, "پاسخ بیش از حد طولانی است."),
	sort_order: number().int().min(0, "ترتیب نمی‌تواند منفی باشد."),
	is_active: boolean()
});
var FaqAdminPage = () => {
	const { addToast } = useAppStore();
	const [items, setItems] = (0, import_react.useState)([]);
	const [page, setPage] = (0, import_react.useState)(1);
	const [lastPage, setLastPage] = (0, import_react.useState)(1);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(null);
	const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
		resolver: u(faqSchema),
		defaultValues: emptyFaq
	});
	const load = async (targetPage = page) => {
		const response = await apiRequest(`/admin/faqs?page=${targetPage}&per_page=20`);
		if (targetPage > response.meta.last_page) {
			setPage(Math.max(1, response.meta.last_page));
			return;
		}
		setItems(response.data);
		setLastPage(response.meta.last_page);
	};
	(0, import_react.useEffect)(() => {
		load(page).catch((error) => addToast("error", error instanceof Error ? error.message : "بارگذاری سوالات ناموفق بود."));
	}, [page]);
	const save = async (values) => {
		try {
			await apiRequest(editing ? `/admin/faqs/${editing}` : "/admin/faqs", {
				method: editing ? "PUT" : "POST",
				body: JSON.stringify(values)
			});
			reset(emptyFaq);
			setEditing(null);
			await load();
			addToast("success", "سوال متداول ذخیره شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "ذخیره سوال ناموفق بود.");
		}
	};
	const remove = async () => {
		if (!deleting) return;
		try {
			await apiRequest(`/admin/faqs/${deleting.id}`, { method: "DELETE" });
			setDeleting(null);
			await load();
			addToast("success", "سوال متداول حذف نرم شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "حذف سوال ناموفق بود.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 xl:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit(save),
				className: "space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-lg font-extrabold",
						children: editing ? "ویرایش سوال متداول" : "افزودن سوال متداول"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							maxLength: 500,
							...register("question_fa"),
							placeholder: "پرسش",
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}), errors.question_fa && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							role: "alert",
							className: "text-xs text-red-600",
							children: errors.question_fa.message
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							maxLength: 1e4,
							rows: 6,
							...register("answer_fa"),
							placeholder: "پاسخ",
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}), errors.answer_fa && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							role: "alert",
							className: "text-xs text-red-600",
							children: errors.answer_fa.message
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									...register("is_active")
								}), "فعال"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm",
								children: ["ترتیب", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: 0,
									...register("sort_order", { valueAsNumber: true }),
									className: "w-24 rounded-lg border border-slate-200 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
								})]
							}),
							errors.sort_order && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								role: "alert",
								className: "text-xs text-red-600",
								children: errors.sort_order.message
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							disabled: isSubmitting,
							className: "inline-flex items-center gap-2 rounded-lg bg-(--theme-primary) px-4 py-2 text-sm font-semibold text-white disabled:opacity-60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), "ذخیره"]
						}), editing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setEditing(null);
								reset(emptyFaq);
							},
							className: "rounded-lg border px-4 py-2 text-sm",
							children: "انصراف"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-bold",
							children: item.question_fa
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-slate-600 dark:text-slate-300",
							children: item.answer_fa
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "shrink-0 text-xs text-slate-500",
							children: [
								item.is_active ? "فعال" : "غیرفعال",
								" · ",
								item.sort_order
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setEditing(item.id);
								reset({
									question_fa: item.question_fa,
									answer_fa: item.answer_fa,
									sort_order: item.sort_order,
									is_active: item.is_active
								});
							},
							className: "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" }), "ویرایش"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setDeleting(item),
							className: "inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-700",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), "حذف"]
						})]
					})]
				}, item.id)), items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-slate-500",
					children: "سوالی برای نمایش وجود ندارد."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
				page,
				lastPage,
				onChange: setPage
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(deleting),
				onClose: () => setDeleting(null),
				onConfirm: remove,
				message: "این سوال نرم حذف می‌شود و از سایت عمومی نمایش داده نخواهد شد. ادامه می‌دهید؟"
			})
		]
	});
};
export { FaqAdminPage };
