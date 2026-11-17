import { l as require_react, n as cn, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { et as ChevronRight, tt as ChevronLeft } from "./index-Dacn8Sc3.js";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var Pagination = ({ page, lastPage, onChange }) => {
	if (lastPage <= 1) return null;
	const pages = lastPage <= 7 ? Array.from({ length: lastPage }, (_, i) => i + 1) : page <= 4 ? [
		1,
		2,
		3,
		4,
		5,
		"right-ellipsis",
		lastPage
	] : page >= lastPage - 3 ? [
		1,
		"left-ellipsis",
		lastPage - 4,
		lastPage - 3,
		lastPage - 2,
		lastPage - 1,
		lastPage
	] : [
		1,
		"left-ellipsis",
		page - 1,
		page,
		page + 1,
		"right-ellipsis",
		lastPage
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 flex items-center justify-center gap-1.5 tabular-nums",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: page <= 1,
				onClick: () => onChange(page - 1),
				className: "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
				"aria-label": "صفحه قبل",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
			}),
			pages.map((p) => p === "left-ellipsis" || p === "right-ellipsis" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "px-1 text-slate-500",
				"aria-hidden": "true",
				children: "…"
			}, p) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onChange(p),
				"aria-current": p === page ? "page" : void 0,
				className: cn("flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-colors", p === page ? "border-(--theme-primary) bg-(--theme-primary) text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"),
				children: p
			}, p)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: page >= lastPage,
				onClick: () => onChange(page + 1),
				className: "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
				"aria-label": "صفحه بعد",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
			})
		]
	});
};
export { Pagination as t };
