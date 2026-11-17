import { a as createLucideIcon, l as require_react, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { t as Check } from "./check-BuKO0DJa.js";
import { N as Sparkles, U as LayoutDashboard, W as Layers, _ as EffectAction, z as Palette } from "./index-Dacn8Sc3.js";
import { t as ColorPicker } from "./ColorPicker-BC4bX_Le.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Earth = createLucideIcon("earth", [
	["path", {
		d: "M21.54 15H17a2 2 0 0 0-2 2v4.54",
		key: "1djwo0"
	}],
	["path", {
		d: "M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17",
		key: "1tzkfa"
	}],
	["path", {
		d: "M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05",
		key: "14pb5j"
	}],
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var MousePointer2 = createLucideIcon("mouse-pointer-2", [["path", {
	d: "M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z",
	key: "edeuup"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var PanelsTopLeft = createLucideIcon("panels-top-left", [
	["rect", {
		width: "18",
		height: "18",
		x: "3",
		y: "3",
		rx: "2",
		key: "afitv7"
	}],
	["path", {
		d: "M3 9h18",
		key: "1pudct"
	}],
	["path", {
		d: "M9 21V9",
		key: "1oto5p"
	}]
]);
require_react();
var import_jsx_runtime = require_jsx_runtime();
var effectClasses = {
	shimmer: ["shimmer", "glow"],
	liquid: ["liquid", "glow"],
	glow: ["glow"],
	plain: []
};
var effectLabels = {
	shimmer: "درخشش عبوری",
	liquid: "موج مایع",
	glow: "هاله نور",
	plain: "ساده"
};
var ThemeButtonsPreview = ({ palette, selectedEffect }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "theme-editor-section",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-sm font-bold",
			children: "پیش‌نمایش دکمه‌ها"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-slate-500",
			children: "دو افکت داخلی در کنار اکشن انتخاب‌شده؛ بدون وابستگی به CDN."
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectAction, {
				type: "button",
				effects: effectClasses[selectedEffect],
				style: {
					backgroundColor: palette.buttonBg,
					color: palette.buttonText
				},
				className: "theme-action-preview px-5 py-2.5 text-xs font-bold shadow-lg",
				children: "اکشن اصلی"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectAction, {
				type: "button",
				effects: ["liquid", "glow"],
				style: {
					backgroundColor: palette.primary,
					color: "#fff"
				},
				className: "theme-action-preview px-5 py-2.5 text-xs font-bold shadow-lg",
				children: "موج مایع"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "ms-auto text-[10px] font-medium text-slate-500",
				children: ["منتخب: ", effectLabels[selectedEffect]]
			})
		]
	})]
});
// src/components/admin/theme/ThemePaletteEditor.tsx
var PALETTE_LABELS = [
	{
		key: "primary",
		label: "رنگ اصلی"
	},
	{
		key: "secondary",
		label: "رنگ ثانویه"
	},
	{
		key: "accent",
		label: "رنگ تاکید"
	},
	{
		key: "background",
		label: "پس‌زمینه"
	},
	{
		key: "surface",
		label: "کارت و سطوح"
	},
	{
		key: "text",
		label: "متن اصلی"
	},
	{
		key: "headerBg",
		label: "پس‌زمینه سربرگ"
	},
	{
		key: "headerText",
		label: "متن سربرگ"
	},
	{
		key: "footerBg",
		label: "پس‌زمینه پابرگ"
	},
	{
		key: "footerText",
		label: "متن پابرگ"
	},
	{
		key: "buttonBg",
		label: "پس‌زمینه دکمه"
	},
	{
		key: "buttonText",
		label: "متن دکمه"
	},
	{
		key: "link",
		label: "پیوندها"
	}
];
var ThemePaletteEditor = ({ palette, onChange }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "theme-editor-section",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-sm font-bold",
			children: "رنگ‌های این بخش"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-slate-500",
			children: "رنگ‌ها فقط روی همین محدودهٔ انتخاب‌شده اعمال می‌شوند."
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3",
		children: PALETTE_LABELS.map(({ key, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPicker, {
			label,
			value: palette[key],
			onChange: (value) => onChange(key, value)
		}, key))
	})]
});
// src/components/admin/theme/ThemeScopeEditor.tsx
var DESIGN_STYLES = [
	{
		value: "industrial",
		label: "صنعتی مهندسی",
		description: "خطوط محکم، گوشه‌های جمع‌وجور و کنتراست بالا"
	},
	{
		value: "modern",
		label: "مدرن لایه‌ای",
		description: "فضای بازتر، کارت‌های نرم و عمق بصری متعادل"
	},
	{
		value: "glass",
		label: "شیشه‌ای",
		description: "سطوح نیمه‌شفاف، محوشدگی و لایه‌های شناور"
	}
];
var BUTTON_SHAPES = [
	{
		value: "rounded",
		label: "گرد استاندارد",
		radius: "12px"
	},
	{
		value: "pill",
		label: "کپسولی",
		radius: "9999px"
	},
	{
		value: "square",
		label: "گوشه‌دار",
		radius: "3px"
	}
];
var BUTTON_EFFECTS = [
	{
		value: "shimmer",
		label: "درخشش عبوری",
		description: "بازتاب نور هنگام اشاره"
	},
	{
		value: "liquid",
		label: "موج مایع",
		description: "حرکت نرم لایه در پس‌زمینه"
	},
	{
		value: "glow",
		label: "هاله نور",
		description: "درخشش ملایم پیرامون دکمه"
	},
	{
		value: "plain",
		label: "ساده و مینیمال",
		description: "بدون انیمیشن دکمه"
	}
];
var ThemeScopeEditor = ({ title, description, values, onChange }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
	className: "theme-scope-editor space-y-6",
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "theme-scope-heading",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--theme-primary)/10 text-(--theme-primary)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-5 w-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-extrabold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-6 text-slate-500",
					children: description
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "theme-editor-section",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "h-4 w-4 text-(--theme-primary)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-bold",
					children: "زبان بصری"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-slate-500",
					children: "ساختار کارت‌ها، سطح‌ها و عمق طراحی این بخش"
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-3",
				children: DESIGN_STYLES.map((style) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-pressed": values.designStyle === style.value,
					onClick: () => onChange({ designStyle: style.value }),
					className: "theme-style-option rounded-2xl border border-slate-200 p-3 text-start dark:border-slate-700",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: `theme-style-preview theme-style-preview-${style.value}`,
							"aria-hidden": "true",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "theme-style-preview-header" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "theme-style-preview-card",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-3 flex items-center justify-between gap-2 text-xs font-bold",
							children: [style.label, values.designStyle === style.value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 text-(--theme-primary)" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block min-h-9 text-[10px] leading-5 text-slate-500",
							children: style.description
						})
					]
				}, style.value))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 xl:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "theme-editor-section",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MousePointer2, { className: "h-4 w-4 text-(--theme-primary)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-bold",
						children: "فرم دکمه‌ها"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-slate-500",
						children: "شکل همهٔ اکشن‌های همین بخش"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-2",
					children: BUTTON_SHAPES.map((shape) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": values.buttonShape === shape.value,
						onClick: () => onChange({ buttonShape: shape.value }),
						className: "theme-shape-option rounded-xl border border-slate-200 p-3 text-center text-[11px] font-semibold dark:border-slate-700",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "theme-shape-preview",
							style: { borderRadius: shape.radius },
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-2 block",
							children: shape.label
						})]
					}, shape.value))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "theme-editor-section",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-(--theme-primary)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-bold",
						children: "افکت دکمه"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-slate-500",
						children: "افکت‌های داخلی و بازنویسی‌شده، بدون CDN"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-2",
					children: BUTTON_EFFECTS.map((effect) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": values.buttonEffect === effect.value,
						onClick: () => onChange({ buttonEffect: effect.value }),
						className: "theme-effect-option rounded-xl border border-slate-200 p-3 text-start dark:border-slate-700",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs font-bold",
							children: effect.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-[10px] leading-5 text-slate-500",
							children: effect.description
						})]
					}, effect.value))
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeButtonsPreview, {
			palette: values.palette,
			selectedEffect: values.buttonEffect
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemePaletteEditor, {
			palette: values.palette,
			onChange: (key, value) => onChange({ palette: {
				...values.palette,
				[key]: value
			} })
		})
	]
});
// src/components/admin/theme/ThemeScopeTabs.tsx
var SCOPES = [
	{
		value: "site",
		label: "صفحات عمومی",
		description: "صفحات داخلی وب‌سایت",
		icon: Earth
	},
	{
		value: "landing",
		label: "لندینگ",
		description: "صفحهٔ اصلی مستقل",
		icon: PanelsTopLeft
	},
	{
		value: "admin",
		label: "پنل مدیریت",
		description: "داشبورد و ابزارهای مدیریتی",
		icon: LayoutDashboard
	}
];
var ThemeScopeTabs = ({ selected, onSelect }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: "theme-scope-tabs",
	role: "group",
	"aria-label": "محدودهٔ تنظیمات تم",
	children: SCOPES.map(({ value, label, description, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"aria-pressed": selected === value,
		onClick: () => onSelect(value),
		className: "theme-scope-tab",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "theme-scope-tab-icon",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0 text-start",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-xs font-bold",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block truncate text-[10px] text-slate-500",
				children: description
			})]
		})]
	}, value))
});
export { ThemeScopeEditor as n, ThemeScopeTabs as t };
