import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { t as Plus } from "./plus-DOUCSCbs.js";
import { t as Save } from "./save-CsxfzoRu.js";
import { n as ThemeScopeEditor, t as ThemeScopeTabs } from "./ThemeScopeTabs-BPziSA6p.js";
import { C as PagePreloader, N as Sparkles, T as AnimatedBackground, _ as EffectAction, v as DecorativeCube, w as EffectText } from "./index-Dacn8Sc3.js";
import { t as SearchableSelect } from "./SearchableSelect-BCBuOYhg.js";
// src/components/admin/theme/ThemeStudioHero.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var ThemeStudioHero = ({ onPreview, onResetPreview }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
	className: "theme-studio-hero",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedBackground, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative z-10 flex flex-wrap items-center justify-between gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5 sm:grid",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DecorativeCube, { size: "lg" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-200/80",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Visual identity studio" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-xl font-black sm:text-2xl",
					children: ["استودیو ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectText, {
						inverse: true,
						children: "هویت بصری"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-xs leading-6 text-slate-300",
					children: "ظاهر صفحات عمومی، لندینگ و پنل مدیریت را مستقل طراحی کنید؛ تغییرات زنده پیش‌نمایش و ذخیره می‌شوند."
				})
			] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onPreview,
				className: "theme-studio-hero-button",
				children: "پیش‌نمایش انتخاب فعلی"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onResetPreview,
				className: "theme-studio-hero-button theme-studio-hero-button-muted",
				children: "لغو پیش‌نمایش"
			})]
		})]
	})]
});
// src/pages/admin/ThemeAdminPage.tsx
var ThemeAdminPage = () => {
	const { fetchBootstrap, setPreviewTheme, addToast } = useAppStore();
	const [settings, setSettings] = (0, import_react.useState)(null);
	const [presets, setPresets] = (0, import_react.useState)([]);
	const [scope, setScope] = (0, import_react.useState)("admin");
	const [newPresetName, setNewPresetName] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [creatingPreset, setCreatingPreset] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let active = true;
		apiRequest("/admin/themes").then((response) => {
			if (!active) return;
			setSettings(response.settings);
			setPresets(response.presets);
		}).catch((error) => {
			if (!active) return;
			console.error("Could not load theme studio settings.", error);
			addToast("error", "دریافت تنظیمات تم ناموفق بود. اتصال سرور را بررسی کنید.");
		});
		return () => {
			active = false;
			setPreviewTheme(null);
		};
	}, [addToast, setPreviewTheme]);
	const scopeValues = (0, import_react.useMemo)(() => {
		if (!settings) return null;
		switch (scope) {
			case "landing": return {
				palette: settings.landing_palette,
				designStyle: settings.landing_design_style,
				buttonShape: settings.landing_button_shape,
				buttonEffect: settings.landing_button_effect
			};
			case "admin": return {
				palette: settings.admin_palette,
				designStyle: settings.admin_design_style,
				buttonShape: settings.admin_button_shape,
				buttonEffect: settings.admin_button_effect
			};
			default: return {
				palette: settings.active_palette,
				designStyle: settings.design_style,
				buttonShape: settings.button_shape,
				buttonEffect: settings.button_effect
			};
		}
	}, [scope, settings]);
	const previewSettings = (next, previewScope = scope, previewMode = null) => {
		setSettings(next);
		setPreviewTheme(next, previewScope, previewMode);
	};
	const updateScope = (update) => {
		if (!settings) return;
		let next;
		if (scope === "landing") next = {
			...settings,
			...update.palette ? { landing_palette: update.palette } : {},
			...update.designStyle ? { landing_design_style: update.designStyle } : {},
			...update.buttonShape ? { landing_button_shape: update.buttonShape } : {},
			...update.buttonEffect ? { landing_button_effect: update.buttonEffect } : {}
		};
		else if (scope === "admin") next = {
			...settings,
			...update.palette ? { admin_palette: update.palette } : {},
			...update.designStyle ? { admin_design_style: update.designStyle } : {},
			...update.buttonShape ? { admin_button_shape: update.buttonShape } : {},
			...update.buttonEffect ? { admin_button_effect: update.buttonEffect } : {}
		};
		else next = {
			...settings,
			...update.palette ? { active_palette: update.palette } : {},
			...update.designStyle ? { design_style: update.designStyle } : {},
			...update.buttonShape ? { button_shape: update.buttonShape } : {},
			...update.buttonEffect ? { button_effect: update.buttonEffect } : {}
		};
		previewSettings(next);
	};
	const handleSelectScope = (nextScope) => {
		if (!settings) return;
		setScope(nextScope);
		setPreviewTheme(settings, nextScope);
	};
	const handleSelectPreset = (slug) => {
		if (!settings) return;
		const preset = presets.find((item) => item.slug === slug);
		if (!preset) return;
		previewSettings({
			...settings,
			active_preset_slug: preset.slug,
			active_palette: { ...preset.palette },
			design_style: preset.design_style,
			button_shape: preset.button_shape,
			button_effect: preset.button_effect
		}, "site");
		setScope("site");
	};
	const handleSave = async () => {
		if (!settings) return;
		setSaving(true);
		try {
			await apiRequest("/admin/themes", {
				method: "PUT",
				body: JSON.stringify(settings)
			});
			setPreviewTheme(null);
			await fetchBootstrap();
			addToast("success", "تنظیمات مستقل سایت، لندینگ و پنل ذخیره و منتشر شد.");
		} catch (error) {
			console.error("Could not save theme settings.", error);
			addToast("error", "ذخیره تنظیمات تم ناموفق بود.");
		} finally {
			setSaving(false);
		}
	};
	const handleCreatePreset = async () => {
		if (!settings || !newPresetName.trim()) return;
		setCreatingPreset(true);
		try {
			const response = await apiRequest("/admin/themes/presets", {
				method: "POST",
				body: JSON.stringify({
					slug: `custom-${Date.now()}`,
					name_fa: newPresetName.trim(),
					name_en: newPresetName.trim(),
					is_default: false,
					palette: settings.active_palette,
					design_style: settings.design_style,
					button_shape: settings.button_shape,
					button_effect: settings.button_effect
				})
			});
			setPresets((current) => [...current, response.data]);
			setNewPresetName("");
			addToast("success", "ترکیب صفحات عمومی به‌عنوان تم آماده ذخیره شد.");
		} catch (error) {
			console.error("Could not create theme preset.", error);
			addToast("error", "ساخت تم آماده ناموفق بود.");
		} finally {
			setCreatingPreset(false);
		}
	};
	if (!settings || !scopeValues) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PagePreloader, { label: "در حال آماده‌سازی استودیو هویت بصری..." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "theme-studio-page space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeStudioHero, {
				onPreview: () => {
					setPreviewTheme(settings, scope);
					addToast("info", "پیش‌نمایش محدودهٔ انتخاب‌شده فعال شد.");
				},
				onResetPreview: () => {
					setPreviewTheme(null);
					addToast("info", "پیش‌نمایش لغو شد.");
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeScopeTabs, {
				selected: scope,
				onSelect: handleSelectScope
			}),
			scope === "landing" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "theme-editor-section flex cursor-pointer items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: settings.landing_theme_enabled,
					onChange: (event) => {
						const next = {
							...settings,
							landing_theme_enabled: event.target.checked
						};
						previewSettings(next, "landing");
					},
					className: "mt-1 h-4 w-4 accent-(--theme-primary)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-xs font-bold",
					children: "فعال‌سازی تم مستقل لندینگ"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 block text-[11px] leading-5 text-slate-500",
					children: "با خاموش‌کردن این گزینه، صفحهٔ اصلی از تم صفحات عمومی استفاده می‌کند."
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeScopeEditor, {
				title: scope === "landing" ? "طراحی صفحهٔ اصلی" : scope === "admin" ? "طراحی پنل مدیریت" : "طراحی صفحات عمومی",
				description: scope === "landing" ? "پالت، سبک سطوح، فرم و افکت دکمهٔ صفحهٔ اصلی مستقل از پنل و سایر صفحات ذخیره می‌شود." : scope === "admin" ? "ظاهر داشبورد، سربرگ، منوی کناری و اکشن‌های پنل را جداگانه تنظیم کنید." : "تم پایهٔ صفحات داخلی وب‌سایت؛ لندینگ و پنل می‌توانند تنظیم مستقل داشته باشند.",
				values: scopeValues,
				onChange: updateScope
			}),
			scope === "site" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "theme-editor-section grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
						label: "تم آمادهٔ صفحات عمومی",
						options: presets.map((preset) => ({
							value: preset.slug,
							label: preset.name_fa
						})),
						value: settings.active_preset_slug,
						onChange: handleSelectPreset
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "min-w-0 flex-1 text-xs font-medium",
							children: ["ذخیرهٔ ترکیب فعلی", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: newPresetName,
								onChange: (event) => setNewPresetName(event.target.value),
								placeholder: "نام تم آماده",
								className: "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-900"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: !newPresetName.trim() || creatingPreset,
							onClick: handleCreatePreset,
							className: "theme-secondary-action inline-flex h-10.5 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: creatingPreset ? "در حال ذخیره" : "ذخیره" })]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
					label: "حالت پیش‌فرض",
					options: [{
						value: "light",
						label: "روشن"
					}, {
						value: "dark",
						label: "تاریک"
					}],
					value: settings.default_mode,
					onChange: (value) => {
						const next = {
							...settings,
							default_mode: value
						};
						previewSettings(next, scope, next.default_mode);
					}
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(EffectAction, {
					type: "button",
					disabled: saving,
					onClick: handleSave,
					style: {
						backgroundColor: "var(--theme-btn-bg)",
						color: "var(--theme-btn-text)"
					},
					className: "inline-flex min-h-11 items-center gap-2 px-5 text-xs font-bold shadow-lg disabled:cursor-wait disabled:opacity-60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: saving ? "در حال ذخیره و انتشار..." : "ذخیره و انتشار تنظیمات" })]
				})
			})
		]
	});
};
export { ThemeAdminPage };
