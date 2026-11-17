import { a as createLucideIcon, l as require_react, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { O as InlineLoader, k as Modal } from "./index-Dacn8Sc3.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var TriangleAlert = createLucideIcon("triangle-alert", [
	["path", {
		d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
		key: "wmoenq"
	}],
	["path", {
		d: "M12 9v4",
		key: "juzpu7"
	}],
	["path", {
		d: "M12 17h.01",
		key: "p32p05"
	}]
]);
require_react();
var import_jsx_runtime = require_jsx_runtime();
var ConfirmDialog = ({ open, onClose, onConfirm, title = "تایید عملیات", message, confirmLabel = "بله، انجام شود", cancelLabel = "انصراف", loading = false }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		open,
		onClose,
		title,
		size: "sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg bg-red-50 p-2.5 text-red-700 dark:bg-red-950/60 dark:text-red-400",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-relaxed text-slate-600 dark:text-slate-300",
				children: message
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 flex items-center justify-end gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onClose,
				className: "rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 whitespace-nowrap",
				children: cancelLabel
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: loading,
				onClick: onConfirm,
				className: "rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-800 disabled:opacity-60 whitespace-nowrap",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineLoader, { label: "در حال اجرا..." }) : confirmLabel
			})]
		})]
	});
};
export { ConfirmDialog as t };
