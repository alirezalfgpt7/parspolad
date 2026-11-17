import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { ot as Link } from "./index-Dacn8Sc3.js";
import { t as ConfirmDialog } from "./ConfirmDialog-5fpwSoSk.js";
import { t as Pagination } from "./Pagination-Cy7ez7lz.js";
// src/pages/admin/ArticleCommentsAdminPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var statusLabels = {
	pending: "در انتظار بررسی",
	approved: "منتشرشده",
	rejected: "ردشده"
};
var ArticleCommentsAdminPage = () => {
	const { addToast } = useAppStore();
	const [comments, setComments] = (0, import_react.useState)([]);
	const [page, setPage] = (0, import_react.useState)(1);
	const [lastPage, setLastPage] = (0, import_react.useState)(1);
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("pending");
	const [deleteTarget, setDeleteTarget] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	const load = async (targetPage = page) => {
		const query = new URLSearchParams({
			page: String(targetPage),
			per_page: "20"
		});
		if (statusFilter !== "all") query.set("status", statusFilter);
		const response = await apiRequest(`/admin/comments?${query}`);
		if (targetPage > response.meta.last_page) {
			setPage(Math.max(1, response.meta.last_page));
			return;
		}
		setComments(response.data);
		setLastPage(response.meta.last_page);
	};
	(0, import_react.useEffect)(() => {
		load(page).catch((error) => {
			addToast("error", error instanceof Error ? error.message : "دریافت دیدگاه‌ها ناموفق بود.");
		});
	}, [statusFilter, page]);
	const moderate = async (comment, status) => {
		try {
			await apiRequest(`/admin/comments/${comment.id}`, {
				method: "PUT",
				body: JSON.stringify({ status })
			});
			await load();
			addToast("success", `وضعیت دیدگاه «${statusLabels[status]}» شد.`);
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "تغییر وضعیت دیدگاه ناموفق بود.");
		}
	};
	const deleteComment = async () => {
		if (!deleteTarget) return;
		setDeleting(true);
		try {
			await apiRequest(`/admin/comments/${deleteTarget.id}`, { method: "DELETE" });
			setDeleteTarget(null);
			await load();
			addToast("success", "دیدگاه حذف شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "حذف دیدگاه ناموفق بود.");
		} finally {
			setDeleting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-extrabold",
					children: "مدیریت دیدگاه‌های مقالات"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-slate-500",
					children: "دیدگاه‌ها تا زمان تأیید مدیر برای بازدیدکنندگان نمایش داده نمی‌شوند."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2 text-xs",
					children: ["وضعیت", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: statusFilter,
						onChange: (event) => {
							setStatusFilter(event.target.value);
							setPage(1);
						},
						className: "rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "pending",
								children: "در انتظار بررسی"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "approved",
								children: "منتشرشده"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "rejected",
								children: "ردشده"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "همه"
							})
						]
					})]
				})]
			}),
			comments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900",
				children: "دیدگاهی در این وضعیت وجود ندارد."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: comments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm font-bold",
									children: comment.author_name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300",
									children: statusLabels[comment.status]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
								className: "mt-1 block text-[11px] text-slate-500",
								children: new Date(comment.created_at).toLocaleString("fa-IR")
							})] }), comment.article && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: `/news/${comment.article.slug}`,
								target: "_blank",
								className: "text-xs text-(--theme-primary) hover:underline",
								children: comment.article.title_fa
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 dark:text-slate-300",
							children: comment.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [
								comment.status !== "approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => moderate(comment, "approved"),
									className: "rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800",
									children: "تأیید و انتشار"
								}),
								comment.status !== "rejected" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => moderate(comment, "rejected"),
									className: "rounded-lg border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-700 dark:text-amber-300",
									children: "رد دیدگاه"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setDeleteTarget(comment),
									className: "rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900 dark:text-red-400",
									children: "حذف"
								})
							]
						})
					]
				}, comment.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
				page,
				lastPage,
				onChange: setPage
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(deleteTarget),
				onClose: () => setDeleteTarget(null),
				onConfirm: deleteComment,
				message: "آیا از حذف این دیدگاه اطمینان دارید؟",
				loading: deleting
			})
		]
	});
};
export { ArticleCommentsAdminPage };
