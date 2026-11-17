import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { t as Plus } from "./plus-DOUCSCbs.js";
import { t as Save } from "./save-CsxfzoRu.js";
import { t as Trash2 } from "./trash-2-uk0pNdI5.js";
import { t as FileUploader } from "./FileUploader-BJ54GFf2.js";
import { t as ConfirmDialog } from "./ConfirmDialog-5fpwSoSk.js";
// src/pages/admin/MegaMenuAdminPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var MegaMenuAdminPage = () => {
	const { fetchBootstrap, addToast } = useAppStore();
	const [menus, setMenus] = (0, import_react.useState)([]);
	const [selectedMenuId, setSelectedMenuId] = (0, import_react.useState)(1);
	const [deleteTarget, setDeleteTarget] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		apiRequest("/admin/menus").then((r) => setMenus(r.data)).catch(() => {});
	}, []);
	const currentMenu = menus.find((m) => m.id === selectedMenuId);
	const updateItem = (idx, patch) => {
		if (!currentMenu) return;
		const nextItems = currentMenu.items.map((item, i) => i === idx ? {
			...item,
			...patch
		} : item);
		setMenus((prev) => prev.map((m) => m.id === currentMenu.id ? {
			...m,
			items: nextItems
		} : m));
	};
	const addChild = (idx) => {
		if (!currentMenu) return;
		const parent = currentMenu.items[idx];
		const child = {
			id: Date.now(),
			menu_id: currentMenu.id,
			parent_id: parent.id,
			title_fa: "زیرمنو جدید",
			title_en: "New Submenu",
			url: "/products",
			image: "/storage/products/liner-hanger.webp",
			description_fa: "توضیح کوتاه مگا منو",
			sort_order: (parent.children?.length || 0) + 1,
			is_active: true
		};
		updateItem(idx, { children: [...parent.children || [], child] });
	};
	const addRootItem = () => {
		if (!currentMenu) return;
		const item = {
			id: Date.now(),
			menu_id: currentMenu.id,
			parent_id: null,
			title_fa: "آیتم منوی جدید",
			title_en: "New Menu Item",
			url: "/",
			image: "",
			description_fa: "",
			sort_order: currentMenu.items.length + 1,
			is_active: true
		};
		setMenus((prev) => prev.map((menu) => menu.id === currentMenu.id ? {
			...menu,
			items: [...menu.items, item]
		} : menu));
	};
	const removeRootItem = (idx) => {
		if (!currentMenu) return;
		setMenus((prev) => prev.map((menu) => menu.id === currentMenu.id ? {
			...menu,
			items: menu.items.filter((_, itemIndex) => itemIndex !== idx)
		} : menu));
	};
	const confirmDelete = () => {
		if (!deleteTarget) return;
		if (deleteTarget.type === "root") removeRootItem(deleteTarget.index);
		else {
			const parent = currentMenu?.items[deleteTarget.parentIndex];
			if (parent) updateItem(deleteTarget.parentIndex, { children: (parent.children || []).filter((_, idx) => idx !== deleteTarget.childIndex) });
		}
		setDeleteTarget(null);
	};
	const saveMenu = async () => {
		if (!currentMenu) return;
		await apiRequest(`/admin/menus/${currentMenu.id}`, {
			method: "PUT",
			body: JSON.stringify({ items: currentMenu.items })
		});
		await fetchBootstrap();
		addToast("success", "منو و مگا منو با موفقیت بروزرسانی شد.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-extrabold",
				children: "مدیریت مگا منو و منوهای هدر/فوتر"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-slate-500",
				children: "تعریف آیتم‌های منو و زیرمنوهای تصویری مگا منو"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [
					menus.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setSelectedMenuId(m.id),
						className: `rounded-lg px-3.5 py-2 text-xs font-semibold ${selectedMenuId === m.id ? "bg-(--theme-primary) text-white" : "border border-slate-200 dark:border-slate-700"}`,
						children: m.title_fa
					}, m.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: addRootItem,
						className: "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "آیتم اصلی جدید" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: saveMenu,
						className: "inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ذخیره منو" })]
					})
				]
			})]
		}), currentMenu && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-4",
			children: currentMenu.items.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-slate-200 bg-white p-5 space-y-4 dark:border-slate-800 dark:bg-slate-900",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: item.title_fa,
								onChange: (e) => updateItem(idx, { title_fa: e.target.value }),
								placeholder: "عنوان فارسی",
								className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								dir: "ltr",
								value: item.title_en,
								onChange: (e) => updateItem(idx, { title_en: e.target.value }),
								placeholder: "English Title",
								className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								dir: "ltr",
								value: item.url,
								onChange: (e) => updateItem(idx, { url: e.target.value }),
								placeholder: "/url",
								className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setDeleteTarget({
										type: "root",
										index: idx
									}),
									"aria-label": "حذف آیتم اصلی",
									className: "rounded-lg p-2 text-red-600 hover:bg-red-50",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
								}), currentMenu.key === "header" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => addChild(idx),
									className: "inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "زیرمنو تصویری" })]
								})]
							})
						]
					}),
					item.children && item.children.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 dark:border-slate-800",
						children: item.children.map((ch, cIdx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: ch.title_fa,
										onChange: (e) => {
											const nextChildren = item.children.map((c, j) => j === cIdx ? {
												...c,
												title_fa: e.target.value
											} : c);
											updateItem(idx, { children: nextChildren });
										},
										className: "flex-1 rounded border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setDeleteTarget({
											type: "child",
											parentIndex: idx,
											childIndex: cIdx
										}),
										className: "text-red-600 p-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									dir: "ltr",
									value: ch.url,
									onChange: (e) => {
										const nextChildren = item.children.map((c, j) => j === cIdx ? {
											...c,
											url: e.target.value
										} : c);
										updateItem(idx, { children: nextChildren });
									},
									className: "w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUploader, {
									folder: "menus",
									currentUrl: ch.image,
									label: ch.image ? "تغییر تصویر آیتم مگامنو" : "آپلود تصویر مگامنو",
									onUploaded: (url) => {
										const nextChildren = item.children.map((c, j) => j === cIdx ? {
											...c,
											image: url
										} : c);
										updateItem(idx, { children: nextChildren });
									}
								})
							]
						}, ch.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
						open: Boolean(deleteTarget),
						onClose: () => setDeleteTarget(null),
						onConfirm: confirmDelete,
						message: "این آیتم و زیرمنوهای وابسته از منو حذف خواهند شد. ادامه می‌دهید؟"
					})
				]
			}, item.id))
		})]
	});
};
export { MegaMenuAdminPage };
