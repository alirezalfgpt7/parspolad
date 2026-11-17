import { a as createLucideIcon, l as require_react, m as __toESM, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { t as sanitizeHtml } from "./sanitizeHtml-B1l_T8WV.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Bold = createLucideIcon("bold", [["path", {
	d: "M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8",
	key: "mg9rjx"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Code = createLucideIcon("code", [["path", {
	d: "m16 18 6-6-6-6",
	key: "eg8j8"
}], ["path", {
	d: "m8 6-6 6 6 6",
	key: "ppft3o"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Italic = createLucideIcon("italic", [
	["line", {
		x1: "19",
		x2: "10",
		y1: "4",
		y2: "4",
		key: "15jd3p"
	}],
	["line", {
		x1: "14",
		x2: "5",
		y1: "20",
		y2: "20",
		key: "bu0au3"
	}],
	["line", {
		x1: "15",
		x2: "9",
		y1: "4",
		y2: "20",
		key: "uljnxc"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Link2 = createLucideIcon("link-2", [
	["path", {
		d: "M9 17H7A5 5 0 0 1 7 7h2",
		key: "8i5ue5"
	}],
	["path", {
		d: "M15 7h2a5 5 0 1 1 0 10h-2",
		key: "1b9ql8"
	}],
	["line", {
		x1: "8",
		x2: "16",
		y1: "12",
		y2: "12",
		key: "1jonct"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ListOrdered = createLucideIcon("list-ordered", [
	["path", {
		d: "M11 5h10",
		key: "1cz7ny"
	}],
	["path", {
		d: "M11 12h10",
		key: "1438ji"
	}],
	["path", {
		d: "M11 19h10",
		key: "11t30w"
	}],
	["path", {
		d: "M4 4h1v5",
		key: "10yrso"
	}],
	["path", {
		d: "M4 9h2",
		key: "r1h2o0"
	}],
	["path", {
		d: "M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02",
		key: "xtkcd5"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var List = createLucideIcon("list", [
	["path", {
		d: "M3 5h.01",
		key: "18ugdj"
	}],
	["path", {
		d: "M3 12h.01",
		key: "nlz23k"
	}],
	["path", {
		d: "M3 19h.01",
		key: "noohij"
	}],
	["path", {
		d: "M8 5h13",
		key: "1pao27"
	}],
	["path", {
		d: "M8 12h13",
		key: "1za7za"
	}],
	["path", {
		d: "M8 19h13",
		key: "m83p4d"
	}]
]);
// src/components/ui/RichTextEditor.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var RichTextEditor = ({ value, onChange, label, minHeight = 160 }) => {
	const [sourceMode, setSourceMode] = (0, import_react.useState)(false);
	const editorRef = (0, import_react.useRef)(null);
	const exec = (cmd, arg) => {
		document.execCommand(cmd, false, arg);
		if (editorRef.current) onChange(sanitizeHtml(editorRef.current.innerHTML));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full",
		children: [label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			className: "mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => exec("bold"),
							className: "rounded p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700",
							title: "Bold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bold, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => exec("italic"),
							className: "rounded p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700",
							title: "Italic",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Italic, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => exec("insertUnorderedList"),
							className: "rounded p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700",
							title: "Bullet List",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => exec("insertOrderedList"),
							className: "rounded p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700",
							title: "Ordered List",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListOrdered, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								const url = window.prompt("آدرس لینک را وارد کنید:");
								if (url) exec("createLink", url);
							},
							className: "rounded p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700",
							title: "Insert Link",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "h-4 w-4" })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setSourceMode((m) => !m),
					className: "flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Code, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: sourceMode ? "نمای بصری" : "کد HTML" })]
				})]
			}), sourceMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				value,
				onChange: (e) => onChange(e.target.value),
				style: { minHeight },
				dir: "ltr",
				className: "w-full bg-slate-950 p-3 font-mono text-xs text-emerald-300 focus:outline-none"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: editorRef,
				contentEditable: true,
				suppressContentEditableWarning: true,
				onInput: (e) => onChange(sanitizeHtml(e.target.innerHTML)),
				dangerouslySetInnerHTML: { __html: sanitizeHtml(value) },
				style: { minHeight },
				className: "prose prose-sm max-w-none p-3.5 text-sm text-slate-800 focus:outline-none dark:prose-invert dark:text-slate-200"
			})]
		})]
	});
};
export { RichTextEditor as t };
