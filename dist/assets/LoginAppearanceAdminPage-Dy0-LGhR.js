import { a as createLucideIcon, l as require_react, m as __toESM, n as cn, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { $ as CircleCheck, C as PagePreloader, G as Image, N as Sparkles, S as AnimatedTabsEffect, Y as FileText, _ as EffectAction, v as DecorativeCube, w as EffectText, z as Palette } from "./index-Dacn8Sc3.js";
import { t as Save } from "./save-CsxfzoRu.js";
import { t as ShieldCheck } from "./shield-check-Dq3Mld6F.js";
import { a as DEFAULT_BRAND_LOGOS, c as FONT_CSS_MAP, i as DEFAULT_APPEARANCE_SETTINGS, o as DEFAULT_LOGIN_SETTINGS, r as BUNDLED_FONTS, s as DEFAULT_PAGES_CONFIG } from "./ZeroBrokenImage-CvCIOfg-.js";
import { t as BrandLogo } from "./BrandLogo-BGj8yBVG.js";
import { n as ThemeScopeEditor, t as ThemeScopeTabs } from "./ThemeScopeTabs-BPziSA6p.js";
import { n as LUCIDE_ICON_REGISTRY, t as DynamicLucideIcon } from "./LucideIconMap-Dn9cJkOH.js";
import { t as MediaUrlField } from "./MediaUrlField-xcz31gVx.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var RotateCcw = createLucideIcon("rotate-ccw", [["path", {
	d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
	key: "1357e3"
}], ["path", {
	d: "M3 3v5h5",
	key: "1xhq8a"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Type = createLucideIcon("type", [
	["path", {
		d: "M12 4v16",
		key: "1654pz"
	}],
	["path", {
		d: "M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2",
		key: "e0r10z"
	}],
	["path", {
		d: "M9 20h6",
		key: "s66wpe"
	}]
]);
// src/components/ui/IconPicker.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var IconPicker = ({ label, value, onChange }) => {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [filter, setFilter] = (0, import_react.useState)("");
	const entries = Object.entries(LUCIDE_ICON_REGISTRY).filter(([key, meta]) => {
		const q = filter.trim().toLowerCase();
		return !q || key.toLowerCase().includes(q) || meta.label.includes(filter.trim());
	});
	const currentMeta = LUCIDE_ICON_REGISTRY[value];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "block text-xs font-medium text-slate-600 dark:text-slate-300",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setOpen((prev) => !prev),
				className: "flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 transition-colors hover:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-6 w-6 place-items-center rounded-md bg-(--theme-primary)/10 text-(--theme-primary)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
							name: value,
							className: "h-3.5 w-3.5"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentMeta?.label || value })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[10px] text-slate-400",
					children: value
				})]
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-900",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "search",
					value: filter,
					onChange: (e) => setFilter(e.target.value),
					placeholder: "جستجوی آیکون...",
					className: "mb-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid max-h-44 grid-cols-5 gap-1.5 overflow-y-auto",
					children: entries.map(([key, meta]) => {
						const active = value === key;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							title: `${meta.label} (${key})`,
							onClick: () => {
								onChange(key);
								setOpen(false);
							},
							className: cn("flex flex-col items-center gap-1 rounded-lg border p-2 text-[10px] transition-colors", active ? "border-(--theme-primary) bg-(--theme-primary)/10 text-(--theme-primary)" : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(meta.icon, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-full truncate text-center",
								children: meta.label
							})]
						}, key);
					})
				})]
			})
		]
	});
};
// src/pages/admin/LoginAppearanceAdminPage.tsx
var SYSTEM_PAGE_CARDS = [
	{
		key: "home_spotlight",
		label: "بخش اسپات‌لایت صفحه اصلی",
		hasBadge: true
	},
	{
		key: "maintenance",
		label: "صفحه حالت تعمیرات فنی"
	},
	{
		key: "error_404",
		label: "صفحه خطای ۴۰۴ (یافت نشد)",
		hasCta: true
	},
	{
		key: "error_403",
		label: "صفحه خطای ۴۰۳ (عدم دسترسی)",
		hasCta: true
	},
	{
		key: "error_500",
		label: "صفحه خطای ۵۰۰ (سرور)",
		hasCta: true
	}
];
var LOGO_FIELDS = [
	{
		key: "navbar",
		label: "لوگوی نوبار بالایی (Navbar)",
		hint: "نمایش در هدر تمام صفحات عمومی (پشتیبانی از PNG/GIF/MP4)"
	},
	{
		key: "footer",
		label: "لوگوی فوتر سایت (Footer)",
		hint: "نمایش در ستون معرفی فوتر پایین سایت"
	},
	{
		key: "admin_sidebar",
		label: "لوگوی سایدبار پنل مدیریت",
		hint: "آرم بالای سایدبار پنل مدیریت"
	},
	{
		key: "login",
		label: "لوگوی صفحه ورود (Login)",
		hint: "روی کارت ورود نمایش داده می‌شود"
	},
	{
		key: "register",
		label: "لوگوی صفحه ثبت‌نام (Register)",
		hint: "روی کارت پشتی (چرخشی سه‌بعدی) یا صفحه ثبت‌نام"
	},
	{
		key: "preloader",
		label: "آرم / انیمیشن پیش‌بارگذاری (Preloader)",
		hint: "پیشنهاد: فایل متحرک /storage/logos/preloader.gif یا /storage/videos/logo-3d.mp4"
	},
	{
		key: "about",
		label: "آرم متحرک صفحه «درباره ما»",
		hint: "نمایش در هدر صفحه درباره ما (مثلاً logo-3d.mp4)"
	},
	{
		key: "favicon",
		label: "آیکون تب مرورگر (Favicon)",
		hint: "PNG یا GIF کوچک برای تب مرورگر"
	},
	{
		key: "seo_share",
		label: "تصویر اشتراک‌گذاری (SEO / OpenGraph)",
		hint: "تصویر پیش‌فرض در تلگرام، لینکدین و موتورهای جستجو (PNG/JPG)"
	}
];
var FONT_SLOTS = [
	{
		key: "font_site",
		label: "فونت متن کل سایت (Pages Body)"
	},
	{
		key: "font_site_heading",
		label: "فونت تیترها در کل سایت (Headings)"
	},
	{
		key: "font_landing",
		label: "فونت متن صفحه اصلی (Landing)"
	},
	{
		key: "font_landing_heading",
		label: "فونت تیتر صفحه اصلی (Landing H1/H2)"
	},
	{
		key: "font_login",
		label: "فونت صفحات ورود و ثبت‌نام (Login/Register)"
	},
	{
		key: "font_login_heading",
		label: "فونت تیتر صفحه ورود (Login Heading)"
	},
	{
		key: "font_admin",
		label: "فونت متن پنل مدیریت (Admin Body)"
	},
	{
		key: "font_admin_heading",
		label: "فونت تیترهای پنل مدیریت (Admin Headings)"
	},
	{
		key: "font_navbar",
		label: "فونت نوبار بالایی (Navbar)"
	},
	{
		key: "font_footer",
		label: "فونت فوتر پایینی (Footer)"
	}
];
var TextField = ({ label, value, dir = "rtl", onChange }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
	className: "block space-y-1",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-[11px] font-semibold text-slate-600 dark:text-slate-300",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type: "text",
		dir,
		value,
		onChange: (e) => onChange(e.target.value),
		className: "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800"
	})]
});
var LoginAppearanceAdminPage = () => {
	const { addToast, fetchBootstrap, setPreviewTheme, setPreviewBranding } = useAppStore();
	const [tab, setTab] = (0, import_react.useState)("login");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [siteSettings, setSiteSettings] = (0, import_react.useState)(null);
	const [loginCfg, setLoginCfg] = (0, import_react.useState)({ ...DEFAULT_LOGIN_SETTINGS });
	const [logosCfg, setLogosCfg] = (0, import_react.useState)({ ...DEFAULT_BRAND_LOGOS });
	const [appearanceCfg, setAppearanceCfg] = (0, import_react.useState)({ ...DEFAULT_APPEARANCE_SETTINGS });
	const [pagesConfig, setPagesConfig] = (0, import_react.useState)({ ...DEFAULT_PAGES_CONFIG });
	const [themeSettings, setThemeSettings] = (0, import_react.useState)(null);
	const [themeScope, setThemeScope] = (0, import_react.useState)("site");
	const [cmsPages, setCmsPages] = (0, import_react.useState)([]);
	const [selectedCmsPageId, setSelectedCmsPageId] = (0, import_react.useState)(null);
	const [previewFlip, setPreviewFlip] = (0, import_react.useState)("login");
	(0, import_react.useEffect)(() => {
		let active = true;
		Promise.all([
			apiRequest("/admin/settings"),
			apiRequest("/admin/themes"),
			apiRequest("/admin/pages")
		]).then(([settingsRes, themeRes, pagesRes]) => {
			if (!active) return;
			const s = settingsRes.data;
			setSiteSettings(s);
			setLoginCfg({
				...DEFAULT_LOGIN_SETTINGS,
				...s.login || {}
			});
			setLogosCfg({
				...DEFAULT_BRAND_LOGOS,
				...s.logos || {}
			});
			setAppearanceCfg({
				...DEFAULT_APPEARANCE_SETTINGS,
				...s.appearance || {}
			});
			setPagesConfig({
				...DEFAULT_PAGES_CONFIG,
				...s.pages_config || {}
			});
			setThemeSettings(themeRes.settings);
			setCmsPages(pagesRes.data || []);
			if (pagesRes.data?.length) setSelectedCmsPageId(pagesRes.data[0].id);
		}).catch((error) => {
			if (!active) return;
			addToast("error", error instanceof Error ? error.message : "بارگذاری تنظیمات ناموفق بود.");
		}).finally(() => {
			if (active) setLoading(false);
		});
		return () => {
			active = false;
			setPreviewTheme(null);
			setPreviewBranding(null);
		};
	}, [
		addToast,
		setPreviewBranding,
		setPreviewTheme
	]);
	(0, import_react.useEffect)(() => {
		if (loading) return;
		setPreviewBranding({
			login: loginCfg,
			logos: logosCfg,
			appearance: appearanceCfg,
			pages_config: pagesConfig
		});
	}, [
		appearanceCfg,
		loading,
		loginCfg,
		logosCfg,
		pagesConfig,
		setPreviewBranding
	]);
	const activeCmsPage = cmsPages.find((p) => p.id === selectedCmsPageId) || null;
	const updatePageOverride = (key, patch) => {
		setPagesConfig((prev) => ({
			...prev,
			[key]: {
				...prev[key] || {},
				...patch
			}
		}));
	};
	const updateCmsPageField = (field, value) => {
		if (!activeCmsPage) return;
		setCmsPages((prev) => prev.map((item) => item.id === activeCmsPage.id ? {
			...item,
			[field]: value
		} : item));
	};
	const currentScopeValues = themeSettings ? themeScope === "landing" ? {
		palette: themeSettings.landing_palette,
		designStyle: themeSettings.landing_design_style,
		buttonShape: themeSettings.landing_button_shape,
		buttonEffect: themeSettings.landing_button_effect
	} : themeScope === "admin" ? {
		palette: themeSettings.admin_palette,
		designStyle: themeSettings.admin_design_style,
		buttonShape: themeSettings.admin_button_shape,
		buttonEffect: themeSettings.admin_button_effect
	} : {
		palette: themeSettings.active_palette,
		designStyle: themeSettings.design_style,
		buttonShape: themeSettings.button_shape,
		buttonEffect: themeSettings.button_effect
	} : null;
	const handleUpdateScope = (update) => {
		if (!themeSettings) return;
		let next = { ...themeSettings };
		if (themeScope === "landing") next = {
			...next,
			...update.palette ? { landing_palette: update.palette } : {},
			...update.designStyle ? { landing_design_style: update.designStyle } : {},
			...update.buttonShape ? { landing_button_shape: update.buttonShape } : {},
			...update.buttonEffect ? { landing_button_effect: update.buttonEffect } : {}
		};
		else if (themeScope === "admin") next = {
			...next,
			...update.palette ? { admin_palette: update.palette } : {},
			...update.designStyle ? { admin_design_style: update.designStyle } : {},
			...update.buttonShape ? { admin_button_shape: update.buttonShape } : {},
			...update.buttonEffect ? { admin_button_effect: update.buttonEffect } : {}
		};
		else next = {
			...next,
			...update.palette ? { active_palette: update.palette } : {},
			...update.designStyle ? { design_style: update.designStyle } : {},
			...update.buttonShape ? { button_shape: update.buttonShape } : {},
			...update.buttonEffect ? { button_effect: update.buttonEffect } : {}
		};
		setThemeSettings(next);
		setPreviewTheme(next, themeScope);
	};
	const handleSaveAll = async () => {
		if (!siteSettings) return;
		setSaving(true);
		try {
			await apiRequest("/admin/settings", {
				method: "PUT",
				body: JSON.stringify({
					company: {
						...siteSettings.company,
						logo_url: logosCfg.footer || siteSettings.company.logo_url,
						logo_small_url: logosCfg.navbar || siteSettings.company.logo_small_url
					},
					map: siteSettings.map,
					seo: {
						...siteSettings.seo,
						meta_image: logosCfg.seo_share || siteSettings.seo.meta_image
					},
					site: siteSettings.site,
					login: loginCfg,
					logos: logosCfg,
					appearance: appearanceCfg,
					pages_config: pagesConfig
				})
			});
			if (themeSettings) await apiRequest("/admin/themes", {
				method: "PUT",
				body: JSON.stringify(themeSettings)
			});
			if (activeCmsPage) await apiRequest(`/admin/pages/${activeCmsPage.id}`, {
				method: "PUT",
				body: JSON.stringify({
					title_fa: activeCmsPage.title_fa,
					title_en: activeCmsPage.title_en,
					subtitle_fa: activeCmsPage.subtitle_fa,
					subtitle_en: activeCmsPage.subtitle_en,
					content_fa: activeCmsPage.content_fa,
					content_en: activeCmsPage.content_en,
					meta_title: activeCmsPage.meta_title,
					meta_description: activeCmsPage.meta_description,
					meta_image: activeCmsPage.meta_image
				})
			});
			setPreviewTheme(null);
			setPreviewBranding(null);
			await fetchBootstrap();
			addToast("success", "تمام تنظیمات لاگین، فونت‌ها، رنگ‌ها، لوگوها و متون صفحات با موفقیت ذخیره شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "ذخیره تنظیمات با خطا مواجه شد.");
		} finally {
			setSaving(false);
		}
	};
	const handleResetDefaults = () => {
		setLoginCfg({ ...DEFAULT_LOGIN_SETTINGS });
		setLogosCfg({ ...DEFAULT_BRAND_LOGOS });
		setAppearanceCfg({ ...DEFAULT_APPEARANCE_SETTINGS });
		setPagesConfig({ ...DEFAULT_PAGES_CONFIG });
		addToast("info", "تنظیمات بخش‌های فرم به حالت پیش‌فرض بازنشانی شد. برای ثبت نهایی دکمه ذخیره را بزنید.");
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PagePreloader, { label: "در حال بارگذاری استودیو ظاهر و لاگین..." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 pb-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1.5 rounded-full bg-(--theme-primary)/10 px-3 py-1 text-[11px] font-bold text-(--theme-primary)",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "استودیو جامع ظاهر، لوگو و احراز هویت" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-2xl font-extrabold text-slate-900 dark:text-white",
						children: "تنظیمات لاگین و تنظیمات ظاهری"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-slate-500 dark:text-slate-400",
						children: "مدیریت کامل متون و آیکون‌های ورود و ثبت‌نام، رنگ‌بندی و فونت کل بخش‌ها، لوگوهای ثابت/متحرک و متون صفحات سایت"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleResetDefaults,
						className: "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "بازنشانی پیش‌فرض" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(EffectAction, {
						type: "button",
						disabled: saving,
						onClick: handleSaveAll,
						style: {
							backgroundColor: "var(--theme-btn-bg)",
							color: "var(--theme-btn-text)"
						},
						className: "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold shadow-md disabled:opacity-60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: saving ? "در حال ذخیره..." : "ذخیره و انتشار همه تغییرات" })]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto pb-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedTabsEffect, {
					activeId: tab,
					onChange: (next) => setTab(next),
					items: [
						{
							id: "login",
							label: "لاگین و ثبت‌نام",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4" })
						},
						{
							id: "fonts-colors",
							label: "رنگ‌بندی و فونت کل بخش‌ها",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "h-4 w-4" })
						},
						{
							id: "logos",
							label: "لوگوها و فایل‌های متحرک",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "h-4 w-4" })
						},
						{
							id: "pages",
							label: "متون و لوگوی صفحات",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
						}
					]
				})
			}),
			tab === "login" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 xl:grid-cols-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 xl:col-span-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-4 text-sm font-extrabold",
								children: "متون صفحه ورود و احراز هویت دوعاملی (FA / EN)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "برچسب امنیتی (فارسی)",
										value: loginCfg.badge_text_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											badge_text_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Badge Text (EN)",
										dir: "ltr",
										value: loginCfg.badge_text_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											badge_text_en: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "تیتر ورود (فارسی)",
										value: loginCfg.title_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											title_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Login Title (EN)",
										dir: "ltr",
										value: loginCfg.title_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											title_en: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "زیرتیتر ورود (فارسی)",
										value: loginCfg.subtitle_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											subtitle_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Login Subtitle (EN)",
										dir: "ltr",
										value: loginCfg.subtitle_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											subtitle_en: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "عنوان فرم 2FA (فارسی)",
										value: loginCfg.two_factor_title_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											two_factor_title_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "2FA Title (EN)",
										dir: "ltr",
										value: loginCfg.two_factor_title_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											two_factor_title_en: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "راهنمای 2FA (فارسی)",
										value: loginCfg.two_factor_hint_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											two_factor_hint_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "2FA Hint (EN)",
										dir: "ltr",
										value: loginCfg.two_factor_hint_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											two_factor_hint_en: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "برچسب ایمیل (فارسی)",
										value: loginCfg.email_label_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											email_label_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Email Label (EN)",
										dir: "ltr",
										value: loginCfg.email_label_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											email_label_en: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "مثال ایمیل (فارسی)",
										dir: "ltr",
										value: loginCfg.email_placeholder_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											email_placeholder_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Email Placeholder (EN)",
										dir: "ltr",
										value: loginCfg.email_placeholder_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											email_placeholder_en: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "برچسب رمز عبور (فارسی)",
										value: loginCfg.password_label_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											password_label_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Password Label (EN)",
										dir: "ltr",
										value: loginCfg.password_label_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											password_label_en: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "دکمه ورود (فارسی)",
										value: loginCfg.submit_text_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											submit_text_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Submit Button (EN)",
										dir: "ltr",
										value: loginCfg.submit_text_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											submit_text_en: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "دکمه تایید 2FA (فارسی)",
										value: loginCfg.two_factor_submit_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											two_factor_submit_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "2FA Submit (EN)",
										dir: "ltr",
										value: loginCfg.two_factor_submit_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											two_factor_submit_en: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "لینک ثبت‌نام جدید (فارسی)",
										value: loginCfg.register_cta_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											register_cta_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Register Link (EN)",
										dir: "ltr",
										value: loginCfg.register_cta_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											register_cta_en: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "بازگشت به سایت (فارسی)",
										value: loginCfg.back_home_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											back_home_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Back to Site (EN)",
										dir: "ltr",
										value: loginCfg.back_home_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											back_home_en: v
										})
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-4 text-sm font-extrabold",
								children: "متون فرم ثبت‌نام (کارت چرخشی پشتی / Register)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "تیتر ثبت‌نام (فارسی)",
										value: loginCfg.register_title_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											register_title_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Register Title (EN)",
										dir: "ltr",
										value: loginCfg.register_title_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											register_title_en: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "زیرتیتر ثبت‌نام (فارسی)",
										value: loginCfg.register_subtitle_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											register_subtitle_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Register Subtitle (EN)",
										dir: "ltr",
										value: loginCfg.register_subtitle_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											register_subtitle_en: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "برچسب نام و نام خانوادگی",
										value: loginCfg.register_name_label_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											register_name_label_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Full Name Label (EN)",
										dir: "ltr",
										value: loginCfg.register_name_label_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											register_name_label_en: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "برچسب شماره تماس",
										value: loginCfg.register_phone_label_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											register_phone_label_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Phone Label (EN)",
										dir: "ltr",
										value: loginCfg.register_phone_label_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											register_phone_label_en: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "دکمه ثبت‌نام (فارسی)",
										value: loginCfg.register_submit_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											register_submit_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Register Submit (EN)",
										dir: "ltr",
										value: loginCfg.register_submit_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											register_submit_en: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "لینک بازگشت به ورود (فارسی)",
										value: loginCfg.login_cta_fa,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											login_cta_fa: v
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Sign In Link (EN)",
										dir: "ltr",
										value: loginCfg.login_cta_en,
										onChange: (v) => setLoginCfg({
											...loginCfg,
											login_cta_en: v
										})
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mb-4 text-sm font-extrabold",
									children: "آیکون‌های لاگین، رنگ‌بندی اختصاصی و افکت‌ها"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPicker, {
											label: "آیکون برچسب امنیتی",
											value: loginCfg.badge_icon,
											onChange: (v) => setLoginCfg({
												...loginCfg,
												badge_icon: v
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPicker, {
											label: "آیکون ایمیل",
											value: loginCfg.email_icon,
											onChange: (v) => setLoginCfg({
												...loginCfg,
												email_icon: v
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPicker, {
											label: "آیکون رمز عبور",
											value: loginCfg.password_icon,
											onChange: (v) => setLoginCfg({
												...loginCfg,
												password_icon: v
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPicker, {
											label: "آیکون دکمه ورود",
											value: loginCfg.submit_icon,
											onChange: (v) => setLoginCfg({
												...loginCfg,
												submit_icon: v
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPicker, {
											label: "آیکون ثبت‌نام",
											value: loginCfg.register_icon,
											onChange: (v) => setLoginCfg({
												...loginCfg,
												register_icon: v
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPicker, {
											label: "آیکون 2FA",
											value: loginCfg.two_factor_icon,
											onChange: (v) => setLoginCfg({
												...loginCfg,
												two_factor_icon: v
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPicker, {
											label: "آیکون کپچا",
											value: loginCfg.captcha_icon,
											onChange: (v) => setLoginCfg({
												...loginCfg,
												captcha_icon: v
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPicker, {
											label: "آیکون بازگشت",
											value: loginCfg.back_icon,
											onChange: (v) => setLoginCfg({
												...loginCfg,
												back_icon: v
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-5 dark:border-slate-800",
									children: [
										["backdrop_color", "پس‌زمینه کل صفحه"],
										["card_bg_color", "پس‌زمینه کارت شیشه‌ای"],
										["accent_color", "رنگ دکمه و تاکید"],
										["text_color", "رنگ متون"],
										["input_bg_color", "پس‌زمینه ورودی‌ها"]
									].map(([key, lbl]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "space-y-1 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block font-medium text-slate-600 dark:text-slate-300",
											children: lbl
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "color",
												value: loginCfg[key].startsWith("#") ? loginCfg[key] : "#0f172a",
												onChange: (e) => setLoginCfg({
													...loginCfg,
													[key]: e.target.value
												}),
												className: "h-8 w-8 cursor-pointer rounded border border-slate-200 p-0.5"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												dir: "ltr",
												value: loginCfg[key],
												onChange: (e) => setLoginCfg({
													...loginCfg,
													[key]: e.target.value
												}),
												className: "min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-[11px] dark:border-slate-700 dark:bg-slate-800"
											})]
										})]
									}, key))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 dark:border-slate-800",
									children: [
										["enable_3d_flip", "چرخش سه‌بعدی ورود / ثبت‌نام (Effect 083)"],
										["show_decorative_cube", "مکعب شیشه‌ای سه‌بعدی (Effect 028)"],
										["enable_particles", "ذرات تعاملی شبکه (Effect 051)"],
										["enable_bg_slideshow", "اسلایدشو نرم پس‌زمینه (Effect 041)"]
									].map(([key, lbl]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 p-3 text-xs font-semibold dark:border-slate-800",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: Boolean(loginCfg[key]),
											onChange: (e) => setLoginCfg({
												...loginCfg,
												[key]: e.target.checked
											}),
											className: "h-4 w-4 accent-(--theme-primary)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: lbl })]
									}, key))
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4 xl:col-span-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sticky top-20 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-extrabold",
								children: "پیش‌نمایش زنده فرم لاگین و ثبت‌نام"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setPreviewFlip("login"),
									className: `rounded-lg px-2.5 py-1 text-[11px] font-bold ${previewFlip === "login" ? "bg-(--theme-primary) text-white" : "bg-slate-100 dark:bg-slate-800"}`,
									children: "نمای ورود"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setPreviewFlip("register"),
									className: `rounded-lg px-2.5 py-1 text-[11px] font-bold ${previewFlip === "register" ? "bg-(--theme-primary) text-white" : "bg-slate-100 dark:bg-slate-800"}`,
									children: "نمای ثبت‌نام"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative overflow-hidden rounded-2xl p-5",
							style: {
								backgroundColor: loginCfg.backdrop_color,
								color: loginCfg.text_color,
								fontFamily: FONT_CSS_MAP[appearanceCfg.font_login]
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-white/15 p-5 shadow-2xl backdrop-blur-xl",
								style: { backgroundColor: loginCfg.card_bg_color },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-4 flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-10 w-10 overflow-hidden rounded-xl bg-white p-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLogo, {
												placement: previewFlip === "login" ? "login" : "register",
												overrideUrl: previewFlip === "login" ? logosCfg.login : logosCfg.register,
												className: "h-full w-full"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-extrabold",
											children: "پارس پولاد آقایی"
										})]
									}), loginCfg.show_decorative_cube && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DecorativeCube, {
										size: "sm",
										className: "h-9 w-9 rounded-lg border border-white/10 bg-white/5"
									})]
								}), previewFlip === "login" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
												name: loginCfg.badge_icon,
												className: "h-3 w-3"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: loginCfg.badge_text_fa })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											style: { fontFamily: FONT_CSS_MAP[appearanceCfg.font_login_heading] },
											className: "text-base font-extrabold",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectText, {
												inverse: true,
												children: loginCfg.title_fa
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] opacity-75",
											children: loginCfg.subtitle_fa
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2 pt-1 text-[11px]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1.5 opacity-85",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
														name: loginCfg.email_icon,
														className: "h-3.5 w-3.5"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: loginCfg.email_label_fa })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "rounded-lg border border-white/15 px-3 py-2 text-[11px] opacity-60",
													style: { backgroundColor: loginCfg.input_bg_color },
													children: loginCfg.email_placeholder_fa
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1.5 opacity-85",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
														name: loginCfg.password_icon,
														className: "h-3.5 w-3.5"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: loginCfg.password_label_fa })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "rounded-lg border border-white/15 px-3 py-2 text-[11px] opacity-60",
													style: { backgroundColor: loginCfg.input_bg_color },
													children: "••••••••"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold text-white",
											style: { backgroundColor: loginCfg.accent_color },
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
												name: loginCfg.submit_icon,
												className: "h-3.5 w-3.5"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: loginCfg.submit_text_fa })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between pt-2 text-[10px] opacity-75",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
													name: loginCfg.register_icon,
													className: "h-3 w-3"
												}), loginCfg.register_cta_fa]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
													name: loginCfg.back_icon,
													className: "h-3 w-3"
												}), loginCfg.back_home_fa]
											})]
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											style: { fontFamily: FONT_CSS_MAP[appearanceCfg.font_login_heading] },
											className: "text-base font-extrabold",
											children: loginCfg.register_title_fa
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] opacity-75",
											children: loginCfg.register_subtitle_fa
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2 text-[11px]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: loginCfg.register_name_label_fa }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "h-8 rounded-lg border border-white/15",
													style: { backgroundColor: loginCfg.input_bg_color }
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: loginCfg.email_label_fa }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "h-8 rounded-lg border border-white/15",
													style: { backgroundColor: loginCfg.input_bg_color }
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: loginCfg.register_phone_label_fa }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "h-8 rounded-lg border border-white/15",
													style: { backgroundColor: loginCfg.input_bg_color }
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold text-white",
											style: { backgroundColor: loginCfg.accent_color },
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
												name: loginCfg.register_icon,
												className: "h-3.5 w-3.5"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: loginCfg.register_submit_fa })]
										})
									]
								})]
							})
						})]
					})
				})]
			}),
			tab === "fonts-colors" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Type, { className: "h-5 w-5 text-(--theme-primary)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-base font-extrabold",
								children: "مدیریت فونت آفلاین کل بخش‌های برنامه"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-slate-500",
								children: "تمام ۶ خانواده فونت به‌صورت داخلی (بدون CDN) در سیستم بارگذاری شده‌اند."
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold dark:border-slate-700",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"اندازه پایه متن: ",
								appearanceCfg.base_font_size,
								"px"
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 13,
								max: 20,
								value: appearanceCfg.base_font_size,
								onChange: (e) => setAppearanceCfg({
									...appearanceCfg,
									base_font_size: Number(e.target.value)
								}),
								className: "accent-(--theme-primary)"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 md:grid-cols-2",
						children: FONT_SLOTS.map((slot) => {
							const currentKey = appearanceCfg[slot.key];
							const fontMeta = BUNDLED_FONTS.find((f) => f.key === currentKey) || BUNDLED_FONTS[0];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "block text-xs font-bold text-slate-700 dark:text-slate-200",
										children: slot.label
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: currentKey,
										onChange: (e) => setAppearanceCfg({
											...appearanceCfg,
											[slot.key]: e.target.value
										}),
										className: "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-900",
										children: BUNDLED_FONTS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: f.key,
											children: f.label_fa
										}, f.key))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2.5 rounded-lg bg-white px-3 py-2 text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-100",
										style: { fontFamily: FONT_CSS_MAP[fontMeta.key] },
										children: [fontMeta.sample, " — ۱۲۳۴۵۶۷۸۹۰"]
									})
								]
							}, slot.key);
						})
					})]
				}), themeSettings && currentScopeValues && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-base font-extrabold",
								children: "مدیریت رنگ‌بندی و زبان بصری کل بخش‌ها"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-slate-500",
								children: "رنگ‌های اصلی، پس‌زمینه، نوبار، فوتر و دکمه‌های هر بخش را جداگانه تنظیم کنید."
							})] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeScopeTabs, {
							selected: themeScope,
							onSelect: (next) => {
								setThemeScope(next);
								setPreviewTheme(themeSettings, next);
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeScopeEditor, {
							title: themeScope === "landing" ? "صفحه اصلی" : themeScope === "admin" ? "پنل مدیریت" : "سایت عمومی",
							description: "تغییرات بلافاصله در پیش‌نمایش فعال می‌شوند و با ذخیره نهایی در سراسر پرتال اعمال می‌گردند.",
							values: currentScopeValues,
							onChange: handleUpdateScope
						})
					]
				})]
			}),
			tab === "logos" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-amber-900 dark:text-amber-200",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "پشتیبانی کامل از آرم و فایل‌های متحرک:" }),
						" برای هر بخش از سایت (نوبار، فوتر، سایدبار پنل، لاگین، ثبت‌نام، پیش‌بارگذاری، صفحه درباره ما و فاوآیکون) می‌توانید تصویر ثابت (PNG/JPG/WEBP) یا فایل متحرک (",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "GIF" }),
						"، ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "MP4" }),
						"، ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "WEBM" }),
						" مانند ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							dir: "ltr",
							children: "/storage/videos/logo-3d.mp4"
						}),
						" و ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							dir: "ltr",
							children: "/storage/logos/preloader.gif"
						}),
						") را انتخاب و با پیش‌نمایش زنده تعریف کنید."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: LOGO_FIELDS.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaUrlField, {
						label: field.label,
						value: logosCfg[field.key],
						onChange: (url) => setLogosCfg({
							...logosCfg,
							[field.key]: url
						}),
						folder: "logos",
						showAnimatedPresets: true,
						hint: field.hint
					}, field.key))
				})]
			}),
			tab === "pages" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-4 text-base font-extrabold",
						children: "متون و لوگوی صفحات سیستمی و بخش ویژه صفحه اصلی"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-5 lg:grid-cols-2",
						children: SYSTEM_PAGE_CARDS.map((card) => {
							const entry = pagesConfig[card.key] || {};
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-xs font-extrabold text-(--theme-primary)",
											children: card.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-[10px] text-slate-400",
											children: card.key
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-2.5 sm:grid-cols-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
												label: "تیتر (فارسی)",
												value: entry.title_fa || "",
												onChange: (v) => updatePageOverride(card.key, { title_fa: v })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
												label: "Title (EN)",
												dir: "ltr",
												value: entry.title_en || "",
												onChange: (v) => updatePageOverride(card.key, { title_en: v })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
												label: "توضیحات (فارسی)",
												value: entry.subtitle_fa || "",
												onChange: (v) => updatePageOverride(card.key, { subtitle_fa: v })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
												label: "Subtitle (EN)",
												dir: "ltr",
												value: entry.subtitle_en || "",
												onChange: (v) => updatePageOverride(card.key, { subtitle_en: v })
											}),
											card.hasBadge && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
												label: "نشان (Badge FA)",
												value: entry.badge_fa || "",
												onChange: (v) => updatePageOverride(card.key, { badge_fa: v })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
												label: "Badge (EN)",
												dir: "ltr",
												value: entry.badge_en || "",
												onChange: (v) => updatePageOverride(card.key, { badge_en: v })
											})] }),
											card.hasCta && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
												label: "متن دکمه (فارسی)",
												value: entry.cta_fa || "",
												onChange: (v) => updatePageOverride(card.key, { cta_fa: v })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
												label: "Button Label (EN)",
												dir: "ltr",
												value: entry.cta_en || "",
												onChange: (v) => updatePageOverride(card.key, { cta_en: v })
											})] })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaUrlField, {
										label: "لوگو / تصویر این صفحه",
										value: entry.logo_url || "",
										onChange: (url) => updatePageOverride(card.key, { logo_url: url }),
										showAnimatedPresets: true
									})
								]
							}, card.key);
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-4 text-base font-extrabold",
						children: "متون و لوگوی تمامی صفحات محتوایی پرتال (CMS Pages)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-5 lg:grid-cols-12",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-1.5 lg:col-span-4",
							children: cmsPages.map((p) => {
								const active = p.id === selectedCmsPageId;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setSelectedCmsPageId(p.id),
									className: `flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-start text-xs font-bold transition-colors ${active ? "border-(--theme-primary) bg-(--theme-primary)/10 text-(--theme-primary)" : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.title_fa }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono text-[10px] opacity-70",
										children: ["/", p.slug]
									})]
								}, p.id);
							})
						}), activeCmsPage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 lg:col-span-8 dark:border-slate-800 dark:bg-slate-800/30",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1.5 text-sm font-extrabold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-emerald-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["ویرایش صفحه: ", activeCmsPage.title_fa] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono text-xs text-slate-400",
										children: ["slug: ", activeCmsPage.slug]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
											label: "تیتر اصلی (فارسی)",
											value: activeCmsPage.title_fa,
											onChange: (v) => updateCmsPageField("title_fa", v)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
											label: "Main Title (EN)",
											dir: "ltr",
											value: activeCmsPage.title_en,
											onChange: (v) => updateCmsPageField("title_en", v)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
											label: "زیرتیتر (فارسی)",
											value: activeCmsPage.subtitle_fa || "",
											onChange: (v) => updateCmsPageField("subtitle_fa", v)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
											label: "Subtitle (EN)",
											dir: "ltr",
											value: activeCmsPage.subtitle_en || "",
											onChange: (v) => updateCmsPageField("subtitle_en", v)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
											label: "برچسب بالای صفحه (Badge FA)",
											value: pagesConfig[activeCmsPage.slug]?.badge_fa || "",
											onChange: (v) => updatePageOverride(activeCmsPage.slug, { badge_fa: v })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
											label: "Top Badge (EN)",
											dir: "ltr",
											value: pagesConfig[activeCmsPage.slug]?.badge_en || "",
											onChange: (v) => updatePageOverride(activeCmsPage.slug, { badge_en: v })
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] font-semibold text-slate-600 dark:text-slate-300",
											children: "متن بدنه (فارسی)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											rows: 4,
											value: activeCmsPage.content_fa,
											onChange: (e) => updateCmsPageField("content_fa", e.target.value),
											className: "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] font-semibold text-slate-600 dark:text-slate-300",
											children: "Body Content (EN)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											rows: 4,
											dir: "ltr",
											value: activeCmsPage.content_en,
											onChange: (e) => updateCmsPageField("content_en", e.target.value),
											className: "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaUrlField, {
										label: "لوگوی اختصاصی هدر این صفحه (ثابت یا متحرک)",
										value: pagesConfig[activeCmsPage.slug]?.logo_url || "",
										onChange: (url) => updatePageOverride(activeCmsPage.slug, { logo_url: url }),
										showAnimatedPresets: true
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaUrlField, {
										label: "تصویر سئو / کاور این صفحه (Meta Image)",
										value: activeCmsPage.meta_image || "",
										onChange: (url) => updateCmsPageField("meta_image", url),
										folder: "pages"
									})]
								})
							]
						})]
					})]
				})]
			})
		]
	});
};
export { LoginAppearanceAdminPage };
