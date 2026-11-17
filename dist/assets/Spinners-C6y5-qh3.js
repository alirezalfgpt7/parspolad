import { l as require_react, n as cn, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
require_react();
// src/components/effects/Spinners.tsx
var import_jsx_runtime = require_jsx_runtime();
/**
* Effect 025: CSS Spinner Animation (Quartet Orbit)
*/
var QuartetSpinnerEffect = ({ className }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: cn("effect-spinner-quartet", className),
	"aria-hidden": "true",
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
	]
});
var win11Sizes = {
	sm: "text-[16px]",
	md: "text-[28px]",
	lg: "text-[52px]"
};
/**
* Effect 057: Windows 11 Boot Spinner
*/
var Win11BootSpinnerEffect = ({ size = "sm", className }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
	className: cn("effect-win11-spinner", win11Sizes[size], className),
	"aria-hidden": "true",
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "effect-win11-dot" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "effect-win11-dot" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "effect-win11-dot" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "effect-win11-dot" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "effect-win11-dot" })
	]
});
export { Win11BootSpinnerEffect as n, QuartetSpinnerEffect as t };
