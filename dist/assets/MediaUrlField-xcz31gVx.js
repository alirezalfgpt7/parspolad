import { a as createLucideIcon, l as require_react, m as __toESM, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { N as Sparkles, k as Modal } from "./index-Dacn8Sc3.js";
import { t as Trash2 } from "./trash-2-uk0pNdI5.js";
import { l as isAnimatedMediaUrl, n as BUILTIN_BRAND_MEDIA_PRESETS, t as ZeroBrokenImage, u as isVideoMediaUrl } from "./ZeroBrokenImage-CvCIOfg-.js";
import { t as FileUploader } from "./FileUploader-BJ54GFf2.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CloudUpload = createLucideIcon("cloud-upload", [
	["path", {
		d: "M12 13v8",
		key: "1l5pq0"
	}],
	["path", {
		d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",
		key: "1pljnt"
	}],
	["path", {
		d: "m8 17 4-4 4 4",
		key: "1quai1"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var FolderOpen = createLucideIcon("folder-open", [["path", {
	d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
	key: "usdka0"
}]]);
// src/components/ui/MediaUrlField.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
/**
* Rich media selector & live preview component showing current or previously saved images, GIFs, or looping videos.
*/
var MediaUrlField = ({ label, value, onChange, folder = "logos", accept = ".png,.jpg,.jpeg,.webp,.gif,.mp4,.webm", placeholder = "/storage/logos/logo-main.png", showAnimatedPresets = false, hint }) => {
	const [uploadOpen, setUploadOpen] = (0, import_react.useState)(false);
	const [libraryOpen, setLibraryOpen] = (0, import_react.useState)(false);
	const [mediaItems, setMediaItems] = (0, import_react.useState)([]);
	const [loadingLibrary, setLoadingLibrary] = (0, import_react.useState)(false);
	const openLibrary = async () => {
		setLibraryOpen(true);
		setLoadingLibrary(true);
		try {
			const res = await apiRequest("/admin/media?per_page=40");
			setMediaItems(res.data || []);
		} catch {
			setMediaItems([]);
		} finally {
			setLoadingLibrary(false);
		}
	};
	const isVideo = isVideoMediaUrl(value);
	const isAnimated = isAnimatedMediaUrl(value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-bold text-slate-700 dark:text-slate-200",
					children: label
				}), isAnimated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-300",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), "فایل متحرک"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs dark:border-slate-700 dark:bg-slate-950",
					children: !value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] text-slate-400",
						children: "بدون تصویر"
					}) : isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						src: value,
						autoPlay: true,
						muted: true,
						loop: true,
						playsInline: true,
						className: "h-full w-full rounded-lg object-contain"
					}, value) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
						src: value,
						alt: label,
						className: "h-full w-full rounded-lg object-contain"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1 space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								dir: "ltr",
								value,
								onChange: (e) => onChange(e.target.value),
								placeholder,
								className: "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs outline-none focus:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-900"
							}), value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => onChange(""),
								title: "پاک کردن",
								className: "rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:hover:bg-red-950/40",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setUploadOpen((o) => !o),
									className: "inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold hover:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-3.5 w-3.5 text-(--theme-primary)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "آپلود جدید" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: openLibrary,
									className: "inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold hover:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, { className: "h-3.5 w-3.5 text-amber-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "کتابخانه رسانه" })]
								}),
								showAnimatedPresets && BUILTIN_BRAND_MEDIA_PRESETS.slice(0, 3).map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => onChange(preset.url),
									className: "rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium hover:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800",
									children: preset.label
								}, preset.url))
							]
						}),
						hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-slate-500 dark:text-slate-400",
							children: hint
						})
					]
				})]
			}),
			uploadOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pt-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUploader, {
					folder,
					accept,
					onUploaded: (url) => {
						onChange(url);
						setUploadOpen(false);
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: libraryOpen,
				onClose: () => setLibraryOpen(false),
				title: "انتخاب تصویر یا فایل متحرک از کتابخانه رسانه",
				size: "lg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: BUILTIN_BRAND_MEDIA_PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								onChange(preset.url);
								setLibraryOpen(false);
							},
							className: "rounded-lg border border-(--theme-primary)/30 bg-(--theme-primary)/5 px-3 py-1.5 text-xs font-semibold text-(--theme-primary) hover:bg-(--theme-primary)/15",
							children: preset.label
						}, preset.url))
					}), loadingLibrary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-8 text-center text-xs text-slate-500",
						children: "در حال بارگذاری رسانه..."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
						children: mediaItems.filter((m) => /\.(png|jpe?g|webp|gif|mp4|webm|svg)$/i.test(m.url)).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								onChange(item.url);
								setLibraryOpen(false);
							},
							className: "group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 text-start hover:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-24 w-full items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-slate-900",
								children: isVideoMediaUrl(item.url) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
									src: item.url,
									muted: true,
									loop: true,
									autoPlay: true,
									playsInline: true,
									className: "h-full w-full object-contain"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
									src: item.url,
									alt: item.name,
									className: "h-full w-full object-contain"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1.5 truncate text-[11px] font-semibold text-slate-700 dark:text-slate-200",
								children: item.name
							})]
						}, item.id))
					})]
				})
			})
		]
	});
};
export { MediaUrlField as t };
