import { a as createLucideIcon, l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { Y as FileText } from "./index-Dacn8Sc3.js";
import { t as Lock } from "./lock-Ce3l9B4q.js";
import { t as Trash2 } from "./trash-2-uk0pNdI5.js";
import { t as ZeroBrokenImage, u as isVideoMediaUrl } from "./ZeroBrokenImage-CvCIOfg-.js";
import { t as FileUploader } from "./FileUploader-BJ54GFf2.js";
import { t as ConfirmDialog } from "./ConfirmDialog-5fpwSoSk.js";
import { t as Pagination } from "./Pagination-Cy7ez7lz.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Copy = createLucideIcon("copy", [["rect", {
	width: "14",
	height: "14",
	x: "8",
	y: "8",
	rx: "2",
	ry: "2",
	key: "17jyea"
}], ["path", {
	d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
	key: "zix9uf"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var LockOpen = createLucideIcon("lock-open", [["rect", {
	width: "18",
	height: "11",
	x: "3",
	y: "11",
	rx: "2",
	ry: "2",
	key: "1w4ew1"
}], ["path", {
	d: "M7 11V7a5 5 0 0 1 9.9-1",
	key: "1mm8w8"
}]]);
// src/pages/admin/MediaLibraryPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var MediaLibraryPage = () => {
	const { addToast } = useAppStore();
	const [files, setFiles] = (0, import_react.useState)([]);
	const [page, setPage] = (0, import_react.useState)(1);
	const [lastPage, setLastPage] = (0, import_react.useState)(1);
	const [deleteFile, setDeleteFile] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	const load = async (targetPage = page) => {
		try {
			const response = await apiRequest(`/admin/media?page=${targetPage}&per_page=12`);
			if (targetPage > response.meta.last_page) {
				setPage(Math.max(1, response.meta.last_page));
				return;
			}
			setFiles(response.data);
			setLastPage(response.meta.last_page);
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "بارگذاری رسانه‌ها ناموفق بود.");
		}
	};
	(0, import_react.useEffect)(() => {
		load(page);
	}, [page]);
	const confirmDelete = async () => {
		if (!deleteFile) return;
		setDeleting(true);
		try {
			await apiRequest(`/admin/media/${deleteFile.id}`, { method: "DELETE" });
			setDeleteFile(null);
			load();
			addToast("success", "فایل از کتابخانه رسانه حذف شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "حذف فایل ناموفق بود.");
		} finally {
			setDeleting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mb-3 text-lg font-extrabold",
					children: "کتابخانه رسانه و مدیریت متمرکز فایل‌ها (storage/app/public)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUploader, {
					folder: "uploads",
					onUploaded: () => load()
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: files.map((f) => {
					const isImage = [
						"png",
						"jpg",
						"jpeg",
						"webp",
						"gif",
						"svg"
					].includes(f.extension.toLowerCase());
					const isVideo = isVideoMediaUrl(f.url) || ["mp4", "webm"].includes(f.extension.toLowerCase());
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-3 flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950",
								children: isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
									src: f.url,
									muted: true,
									loop: true,
									autoPlay: true,
									playsInline: true,
									className: "h-full w-full object-contain"
								}) : isImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
									src: f.url,
									alt: f.name,
									className: "h-full w-full object-contain"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col items-center gap-1 text-slate-400",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-8 w-8" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-[11px] uppercase",
										children: f.extension
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2 text-xs text-slate-500",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono uppercase",
									children: f.extension
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums",
									children: [Math.round(f.size_bytes / 1024), " KB"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 truncate text-sm font-bold",
								children: f.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 truncate font-mono text-[11px] text-slate-400",
								dir: "ltr",
								children: f.url
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: async () => {
										await apiRequest(`/admin/media/${f.id}`, {
											method: "PUT",
											body: JSON.stringify({ requires_auth: !f.requires_auth })
										});
										load();
										addToast("info", "سطح دسترسی دانلود فایل تغییر کرد.");
									},
									className: "inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300",
									children: [f.requires_auth ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3.5 w-3.5 text-amber-600" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "h-3.5 w-3.5 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: f.requires_auth ? "نیازمند ورود" : "دانلود عمومی" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											navigator.clipboard?.writeText(f.url);
											addToast("success", "مسیر فایل کپی شد.");
										},
										className: "rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800",
										title: "کپی آدرس",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-3.5 w-3.5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setDeleteFile(f),
										className: "rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40",
										"aria-label": `حذف ${f.name}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
									open: Boolean(deleteFile),
									onClose: () => setDeleteFile(null),
									onConfirm: confirmDelete,
									message: "این فایل از کتابخانه پنهان می‌شود و فایل ذخیره‌شده برای حذف فیزیکی پاک نمی‌شود. ادامه می‌دهید؟",
									loading: deleting
								})
							]
						})]
					}, f.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
				page,
				lastPage,
				onChange: setPage
			})
		]
	});
};
export { MediaLibraryPage };
