import { a as createLucideIcon, c as fileToBase64, l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { t as FileCheck2 } from "./file-check-2-NaMSW3_O.js";
import { G as Image, O as InlineLoader, Y as FileText } from "./index-Dacn8Sc3.js";
import { t as Upload } from "./upload-D-5c0iMO.js";
import { t as ZeroBrokenImage, u as isVideoMediaUrl } from "./ZeroBrokenImage-CvCIOfg-.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Film = createLucideIcon("film", [
	["rect", {
		width: "18",
		height: "18",
		x: "3",
		y: "3",
		rx: "2",
		key: "afitv7"
	}],
	["path", {
		d: "M7 3v18",
		key: "bbkbws"
	}],
	["path", {
		d: "M3 7.5h4",
		key: "zfgn84"
	}],
	["path", {
		d: "M3 12h18",
		key: "1i2n21"
	}],
	["path", {
		d: "M3 16.5h4",
		key: "1230mu"
	}],
	["path", {
		d: "M17 3v18",
		key: "in4fa5"
	}],
	["path", {
		d: "M17 7.5h4",
		key: "myr1c1"
	}],
	["path", {
		d: "M17 16.5h4",
		key: "go4c1d"
	}]
]);
// src/components/ui/FileUploader.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var isImagePreview = (url) => /\.(png|jpe?g|webp|gif|svg|ico)(\?.*)?$/i.test(url) || url.startsWith("data:image/");
var FileUploader = ({ folder = "uploads", accept = ".pdf,.docx,.xlsx,.dwg,.zip,.mp4,.webm,.jpg,.jpeg,.png,.webp,.gif", label = "انتخاب یا رها کردن فایل (JPG, PNG, WEBP, GIF, MP4, WEBM, PDF, DOCX, ZIP)", currentUrl, onUploaded }) => {
	const inputRef = (0, import_react.useRef)(null);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [uploadedName, setUploadedName] = (0, import_react.useState)(null);
	const [localPreview, setLocalPreview] = (0, import_react.useState)("");
	const addToast = useAppStore((s) => s.addToast);
	const previewUrl = localPreview || currentUrl || "";
	const handleFile = async (file) => {
		if (!file) return;
		if (file.type.startsWith("image/") || file.type.startsWith("video/")) try {
			setLocalPreview(URL.createObjectURL(file));
		} catch {}
		setUploading(true);
		try {
			const b64 = await fileToBase64(file);
			const res = await apiRequest("/admin/media/upload", {
				method: "POST",
				body: JSON.stringify({
					filename: file.name,
					content_base64: b64,
					folder
				})
			});
			setUploadedName(file.name);
			addToast("success", `فایل «${file.name}» با موفقیت آپلود شد.`);
			onUploaded(res.data.url, res.data);
		} catch (err) {
			addToast("error", err instanceof Error ? err.message : "خطا در آپلود فایل");
		} finally {
			setUploading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [previewUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 rounded-xl border border-slate-200 bg-white/80 p-2.5 dark:border-slate-700 dark:bg-slate-900/70",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800",
				children: isVideoMediaUrl(previewUrl) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					src: previewUrl,
					muted: true,
					loop: true,
					autoPlay: true,
					playsInline: true,
					className: "h-full w-full object-cover"
				}) : isImagePreview(previewUrl) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
					src: previewUrl,
					alt: "پیش‌نمایش",
					className: "h-full w-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5 text-slate-400" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200",
					children: [isVideoMediaUrl(previewUrl) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "h-3.5 w-3.5 text-(--theme-primary)" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "h-3.5 w-3.5 text-(--theme-primary)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "پیش‌نمایش فایل فعلی" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					dir: "ltr",
					className: "mt-0.5 truncate font-mono text-[11px] text-slate-500 dark:text-slate-400",
					children: previewUrl
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onDragOver: (e) => e.preventDefault(),
			onDrop: (e) => {
				e.preventDefault();
				handleFile(e.dataTransfer.files[0]);
			},
			onClick: () => inputRef.current?.click(),
			className: "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 text-center transition-colors hover:border-(--theme-primary) hover:bg-slate-100/60 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					type: "file",
					accept,
					className: "hidden",
					onChange: (e) => handleFile(e.target.files?.[0])
				}),
				uploadedName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck2, { className: "h-5 w-5 text-emerald-600" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-5 w-5 text-slate-400" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium text-slate-600 dark:text-slate-300",
					children: uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineLoader, { label: "در حال آپلود و اعتبارسنجی فایل..." }) : uploadedName || label
				})
			]
		})]
	});
};
export { FileUploader as t };
