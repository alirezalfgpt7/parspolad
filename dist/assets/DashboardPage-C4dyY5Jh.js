import { l as require_react, m as __toESM, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { B as MessageSquare, C as PagePreloader, J as FolderKanban, O as InlineLoader, X as FileSpreadsheet, at as Award, it as Bell, ot as Link, x as AreaChartEffect } from "./index-Dacn8Sc3.js";
import { t as ShieldCheck } from "./shield-check-Dq3Mld6F.js";
import { n as gregorianToJalali, r as jalaliToGregorian, t as PersianDatePicker } from "./PersianDatePicker-Tb3-es4g.js";
// src/components/charts/IndustrialCharts.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var CategoryBarChart = ({ data }) => {
	const max = Math.max(1, ...data.map((d) => d.count));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3.5 tabular-nums",
		children: data.map((item) => {
			const pct = Math.round(item.count / max * 100);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-slate-700 dark:text-slate-200",
						children: item.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-bold text-slate-900 dark:text-white",
						children: [item.count, " پروژه"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "effect-chart-bar h-full rounded-full transition-all duration-500",
						style: {
							width: `${pct}%`,
							backgroundColor: item.color || "var(--theme-primary)"
						}
					})
				})]
			}, item.name);
		})
	});
};
var YearlyTrendChart = ({ data }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaChartEffect, {
	data: data.map((item) => ({
		label: item.year,
		value: item.count
	})),
	unitLabel: "پروژه"
});
// src/pages/admin/DashboardPage.tsx
var DashboardPage = () => {
	const [data, setData] = (0, import_react.useState)(null);
	const [analytics, setAnalytics] = (0, import_react.useState)(null);
	const [rangeFrom, setRangeFrom] = (0, import_react.useState)("");
	const [rangeTo, setRangeTo] = (0, import_react.useState)("");
	const [analyticsLoading, setAnalyticsLoading] = (0, import_react.useState)(false);
	const [analyticsError, setAnalyticsError] = (0, import_react.useState)("");
	const loadAnalytics = async (from = "", to = "") => {
		setAnalyticsLoading(true);
		setAnalyticsError("");
		try {
			if (Boolean(from) !== Boolean(to)) throw new Error("برای گزارش بازه‌ای، تاریخ شروع و پایان را هر دو انتخاب کنید.");
			const query = from && to ? `?from=${encodeURIComponent(jalaliToGregorian(from))}&to=${encodeURIComponent(jalaliToGregorian(to))}` : "";
			const result = await apiRequest(`/admin/analytics${query}`);
			setAnalytics(result);
			setRangeFrom(gregorianToJalali(result.range.from));
			setRangeTo(gregorianToJalali(result.range.to));
		} catch (error) {
			setAnalyticsError(error instanceof Error ? error.message : "دریافت آمار بازدید ناموفق بود.");
		} finally {
			setAnalyticsLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		apiRequest("/admin/dashboard").then(setData).catch(() => {});
		loadAnalytics();
	}, []);
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PagePreloader, { label: "در حال آماده‌سازی داشبورد..." });
	const cards = [
		{
			label: "پروژه‌های ثبت‌شده",
			val: data.stats.projects_count,
			icon: FolderKanban,
			to: "/admin/projects"
		},
		{
			label: "قراردادهای فعال و تکمیلی",
			val: `${data.stats.contracts_count} (${data.stats.contracts_total_billion_irr} میلیارد ریال)`,
			icon: FileSpreadsheet,
			to: "/admin/contracts-licenses"
		},
		{
			label: "گواهینامه‌ها و استانداردها",
			val: data.stats.licenses_count,
			icon: Award,
			to: "/admin/contracts-licenses"
		},
		{
			label: "پیام‌ها و RFQ جدید",
			val: data.stats.new_messages_count,
			icon: MessageSquare,
			to: "/admin/messages"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 tabular-nums",
				children: cards.map((c) => {
					const Icon = c.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: c.to,
						className: "flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-slate-500",
							children: c.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-xl font-extrabold text-slate-900 dark:text-white",
							children: c.val
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-lg bg-red-50 p-2.5 text-(--theme-primary) dark:bg-red-950/40",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
						})]
					}, c.label);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-bold",
							children: "آمار بازدید وب‌سایت"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-slate-500",
							children: "آمار به‌صورت تجمیعی ثبت می‌شود و شناسه یا IP بازدیدکنندگان ذخیره نمی‌شود."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-end gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "w-40 text-xs",
									children: ["از تاریخ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersianDatePicker, {
										value: rangeFrom,
										onChange: setRangeFrom,
										className: "mt-1"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "w-40 text-xs",
									children: ["تا تاریخ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersianDatePicker, {
										value: rangeTo,
										onChange: setRangeTo,
										className: "mt-1"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => loadAnalytics(rangeFrom, rangeTo),
									disabled: analyticsLoading,
									className: "rounded-lg bg-(--theme-primary) px-4 py-2 text-xs font-semibold text-white disabled:opacity-60",
									children: analyticsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineLoader, { label: "در حال دریافت..." }) : "اعمال بازه"
								})
							]
						})]
					}),
					analyticsError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "text-xs text-red-600",
						children: analyticsError
					}),
					analytics && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-slate-500",
								children: "بازدید در بازه انتخاب‌شده"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-2xl font-extrabold tabular-nums",
								children: analytics.range.total.toLocaleString("fa-IR")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-[11px] text-slate-500",
								children: [
									gregorianToJalali(analytics.range.from),
									" تا ",
									gregorianToJalali(analytics.range.to)
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-5 lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mb-3 text-xs font-semibold",
							children: "بازدید روزانه · ۱۴ روز اخیر"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsBars, { points: buildDailySeries(analytics.daily, 14) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mb-3 text-xs font-semibold",
							children: "بازدید ماهانه · ۱۲ ماه اخیر"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsBars, { points: buildMonthlySeries(analytics.monthly, 12) })] })]
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-4 text-sm font-bold",
						children: "تعداد پروژه‌ها به تفکیک دسته فنی"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryBarChart, { data: data.charts.byCategory })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-4 text-sm font-bold",
						children: "نمودار روند اجرای پروژه‌ها در سال‌ها"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YearlyTrendChart, { data: data.charts.byYear })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-6 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-bold",
								children: "پیام‌ها و RFQهای اخیر"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/admin/messages",
								className: "text-xs text-(--theme-primary) hover:underline",
								children: "همه"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: data.recent_messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-b border-slate-100 pb-2.5 text-xs last:border-0 dark:border-slate-800",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold text-slate-900 dark:text-white",
									children: m.subject
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-0.5 text-slate-500",
									children: [
										m.name,
										" · ",
										m.type.toUpperCase()
									]
								})]
							}, m.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "flex items-center gap-1.5 text-sm font-bold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-(--theme-primary)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "لاگ‌های اخیر سیستم" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/admin/reports",
								className: "text-xs text-(--theme-primary) hover:underline",
								children: "مشاهده"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2.5",
							children: data.recent_logs.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-b border-slate-100 pb-2 text-xs last:border-0 dark:border-slate-800",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium text-slate-800 dark:text-slate-200",
									children: l.subject_label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-0.5 flex justify-between text-[11px] text-slate-400",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: l.user_name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono",
										children: l.action
									})]
								})]
							}, l.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "flex items-center gap-1.5 text-sm font-bold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4 text-amber-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "اعلان‌های اخیر" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/admin/notifications",
								className: "text-xs text-(--theme-primary) hover:underline",
								children: "مرکز اعلان‌ها"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: data.notifications.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-b border-slate-100 pb-2.5 text-xs last:border-0 dark:border-slate-800",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold text-slate-900 dark:text-white",
									children: n.title_fa
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-slate-500",
									children: n.body_fa
								})]
							}, n.id))
						})]
					})
				]
			})
		]
	});
};
var toDateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
var buildDailySeries = (points, dayCount) => {
	const viewsByDate = new Map(points.map((point) => [point.date, point.views]));
	const today = /* @__PURE__ */ new Date();
	return Array.from({ length: dayCount }, (_, index) => {
		const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayCount + index + 1);
		const key = toDateKey(date);
		return {
			key,
			label: date.toLocaleDateString("fa-IR", { day: "2-digit" }),
			value: viewsByDate.get(key) ?? 0
		};
	});
};
var buildMonthlySeries = (points, monthCount) => {
	const viewsByMonth = new Map(points.map((point) => [point.month, point.views]));
	const currentMonth = /* @__PURE__ */ new Date();
	return Array.from({ length: monthCount }, (_, index) => {
		const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - monthCount + index + 1, 1);
		const key = toDateKey(date).slice(0, 7);
		return {
			key,
			label: date.toLocaleDateString("fa-IR", { month: "short" }),
			value: viewsByMonth.get(key) ?? 0
		};
	});
};
var AnalyticsBars = ({ points }) => {
	const maxValue = Math.max(1, ...points.map((point) => point.value));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "img",
		"aria-label": "نمودار تعداد بازدید",
		className: "flex h-36 items-end gap-1 border-b border-slate-200 dark:border-slate-700",
		children: points.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "h-3 text-[9px] tabular-nums leading-3 text-slate-500",
					children: point.value.toLocaleString("fa-IR")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-24 w-full items-end justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						title: `${point.label}: ${point.value}`,
						className: "effect-chart-column w-3 max-w-full rounded-t bg-(--theme-primary) opacity-80 transition-[height] duration-300",
						style: { height: `${point.value === 0 ? 3 : Math.max(6, point.value / maxValue * 100)}%` }
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "h-3 text-[9px] leading-3 text-slate-500",
					children: point.label
				})
			]
		}, point.key))
	});
};
export { DashboardPage };
