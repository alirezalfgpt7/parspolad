import { l as require_react, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var ColorPicker = ({ label, value, onChange }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2.5 min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "color",
				value: value || "#B91C1C",
				onChange: (e) => onChange(e.target.value),
				className: "h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0 shrink-0",
				"aria-label": label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate text-xs font-medium text-slate-700 dark:text-slate-200",
				children: label
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "text",
			value,
			onChange: (e) => onChange(e.target.value),
			dir: "ltr",
			className: "w-20 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-center font-mono text-xs text-slate-800 focus:border-(--theme-primary) focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
		})]
	});
};
export { ColorPicker as t };
