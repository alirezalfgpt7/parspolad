import { l as require_react, m as __toESM, o as useAppStore, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { K as House, et as ChevronRight, ot as Link, tt as ChevronLeft } from "./index-Dacn8Sc3.js";
// src/components/ui/Breadcrumb.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var Breadcrumb = ({ items }) => {
	const language = useAppStore((s) => s.language);
	const Sep = language === "fa" ? ChevronLeft : ChevronRight;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		"aria-label": "Breadcrumb",
		className: "mb-6 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/",
			className: "flex items-center gap-1 transition-colors hover:text-(--theme-primary)",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: language === "fa" ? "خانه" : "Home" })]
		}), items.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sep, { className: "h-3.5 w-3.5 opacity-60" }), item.to ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: item.to,
			className: "transition-colors hover:text-(--theme-primary)",
			children: item.label
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium text-slate-800 dark:text-slate-200",
			children: item.label
		})] }, idx))]
	});
};
export { Breadcrumb as t };
