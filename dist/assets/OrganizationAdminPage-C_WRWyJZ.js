import { l as require_react, m as __toESM, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { t as PartnerLogoManager } from "./PartnerLogoManager-DFqp5dbe.js";
// src/pages/admin/OrganizationAdminPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var OrganizationAdminPage = () => {
	const [departments, setDepartments] = (0, import_react.useState)([]);
	const [team, setTeam] = (0, import_react.useState)([]);
	const load = async () => {
		const [d, t] = await Promise.all([apiRequest("/admin/departments"), apiRequest("/admin/team")]);
		setDepartments(d.data);
		setTeam(t.data);
	};
	(0, import_react.useEffect)(() => {
		load().catch(() => {});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mb-4 text-lg font-extrabold",
					children: "واحدهای ساختار سازمانی و مدیران کلیدی"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: departments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-slate-200 p-4 dark:border-slate-800",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-bold",
									children: d.name_fa
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "h-3 w-3 rounded-full",
									style: { backgroundColor: d.color }
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-xs text-slate-600 dark:text-slate-300",
								children: [
									d.head_name_fa,
									" · ",
									d.head_title_fa
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 text-xs text-slate-400 tabular-nums",
								children: [d.member_count, " پرسنل"]
							})
						]
					}, d.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mb-3 mt-6 text-sm font-bold",
					children: [
						"تیم متخصصان و مدیران (",
						team.length,
						")"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-3",
					children: team.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-bold",
							children: m.name_fa
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-slate-500",
							children: m.role_fa
						})]
					}, m.id))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartnerLogoManager, {})]
	});
};
export { OrganizationAdminPage };
