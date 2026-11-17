import { a as createLucideIcon, l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { C as PagePreloader, Z as Eye } from "./index-Dacn8Sc3.js";
import { t as Plus } from "./plus-DOUCSCbs.js";
import { t as Trash2 } from "./trash-2-uk0pNdI5.js";
import { t as ConfirmDialog } from "./ConfirmDialog-5fpwSoSk.js";
import { t as FileUploader } from "./FileUploader-BJ54GFf2.js";
import { t as ZeroBrokenImage } from "./ZeroBrokenImage-CvCIOfg-.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var EyeOff = createLucideIcon("eye-off", [
	["path", {
		d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
		key: "ct8e1f"
	}],
	["path", {
		d: "M14.084 14.158a3 3 0 0 1-4.242-4.242",
		key: "151rxh"
	}],
	["path", {
		d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
		key: "13bj9a"
	}],
	["path", {
		d: "m2 2 20 20",
		key: "1ooewy"
	}]
]);
// src/components/admin/PartnerLogoManager.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var emptyDraft = {
	name_fa: "",
	name_en: "",
	logo_url: ""
};
var PartnerLogoManager = () => {
	const { addToast, fetchBootstrap } = useAppStore();
	const [partners, setPartners] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)(emptyDraft);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	const [loadError, setLoadError] = (0, import_react.useState)("");
	const [partnerToDelete, setPartnerToDelete] = (0, import_react.useState)(null);
	const loadPartners = (0, import_react.useCallback)(async () => {
		const response = await apiRequest("/admin/partners?per_page=100");
		setPartners(response.data);
	}, []);
	(0, import_react.useEffect)(() => {
		setLoading(true);
		loadPartners().catch((error) => setLoadError(error instanceof Error ? error.message : "دریافت لوگوها ناموفق بود.")).finally(() => setLoading(false));
	}, [loadPartners]);
	const refreshAfterChange = async () => {
		await Promise.all([loadPartners(), fetchBootstrap()]);
		setLoadError("");
	};
	const addPartner = async () => {
		if (!draft.name_fa.trim() || !draft.name_en.trim() || !draft.logo_url) {
			addToast("error", "نام فارسی، نام انگلیسی و لوگو را تکمیل کنید.");
			return;
		}
		setSaving(true);
		try {
			await apiRequest("/admin/partners", {
				method: "POST",
				body: JSON.stringify({
					...draft,
					sector_fa: "همکار راهبردی",
					is_active: true
				})
			});
			setDraft(emptyDraft);
			await refreshAfterChange();
			addToast("success", "لوگوی همکار به اسلایدر صفحه اصلی اضافه شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "افزودن لوگو ناموفق بود.");
		} finally {
			setSaving(false);
		}
	};
	const togglePartner = async (partner) => {
		try {
			await apiRequest(`/admin/partners/${partner.id}`, {
				method: "PUT",
				body: JSON.stringify({ is_active: !partner.is_active })
			});
			await refreshAfterChange();
			addToast("success", partner.is_active ? "لوگو از اسلایدر پنهان شد." : "لوگو در اسلایدر نمایش داده می‌شود.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "تغییر وضعیت لوگو ناموفق بود.");
		}
	};
	const deletePartner = async () => {
		if (!partnerToDelete) return;
		setDeleting(true);
		try {
			await apiRequest(`/admin/partners/${partnerToDelete.id}`, { method: "DELETE" });
			setPartnerToDelete(null);
			await refreshAfterChange();
			addToast("success", "لوگو از فهرست همکاران حذف شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "حذف لوگو ناموفق بود.");
		} finally {
			setDeleting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-extrabold",
					children: "لوگوهای اسلایدر صفحه اصلی"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-6 text-slate-500",
					children: "لوگوهای فعال در نوار متحرک همکاران نمایش داده می‌شوند. فایل‌ها از فضای رسانه‌ای همین سامانه بارگذاری می‌شوند."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 grid gap-3 md:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-xs font-medium",
							children: ["نام فارسی", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: draft.name_fa,
								onChange: (event) => setDraft((current) => ({
									...current,
									name_fa: event.target.value
								})),
								maxLength: 255,
								className: "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-xs font-medium",
							children: ["نام انگلیسی", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								dir: "ltr",
								value: draft.name_en,
								onChange: (event) => setDraft((current) => ({
									...current,
									name_en: event.target.value
								})),
								maxLength: 255,
								className: "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUploader, {
							folder: "partners",
							accept: ".png,.jpg,.jpeg,.webp,.gif",
							currentUrl: draft.logo_url,
							label: "بارگذاری لوگو",
							onUploaded: (logo_url) => setDraft((current) => ({
								...current,
								logo_url
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: addPartner,
								disabled: saving,
								className: "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-(--theme-primary) px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), saving ? "در حال افزودن..." : "افزودن به اسلایدر"]
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-bold",
							children: "فهرست لوگوها"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300",
							children: [
								partners.filter((partner) => partner.is_active).length,
								" فعال از ",
								partners.length
							]
						})]
					}),
					loadError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300",
						children: loadError
					}),
					loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PagePreloader, { label: "در حال دریافت فهرست لوگوها..." }) : partners.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700",
						children: "هنوز لوگویی به اسلایدر اضافه نشده است."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
						children: partners.map((partner) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-14 w-16 shrink-0 place-items-center rounded-lg bg-slate-50 p-2 dark:bg-slate-800",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
										src: partner.logo_url,
										alt: "",
										className: "max-h-full max-w-full object-contain"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-xs font-bold",
											children: partner.name_fa
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											dir: "ltr",
											className: "mt-1 truncate text-start text-[10px] text-slate-500",
											children: partner.name_en
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-[10px] text-slate-400",
											children: partner.is_active ? "نمایش در صفحه اصلی" : "پنهان از صفحه اصلی"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex shrink-0 flex-col gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => togglePartner(partner),
										"aria-label": partner.is_active ? `پنهان‌کردن ${partner.name_fa}` : `نمایش ${partner.name_fa}`,
										title: partner.is_active ? "پنهان کردن از اسلایدر" : "نمایش در اسلایدر",
										className: "grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-(--theme-primary) dark:hover:bg-slate-800",
										children: partner.is_active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setPartnerToDelete(partner),
										"aria-label": `حذف ${partner.name_fa}`,
										title: "حذف لوگو",
										className: "grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
									})]
								})
							]
						}, partner.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(partnerToDelete),
				onClose: () => setPartnerToDelete(null),
				onConfirm: deletePartner,
				title: "حذف لوگو",
				message: `آیا از حذف لوگوی «${partnerToDelete?.name_fa ?? ""}» مطمئن هستید؟`,
				confirmLabel: "حذف لوگو",
				loading: deleting
			})
		]
	});
};
export { PartnerLogoManager as t };
