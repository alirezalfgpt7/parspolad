import { a as createLucideIcon, l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { H as Mail, R as Phone, a as ProfileCardEffect, n as SlidingProfileCardEffect } from "./index-Dacn8Sc3.js";
import { t as CmsPageIntro } from "./CmsPageIntro-DZsc0ikM.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Users = createLucideIcon("users", [
	["path", {
		d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
		key: "1yyitq"
	}],
	["path", {
		d: "M16 3.128a4 4 0 0 1 0 7.744",
		key: "16gr8j"
	}],
	["path", {
		d: "M22 21v-2a4 4 0 0 0-3-3.87",
		key: "kshegd"
	}],
	["circle", {
		cx: "9",
		cy: "7",
		r: "4",
		key: "nufk8"
	}]
]);
// src/pages/public/OrgChartPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var OrgChartPage = () => {
	const language = useAppStore((s) => s.language);
	const [departments, setDepartments] = (0, import_react.useState)([]);
	const [team, setTeam] = (0, import_react.useState)([]);
	const [selectedDeptId, setSelectedDeptId] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		apiRequest("/departments").then((r) => {
			setDepartments(r.data.departments);
			setTeam(r.data.team);
		}).catch(() => {});
	}, []);
	const root = departments.find((d) => d.parent_id === null);
	const children = departments.filter((d) => d.parent_id !== null);
	const activeDept = departments.find((d) => d.id === selectedDeptId) || root;
	const deptMembers = selectedDeptId ? team.filter((m) => m.department_id === selectedDeptId) : team;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsPageIntro, { slug: "org-chart" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900",
				children: root && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setSelectedDeptId(root.id),
							style: { borderColor: selectedDeptId === root.id ? root.color : void 0 },
							className: "w-full max-w-xs rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-center transition-all hover:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs font-bold",
									style: { color: root.color },
									children: language === "fa" ? root.name_fa : root.name_en
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-base font-extrabold text-slate-900 dark:text-white",
									children: language === "fa" ? root.head_name_fa : root.head_name_en
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-slate-500",
									children: root.head_title_fa
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-px bg-slate-300 dark:bg-slate-700" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px w-full max-w-5xl bg-slate-300 dark:bg-slate-700" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5",
							children: children.map((dept) => {
								const isSelected = selectedDeptId === dept.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setSelectedDeptId(dept.id),
									className: `flex flex-col justify-between rounded-xl border p-4 text-start transition-all hover:-translate-y-0.5 ${isSelected ? "border-(--theme-primary) bg-red-50/40 dark:bg-red-950/20" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "inline-block h-1.5 w-8 rounded-full",
											style: { backgroundColor: dept.color }
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "mt-2 text-xs font-bold text-slate-900 dark:text-white",
											children: language === "fa" ? dept.name_fa : dept.name_en
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs font-medium text-slate-600 dark:text-slate-300",
											children: language === "fa" ? dept.head_name_fa : dept.head_name_en
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-slate-400",
											children: dept.head_title_fa
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 tabular-nums",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [dept.member_count, " نفر"] })]
									})]
								}, dept.id);
							})
						})
					]
				})
			}),
			departments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-lg font-bold text-slate-900 dark:text-white",
					children: language === "fa" ? "مدیران واحدهای تخصصی" : "Department Heads"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
					children: departments.slice(0, 3).map((dept) => {
						const leadMember = team.find((m) => m.department_id === dept.id && m.avatar_url);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileCardEffect, {
							name: language === "fa" ? dept.head_name_fa : dept.head_name_en,
							role: language === "fa" ? dept.name_fa : dept.name_en,
							subtitle: `${dept.head_title_fa} · ${dept.member_count} ${language === "fa" ? "نفر" : "members"}`,
							imageUrl: leadMember?.avatar_url,
							accentColor: dept.color,
							actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setSelectedDeptId(dept.id),
								className: "rounded-lg bg-white/15 p-1.5 text-white hover:bg-white/30",
								title: language === "fa" ? "فیلتر واحد" : "Filter department",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
							})
						}, dept.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-slate-900 dark:text-white",
						children: selectedDeptId && activeDept ? `${language === "fa" ? "اعضای کلیدی واحد" : "Team Members"}: ${language === "fa" ? activeDept.name_fa : activeDept.name_en}` : language === "fa" ? "مدیران و کارشناسان کلیدی شرکت" : "Key Specialists & Engineers"
					}), selectedDeptId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setSelectedDeptId(null),
						className: "text-xs font-semibold text-(--theme-primary) hover:underline",
						children: language === "fa" ? "نمایش همه واحدها" : "Show All"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
					children: deptMembers.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidingProfileCardEffect, {
						name: language === "fa" ? m.name_fa : m.name_en,
						role: language === "fa" ? m.role_fa : m.role_en,
						bio: language === "fa" ? `سابقه تخصصی: ${m.experience_years} سال در پروژه‌های سرچاهی و درون‌چاهی` : `${m.experience_years} years of oil & gas field engineering`,
						imageUrl: m.avatar_url,
						viewLabel: language === "fa" ? "مشاهده اطلاعات" : "View Profile",
						meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-1",
							children: [m.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5 tabular-nums",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									dir: "ltr",
									children: m.phone
								})]
							}), m.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5 truncate",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: m.email })]
							})]
						})
					}, m.id))
				})]
			})
		]
	});
};
export { OrgChartPage };
