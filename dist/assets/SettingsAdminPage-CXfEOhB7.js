import { a as createLucideIcon, l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { C as PagePreloader, Q as Download, _ as EffectAction, m as EffectTabPanel, p as EffectTabButton } from "./index-Dacn8Sc3.js";
import { t as Save } from "./save-CsxfzoRu.js";
import { t as MediaUrlField } from "./MediaUrlField-xcz31gVx.js";
import { t as RichTextEditor } from "./RichTextEditor-Cl-tKHcM.js";
import { t as SearchableSelect } from "./SearchableSelect-BCBuOYhg.js";
import { t as PartnerLogoManager } from "./PartnerLogoManager-DFqp5dbe.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Database = createLucideIcon("database", [
	["ellipse", {
		cx: "12",
		cy: "5",
		rx: "9",
		ry: "3",
		key: "msslwz"
	}],
	["path", {
		d: "M3 5V19A9 3 0 0 0 21 19V5",
		key: "1wlel7"
	}],
	["path", {
		d: "M3 12A9 3 0 0 0 21 12",
		key: "mv7ke4"
	}]
]);
// src/pages/admin/SettingsAdminPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var SettingsAdminPage = () => {
	const { addToast, fetchBootstrap, token } = useAppStore();
	const [settings, setSettings] = (0, import_react.useState)(null);
	const [templates, setTemplates] = (0, import_react.useState)([]);
	const [smtpPassPlain, setSmtpPassPlain] = (0, import_react.useState)("");
	const [emailTestAddress, setEmailTestAddress] = (0, import_react.useState)("");
	const [testingEmail, setTestingEmail] = (0, import_react.useState)(false);
	const [smsKeyPlain, setSmsKeyPlain] = (0, import_react.useState)("");
	const [tab, setTab] = (0, import_react.useState)("company");
	(0, import_react.useEffect)(() => {
		apiRequest("/admin/settings").then((r) => setSettings(r.data)).catch(() => {});
		apiRequest("/admin/notification-templates").then((r) => setTemplates(r.data)).catch(() => {});
	}, []);
	if (!settings) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PagePreloader, { label: "در حال دریافت تنظیمات..." });
	const saveAll = async () => {
		await apiRequest("/admin/settings", {
			method: "PUT",
			body: JSON.stringify({
				...settings,
				email: {
					...settings.email,
					smtp_password_plain: smtpPassPlain || void 0
				},
				sms: {
					...settings.sms,
					api_key_plain: smsKeyPlain || void 0
				}
			})
		});
		await fetchBootstrap();
		addToast("success", "تنظیمات متمرکز سامانه ذخیره و رمزنگاری شد.");
	};
	const testEmail = async () => {
		setTestingEmail(true);
		try {
			await apiRequest("/admin/settings/email/test", {
				method: "POST",
				body: JSON.stringify({ to: emailTestAddress })
			});
			addToast("success", "ایمیل آزمایشی ارسال شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "ارسال ایمیل آزمایشی ناموفق بود.");
		} finally {
			setTestingEmail(false);
		}
	};
	const downloadBackup = async () => {
		const blob = await (await fetch("/api/v1/admin/backup", { headers: { Authorization: `Bearer ${token}` } })).blob();
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `parspolad-backup-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);
		addToast("success", "فایل پشتیبان دیتابیس دانلود شد.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						{
							id: "company",
							label: "اطلاعات شرکت و لوگو"
						},
						{
							id: "social",
							label: "نوار تماس و شبکه‌های اجتماعی"
						},
						{
							id: "email",
							label: "تنظیمات ایمیل و قالب HTML"
						},
						{
							id: "sms",
							label: "تنظیمات پنل پیامک (SMS)"
						},
						{
							id: "map_seo",
							label: "نقشه، سئو و حالت نگهداری"
						},
						{
							id: "backup",
							label: "پشتیبان‌گیری دیتابیس"
						},
						{
							id: "partners",
							label: "لوگوهای اسلایدر صفحه اصلی"
						}
					].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectTabButton, {
						type: "button",
						onClick: () => setTab(t.id),
						selected: tab === t.id,
						className: `rounded-lg px-3.5 py-2 text-xs font-semibold ${tab === t.id ? "bg-(--theme-primary) text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`,
						children: t.label
					}, t.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(EffectAction, {
					type: "button",
					onClick: saveAll,
					style: { backgroundColor: "var(--theme-primary)" },
					className: "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ذخیره تنظیمات" })]
				})]
			}),
			tab === "company" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(EffectTabPanel, {
				className: "grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "نام فارسی شرکت"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: settings.company.name_fa,
						onChange: (e) => setSettings({
							...settings,
							company: {
								...settings.company,
								name_fa: e.target.value
							}
						}),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "نام انگلیسی شرکت"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						dir: "ltr",
						value: settings.company.name_en || "",
						onChange: (e) => setSettings({
							...settings,
							company: {
								...settings.company,
								name_en: e.target.value
							}
						}),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "شعار سازمانی"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: settings.company.slogan_fa,
						onChange: (e) => setSettings({
							...settings,
							company: {
								...settings.company,
								slogan_fa: e.target.value
							}
						}),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "شعار سازمانی (انگلیسی)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						dir: "ltr",
						value: settings.company.slogan_en || "",
						onChange: (e) => setSettings({
							...settings,
							company: {
								...settings.company,
								slogan_en: e.target.value
							}
						}),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "آدرس کارخانه"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: settings.company.factory_address_fa,
						onChange: (e) => setSettings({
							...settings,
							company: {
								...settings.company,
								factory_address_fa: e.target.value
							}
						}),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "تلفن کارخانه"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						dir: "ltr",
						value: settings.company.factory_phone,
						onChange: (e) => setSettings({
							...settings,
							company: {
								...settings.company,
								factory_phone: e.target.value
							}
						}),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "آدرس دفتر مرکزی"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: settings.company.office_address_fa,
						onChange: (e) => setSettings({
							...settings,
							company: {
								...settings.company,
								office_address_fa: e.target.value
							}
						}),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "تلفن دفتر مرکزی"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						dir: "ltr",
						value: settings.company.office_phone || "",
						onChange: (e) => setSettings({
							...settings,
							company: {
								...settings.company,
								office_phone: e.target.value
							}
						}),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "شماره امور بازرگانی"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						dir: "ltr",
						value: settings.company.commercial_phone || "",
						onChange: (e) => setSettings({
							...settings,
							company: {
								...settings.company,
								commercial_phone: e.target.value
							}
						}),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "متن کپی‌رایت فوتر"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: settings.company.footer_note_fa,
						onChange: (e) => setSettings({
							...settings,
							company: {
								...settings.company,
								footer_note_fa: e.target.value
							}
						}),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "آخرین به‌روزرسانی کاتالوگ (فارسی)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: settings.company.last_updated_fa || "",
						onChange: (e) => setSettings({
							...settings,
							company: {
								...settings.company,
								last_updated_fa: e.target.value
							}
						}),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "آخرین به‌روزرسانی کاتالوگ (انگلیسی)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						dir: "ltr",
						value: settings.company.last_updated_en || "",
						onChange: (e) => setSettings({
							...settings,
							company: {
								...settings.company,
								last_updated_en: e.target.value
							}
						}),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "استانداردهای قابل نمایش در فوتر (فارسی)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: settings.company.standards_fa || "",
						onChange: (e) => setSettings({
							...settings,
							company: {
								...settings.company,
								standards_fa: e.target.value
							}
						}),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "استانداردهای قابل نمایش در فوتر (انگلیسی)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						dir: "ltr",
						value: settings.company.standards_en || "",
						onChange: (e) => setSettings({
							...settings,
							company: {
								...settings.company,
								standards_en: e.target.value
							}
						}),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaUrlField, {
								label: "لوگوی اصلی سایت (تصویر یا فایل متحرک)",
								value: settings.company.logo_url || "",
								onChange: (url) => setSettings({
									...settings,
									company: {
										...settings.company,
										logo_url: url
									}
								}),
								folder: "logos",
								showAnimatedPresets: true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaUrlField, {
								label: "نشان کوچک و لوگوی سربرگ / سایدبار",
								value: settings.company.logo_small_url || "",
								onChange: (url) => setSettings({
									...settings,
									company: {
										...settings.company,
										logo_small_url: url
									}
								}),
								folder: "logos",
								placeholder: "/storage/logos/logo-small.png",
								showAnimatedPresets: true
							})]
						})
					})
				]
			}),
			tab === "social" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(EffectTabPanel, {
				className: "grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-xs font-semibold sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: settings.site.info_bar_enabled ?? true,
							onChange: (e) => setSettings({
								...settings,
								site: {
									...settings.site,
									info_bar_enabled: e.target.checked
								}
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "نمایش نوار باریک تماس و شبکه‌های اجتماعی در صفحه اصلی" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "شماره تماس نوار بالای صفحه"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						dir: "ltr",
						value: settings.site.info_bar_phone || settings.company.commercial_phone || "",
						onChange: (e) => setSettings({
							...settings,
							site: {
								...settings.site,
								info_bar_phone: e.target.value
							}
						}),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "self-end text-xs leading-6 text-slate-500",
						children: "لینک‌هایی که خالی بمانند در نوار سایت نمایش داده نمی‌شوند."
					}),
					[
						["instagram_url", "Instagram"],
						["linkedin_url", "LinkedIn"],
						["aparat_url", "Aparat"],
						["telegram_url", "Telegram"],
						["whatsapp_url", "WhatsApp"]
					].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mb-1 block text-xs font-medium",
						children: ["پیوند ", label]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						dir: "ltr",
						type: "url",
						value: settings.company[key] || "",
						onChange: (e) => setSettings({
							...settings,
							company: {
								...settings.company,
								[key]: e.target.value
							}
						}),
						placeholder: `https://${label.toLowerCase()}.com/...`,
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }, key))
				]
			}),
			tab === "partners" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectTabPanel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartnerLogoManager, {}) }),
			tab === "email" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(EffectTabPanel, {
				className: "space-y-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								dir: "ltr",
								placeholder: "SMTP Host",
								value: settings.email.smtp_host,
								onChange: (e) => setSettings({
									...settings,
									email: {
										...settings.email,
										smtp_host: e.target.value
									}
								}),
								className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								dir: "ltr",
								type: "number",
								placeholder: "Port",
								value: settings.email.smtp_port,
								onChange: (e) => setSettings({
									...settings,
									email: {
										...settings.email,
										smtp_port: Number(e.target.value)
									}
								}),
								className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								dir: "ltr",
								placeholder: "SMTP Username",
								value: settings.email.smtp_user,
								onChange: (e) => setSettings({
									...settings,
									email: {
										...settings.email,
										smtp_user: e.target.value
									}
								}),
								className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								dir: "ltr",
								type: "password",
								placeholder: "رمز عبور جدید SMTP (ذخیره رمزنگاری‌شده AES-256)",
								value: smtpPassPlain,
								onChange: (e) => setSmtpPassPlain(e.target.value),
								className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								dir: "ltr",
								type: "email",
								placeholder: "آدرس فرستنده",
								value: settings.email.from_address,
								onChange: (e) => setSettings({
									...settings,
									email: {
										...settings.email,
										from_address: e.target.value
									}
								}),
								className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								placeholder: "نام فرستنده",
								value: settings.email.from_name,
								onChange: (e) => setSettings({
									...settings,
									email: {
										...settings.email,
										from_name: e.target.value
									}
								}),
								className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-3 border-t border-slate-100 pt-4 dark:border-slate-800",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							dir: "ltr",
							type: "email",
							placeholder: "آدرس دریافت‌کننده برای آزمون",
							value: emailTestAddress,
							onChange: (e) => setEmailTestAddress(e.target.value),
							className: "min-w-64 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: testEmail,
							disabled: testingEmail || !emailTestAddress,
							className: "rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold disabled:opacity-50 dark:border-slate-700",
							children: testingEmail ? "در حال ارسال..." : "ارسال ایمیل آزمایشی"
						})]
					}),
					templates[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-sm font-bold",
								children: [
									"ادیتور اختصاصی قالب HTML ایمیل (",
									templates[0].name_fa,
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichTextEditor, {
								value: templates[0].body_html,
								onChange: (html) => setTemplates((prev) => prev.map((t, i) => i === 0 ? {
									...t,
									body_html: html
								} : t))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: async () => {
									await apiRequest(`/admin/notification-templates/${templates[0].id}`, {
										method: "PUT",
										body: JSON.stringify(templates[0])
									});
									addToast("success", "قالب HTML ایمیل ذخیره شد.");
								},
								className: "rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-700",
								children: "ذخیره قالب ایمیل"
							})
						]
					})
				]
			}),
			tab === "sms" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(EffectTabPanel, {
				className: "grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
						label: "انتخاب سامانه پیامکی",
						options: [
							{
								value: "kavenegar",
								label: "کاوه‌نگار (Kavenegar)"
							},
							{
								value: "smsir",
								label: "اس‌ام‌اس دات آی‌آر (SMS.ir)"
							},
							{
								value: "melipayamak",
								label: "ملی پیامک (Melipayamak)"
							}
						],
						value: settings.sms.provider,
						onChange: (v) => setSettings({
							...settings,
							sms: {
								...settings.sms,
								provider: v
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "شماره خط ارسال‌کننده"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						dir: "ltr",
						value: settings.sms.sender_line,
						onChange: (e) => setSettings({
							...settings,
							sms: {
								...settings.sms,
								sender_line: e.target.value
							}
						}),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mb-1 block text-xs font-medium",
							children: "کلید API جدید (رمزنگاری AES-256 در دیتابیس)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							dir: "ltr",
							type: "password",
							placeholder: "API Key...",
							value: smsKeyPlain,
							onChange: (e) => setSmsKeyPlain(e.target.value),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-xs font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: settings.sms.enabled,
							onChange: (e) => setSettings({
								...settings,
								sms: {
									...settings.sms,
									enabled: e.target.checked
								}
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ارسال خودکار پیامک برای رویدادهای RFQ و ورود فعال باشد" })]
					})
				]
			}),
			tab === "map_seo" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(EffectTabPanel, {
				className: "grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: settings.site.header_cta_text_fa || "",
						onChange: (e) => setSettings({
							...settings,
							site: {
								...settings.site,
								header_cta_text_fa: e.target.value
							}
						}),
						placeholder: "متن دکمه اصلی هدر (فارسی)",
						className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						dir: "ltr",
						value: settings.site.header_cta_text_en || "",
						onChange: (e) => setSettings({
							...settings,
							site: {
								...settings.site,
								header_cta_text_en: e.target.value
							}
						}),
						placeholder: "Header CTA text (English)",
						className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						dir: "ltr",
						value: settings.site.header_cta_url || "",
						onChange: (e) => setSettings({
							...settings,
							site: {
								...settings.site,
								header_cta_url: e.target.value
							}
						}),
						placeholder: "Header CTA URL",
						className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: settings.seo.site_title,
						onChange: (e) => setSettings({
							...settings,
							seo: {
								...settings.seo,
								site_title: e.target.value
							}
						}),
						placeholder: "عنوان سئو سایت (فارسی)",
						className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						dir: "ltr",
						value: settings.seo.site_title_en || "",
						onChange: (e) => setSettings({
							...settings,
							seo: {
								...settings.seo,
								site_title_en: e.target.value
							}
						}),
						placeholder: "SEO site title (English)",
						className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: settings.seo.meta_description || "",
						onChange: (e) => setSettings({
							...settings,
							seo: {
								...settings.seo,
								meta_description: e.target.value
							}
						}),
						placeholder: "توضیحات متای سایت (فارسی)",
						rows: 3,
						className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						dir: "ltr",
						value: settings.seo.meta_description_en || "",
						onChange: (e) => setSettings({
							...settings,
							seo: {
								...settings.seo,
								meta_description_en: e.target.value
							}
						}),
						placeholder: "Meta description (English)",
						rows: 3,
						className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: settings.seo.keywords || "",
						onChange: (e) => setSettings({
							...settings,
							seo: {
								...settings.seo,
								keywords: e.target.value
							}
						}),
						placeholder: "کلمات کلیدی (فارسی)",
						className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						dir: "ltr",
						value: settings.seo.keywords_en || "",
						onChange: (e) => setSettings({
							...settings,
							seo: {
								...settings.seo,
								keywords_en: e.target.value
							}
						}),
						placeholder: "SEO keywords (English)",
						className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-xs font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "سیاست نمایه‌سازی موتورهای جستجو" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: settings.seo.robots || "index,follow",
							onChange: (e) => setSettings({
								...settings,
								seo: {
									...settings.seo,
									robots: e.target.value
								}
							}),
							className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "index,follow",
									children: "نمایه‌سازی و دنبال‌کردن پیوندها"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "noindex,follow",
									children: "عدم نمایه‌سازی، دنبال‌کردن پیوندها"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "noindex,nofollow",
									children: "عدم نمایه‌سازی و دنبال‌کردن پیوندها"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaUrlField, {
							label: "تصویر پیش‌نمایش اشتراک‌گذاری و شبکه‌های اجتماعی (OG Image)",
							value: settings.seo.meta_image || "",
							onChange: (url) => setSettings({
								...settings,
								seo: {
									...settings.seo,
									meta_image: url
								}
							}),
							folder: "seo",
							accept: ".jpg,.jpeg,.png,.webp",
							placeholder: "/storage/logos/logo-main.png"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						step: "0.0001",
						dir: "ltr",
						value: settings.map.factory_lat,
						onChange: (e) => setSettings({
							...settings,
							map: {
								...settings.map,
								factory_lat: Number(e.target.value)
							}
						}),
						placeholder: "Lat",
						className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						step: "0.0001",
						dir: "ltr",
						value: settings.map.factory_lng,
						onChange: (e) => setSettings({
							...settings,
							map: {
								...settings.map,
								factory_lng: Number(e.target.value)
							}
						}),
						placeholder: "Lng",
						className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-xs font-semibold text-amber-700 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: settings.site.maintenance_mode,
							onChange: (e) => setSettings({
								...settings,
								site: {
									...settings.site,
									maintenance_mode: e.target.checked
								}
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "فعال‌سازی حالت نگهداری موقت سایت (Maintenance Mode) برای بازدیدکنندگان عمومی" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: settings.site.maintenance_message_fa || "",
						onChange: (e) => setSettings({
							...settings,
							site: {
								...settings.site,
								maintenance_message_fa: e.target.value
							}
						}),
						placeholder: "پیام حالت نگهداری",
						className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-xs font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: settings.site.allow_registration,
							onChange: (e) => setSettings({
								...settings,
								site: {
									...settings.site,
									allow_registration: e.target.checked
								}
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "اجازهٔ ثبت‌نام کاربران جدید" })]
					})
				]
			}),
			tab === "backup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(EffectTabPanel, {
				className: "rounded-xl border border-slate-200 bg-white p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-base font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "h-5 w-5 text-(--theme-primary)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "پشتیبان‌گیری دستی از پایگاه داده" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-slate-500",
						children: "خروجی کامل اطلاعات سیستم (پروژه‌ها، قراردادها، تنظیمات، تم‌ها، کاربران و لاگ‌ها) را به‌صورت فایل پشتیبان دریافت کنید."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: downloadBackup,
							style: { backgroundColor: "var(--theme-primary)" },
							className: "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-semibold text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "دانلود نسخه پشتیبان کامل (JSON)" })]
						})
					})
				]
			})
		]
	});
};
export { SettingsAdminPage };
