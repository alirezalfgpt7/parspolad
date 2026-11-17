import { l as require_react, m as __toESM, n as cn, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { t as Check } from "./check-BuKO0DJa.js";
import { A as X, L as Search, nt as ChevronDown } from "./index-Dacn8Sc3.js";
// src/components/ui/SearchableSelect.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var SearchableSelect = ({ options, value, onChange, placeholder = "انتخاب کنید...", searchPlaceholder = "جستجو در گزینه‌ها...", label, allowClear = false, className, disabled = false }) => {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const containerRef = (0, import_react.useRef)(null);
	const searchRef = (0, import_react.useRef)(null);
	const selected = (0, import_react.useMemo)(() => options.find((o) => o.value === value), [options, value]);
	const filtered = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		if (!q) return options;
		return options.filter((o) => o.label.toLowerCase().includes(q) || o.sublabel && o.sublabel.toLowerCase().includes(q));
	}, [options, query]);
	(0, import_react.useEffect)(() => {
		const onOutside = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", onOutside);
		return () => document.removeEventListener("mousedown", onOutside);
	}, []);
	(0, import_react.useEffect)(() => {
		if (open) setTimeout(() => searchRef.current?.focus(), 20);
		else setQuery("");
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: containerRef,
		className: cn("relative w-full", className),
		children: [
			label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled,
				onClick: () => setOpen((o) => !o),
				className: cn("flex min-h-10.5 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--theme-primary) dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100", disabled && "cursor-not-allowed opacity-60"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("truncate", !selected && "text-slate-400"),
					children: selected ? selected.label : placeholder
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1 shrink-0",
					children: [allowClear && value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						role: "button",
						tabIndex: 0,
						onClick: (e) => {
							e.stopPropagation();
							onChange("");
						},
						onKeyDown: (e) => {
							if (e.key === "Enter") {
								e.stopPropagation();
								onChange("");
							}
						},
						className: "rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800",
						"aria-label": "پاک کردن",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180") })]
				})]
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 shrink-0 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: searchRef,
						type: "text",
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: searchPlaceholder,
						className: "w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "max-h-60 overflow-y-auto py-1",
					children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-3 py-3 text-center text-xs text-slate-500",
						children: "موردی یافت نشد"
					}) : filtered.map((opt) => {
						const isSelected = opt.value === value;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								onChange(opt.value);
								setOpen(false);
							},
							className: cn("flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800", isSelected && "bg-slate-50 font-semibold text-(--theme-primary) dark:bg-slate-800/70"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "truncate",
								children: [opt.label, opt.sublabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ms-2 text-xs font-normal text-slate-400",
									children: opt.sublabel
								})]
							}), isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 shrink-0 text-(--theme-primary)" })]
						}) }, opt.value);
					})
				})]
			})
		]
	});
};
export { SearchableSelect as t };
