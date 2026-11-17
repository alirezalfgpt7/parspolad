import { a as createLucideIcon, l as require_react, m as __toESM, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { L as Search } from "./index-Dacn8Sc3.js";
import { t as Pagination } from "./Pagination-Cy7ez7lz.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ArrowUpDown = createLucideIcon("arrow-up-down", [
	["path", {
		d: "m21 16-4 4-4-4",
		key: "f6ql7i"
	}],
	["path", {
		d: "M17 20V4",
		key: "1ejh1v"
	}],
	["path", {
		d: "m3 8 4-4 4 4",
		key: "11wl7u"
	}],
	["path", {
		d: "M7 4v16",
		key: "1glfcx"
	}]
]);
// src/components/ui/DataTable.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function DataTable({ data, columns, searchKeys, searchPlaceholder = "جستجو در جدول...", pageSize = 8, loading = false, emptyText = "داده‌ای برای نمایش وجود ندارد.", actions }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [sortCol, setSortCol] = (0, import_react.useState)(null);
	const [sortAsc, setSortAsc] = (0, import_react.useState)(true);
	const [page, setPage] = (0, import_react.useState)(1);
	const filtered = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		let list = data;
		if (q && searchKeys?.length) list = data.filter((row) => searchKeys.some((fn) => (fn(row) || "").toLowerCase().includes(q)));
		if (sortCol) {
			const col = columns.find((c) => c.key === sortCol);
			if (col?.sortValue) list = [...list].sort((a, b) => {
				const va = col.sortValue(a);
				const vb = col.sortValue(b);
				if (va < vb) return sortAsc ? -1 : 1;
				if (va > vb) return sortAsc ? 1 : -1;
				return 0;
			});
		}
		return list;
	}, [
		data,
		query,
		searchKeys,
		sortCol,
		sortAsc,
		columns
	]);
	const lastPage = Math.max(1, Math.ceil(filtered.length / pageSize));
	const safePage = Math.min(page, lastPage);
	const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800",
				children: [searchKeys?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-w-[240px] flex-1 max-w-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: query,
						onChange: (e) => {
							setQuery(e.target.value);
							setPage(1);
						},
						placeholder: searchPlaceholder,
						className: "w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pe-3 ps-9 text-sm text-slate-900 focus:border-(--theme-primary) focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: actions
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full border-collapse text-sm tabular-nums",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
						className: "border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300",
						children: columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: `px-4 py-3 text-${col.align || "start"} whitespace-nowrap`,
							children: col.sortValue ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									if (sortCol === col.key) setSortAsc((s) => !s);
									else {
										setSortCol(col.key);
										setSortAsc(true);
									}
								},
								className: "inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: col.header }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "h-3.5 w-3.5 opacity-50" })]
							}) : col.header
						}, col.key))
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-slate-100 dark:divide-slate-800",
						children: loading ? Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "animate-pulse",
							children: columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" })
							}, col.key))
						}, i)) : visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: columns.length,
							className: "px-4 py-10 text-center text-sm text-slate-500",
							children: emptyText
						}) }) : visible.map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
							children: columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: `px-4 py-3 text-${col.align || "start"}`,
								children: col.render(row)
							}, col.key))
						}, idx))
					})]
				})
			}),
			lastPage > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-slate-200 px-4 pb-4 pt-1 dark:border-slate-800",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
					page: safePage,
					lastPage,
					onChange: setPage
				})
			})
		]
	});
}
export { DataTable as t };
