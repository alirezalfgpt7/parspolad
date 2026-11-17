import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { t as Pencil } from "./pencil-DgFD3KzF.js";
import { t as Plus } from "./plus-DOUCSCbs.js";
import { t as Trash2 } from "./trash-2-uk0pNdI5.js";
import { t as DataTable } from "./DataTable-CJgvJLS4.js";
import { t as FileUploader } from "./FileUploader-BJ54GFf2.js";
import { k as Modal } from "./index-Dacn8Sc3.js";
import { t as Pagination } from "./Pagination-Cy7ez7lz.js";
import { t as SearchableSelect } from "./SearchableSelect-BCBuOYhg.js";
import { t as PersianDatePicker } from "./PersianDatePicker-Tb3-es4g.js";
import { t as ConfirmDialog } from "./ConfirmDialog-5fpwSoSk.js";
import { a as object, i as number, o as string, r as boolean, t as _enum } from "./schemas-HxyU5SsU.js";
import { t as ZeroBrokenImage } from "./ZeroBrokenImage-CvCIOfg-.js";
// src/pages/admin/ContractsLicensesAdminPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var contractFormSchema = object({
	contract_number: string().trim().min(1, "شماره قرارداد الزامی است.").max(120),
	title_fa: string().trim().min(1, "عنوان فارسی الزامی است.").max(255),
	title_en: string().trim().min(1, "عنوان انگلیسی الزامی است.").max(255),
	client_fa: string().trim().min(1, "نام فارسی کارفرما الزامی است.").max(255),
	client_en: string().trim().min(1, "نام انگلیسی کارفرما الزامی است.").max(255),
	amount_billion_irr: number().min(0, "مبلغ نمی‌تواند منفی باشد."),
	start_year: number().int().min(1348).max(1450),
	end_year: number().int().min(1348).max(1450).nullable().optional(),
	status: _enum([
		"active",
		"completed",
		"pending",
		"archived"
	]),
	scope_fa: string().nullable().optional(),
	scope_en: string().nullable().optional(),
	document_url: string().max(255).nullable().optional(),
	requires_auth: boolean().optional()
});
var licenseFormSchema = object({
	code: string().trim().min(1, "کد استاندارد الزامی است.").max(80),
	title_fa: string().trim().min(1, "عنوان فارسی الزامی است.").max(255),
	title_en: string().trim().min(1, "عنوان انگلیسی الزامی است.").max(255),
	issuer_fa: string().trim().min(1, "مرجع فارسی الزامی است.").max(255),
	issuer_en: string().trim().min(1, "مرجع انگلیسی الزامی است.").max(255),
	issue_date: string().trim().min(1, "تاریخ صدور الزامی است.").max(30),
	expiry_date: string().max(30).nullable().optional(),
	category: _enum([
		"iso",
		"api",
		"knowledge_based",
		"association"
	]),
	image_url: string().trim().min(1, "تصویر گواهینامه الزامی است.").max(255),
	document_url: string().max(255).nullable().optional(),
	requires_auth: boolean().optional()
});
var ContractsLicensesAdminPage = () => {
	const { addToast } = useAppStore();
	const [contracts, setContracts] = (0, import_react.useState)([]);
	const [licenses, setLicenses] = (0, import_react.useState)([]);
	const [contractPage, setContractPage] = (0, import_react.useState)(1);
	const [contractLastPage, setContractLastPage] = (0, import_react.useState)(1);
	const [licensePage, setLicensePage] = (0, import_react.useState)(1);
	const [licenseLastPage, setLicenseLastPage] = (0, import_react.useState)(1);
	const [contractModal, setContractModal] = (0, import_react.useState)(null);
	const [licenseModal, setLicenseModal] = (0, import_react.useState)(null);
	const [deleteTarget, setDeleteTarget] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	const load = async (targetContractPage = contractPage, targetLicensePage = licensePage) => {
		const [c, l] = await Promise.all([apiRequest(`/admin/contracts?page=${targetContractPage}&per_page=8`), apiRequest(`/admin/licenses?page=${targetLicensePage}&per_page=8`)]);
		if (targetContractPage > c.meta.last_page) setContractPage(Math.max(1, c.meta.last_page));
		else {
			setContracts(c.data);
			setContractLastPage(c.meta.last_page);
		}
		if (targetLicensePage > l.meta.last_page) setLicensePage(Math.max(1, l.meta.last_page));
		else {
			setLicenses(l.data);
			setLicenseLastPage(l.meta.last_page);
		}
	};
	(0, import_react.useEffect)(() => {
		load().catch((error) => {
			addToast("error", error instanceof Error ? error.message : "بارگذاری قراردادها و گواهینامه‌ها ناموفق بود.");
		});
	}, [contractPage, licensePage]);
	const confirmDelete = async () => {
		if (!deleteTarget) return;
		setDeleting(true);
		try {
			const { type, id } = deleteTarget;
			await apiRequest(`/admin/${type === "contract" ? "contracts" : "licenses"}/${id}`, { method: "DELETE" });
			setDeleteTarget(null);
			await load();
			addToast("success", type === "contract" ? "قرارداد حذف شد." : "گواهینامه حذف شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "حذف مورد ناموفق بود.");
		} finally {
			setDeleting(false);
		}
	};
	const saveContract = async (event) => {
		event.preventDefault();
		if (!contractModal) return;
		const parsed = contractFormSchema.safeParse(contractModal);
		if (!parsed.success) {
			addToast("error", parsed.error.issues[0]?.message ?? "اطلاعات قرارداد معتبر نیست.");
			return;
		}
		try {
			await apiRequest(contractModal.id ? `/admin/contracts/${contractModal.id}` : "/admin/contracts", {
				method: contractModal.id ? "PUT" : "POST",
				body: JSON.stringify(parsed.data)
			});
			setContractModal(null);
			await load();
			addToast("success", "قرارداد ذخیره شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "ذخیره قرارداد ناموفق بود.");
		}
	};
	const saveLicense = async (event) => {
		event.preventDefault();
		if (!licenseModal) return;
		const parsed = licenseFormSchema.safeParse(licenseModal);
		if (!parsed.success) {
			addToast("error", parsed.error.issues[0]?.message ?? "اطلاعات گواهینامه معتبر نیست.");
			return;
		}
		try {
			await apiRequest(licenseModal.id ? `/admin/licenses/${licenseModal.id}` : "/admin/licenses", {
				method: licenseModal.id ? "PUT" : "POST",
				body: JSON.stringify(parsed.data)
			});
			setLicenseModal(null);
			await load();
			addToast("success", "گواهینامه ذخیره شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "ذخیره گواهینامه ناموفق بود.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-lg font-extrabold",
							children: "مدیریت قراردادهای کلان"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setContractModal({
								contract_number: "",
								title_fa: "",
								title_en: "",
								client_fa: "",
								client_en: "",
								amount_billion_irr: 100,
								start_year: 1404,
								status: "active",
								scope_fa: "",
								scope_en: "",
								requires_auth: false
							}),
							style: { backgroundColor: "var(--theme-primary)" },
							className: "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ثبت قرارداد" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
						data: contracts,
						columns: [
							{
								key: "num",
								header: "شماره قرارداد",
								render: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs",
									children: c.contract_number
								})
							},
							{
								key: "title",
								header: "عنوان",
								render: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: c.title_fa
								})
							},
							{
								key: "client",
								header: "کارفرما",
								render: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: c.client_fa })
							},
							{
								key: "amt",
								header: "مبلغ (میلیارد ریال)",
								render: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: c.amount_billion_irr })
							},
							{
								key: "del",
								header: "عملیات",
								render: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setContractModal(c),
										"aria-label": "ویرایش قرارداد",
										className: "text-slate-600",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setDeleteTarget({
											type: "contract",
											id: c.id
										}),
										"aria-label": "حذف قرارداد",
										className: "text-red-600",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
									})]
								})
							}
						],
						pageSize: 8,
						searchKeys: [(c) => c.title_fa, (c) => c.contract_number]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
						page: contractPage,
						lastPage: contractLastPage,
						onChange: setContractPage
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-extrabold",
							children: "مدیریت لایسنس‌ها و گواهینامه‌های استاندارد"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setLicenseModal({
								code: "ISO-9001",
								title_fa: "",
								title_en: "",
								issuer_fa: "",
								issuer_en: "",
								issue_date: "1404/01/01",
								category: "iso",
								image_url: "/storage/certificates/iso-9001.jpg",
								requires_auth: false
							}),
							style: { backgroundColor: "var(--theme-primary)" },
							className: "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "افزودن گواهینامه" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
						children: licenses.map((lic) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900",
							children: [
								lic.image_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mb-3 h-28 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
										src: lic.image_url,
										alt: lic.title_fa,
										className: "h-full w-full object-cover"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-xs font-bold text-(--theme-primary)",
									children: lic.code
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-sm font-bold",
									children: lic.title_fa
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-xs text-slate-500",
									children: lic.issuer_fa
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setLicenseModal(lic),
										className: "inline-flex items-center gap-1 text-xs text-slate-600 hover:underline",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" }), "ویرایش"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setDeleteTarget({
											type: "license",
											id: lic.id
										}),
										className: "text-xs text-red-600 hover:underline",
										children: "حذف گواهینامه"
									})]
								})
							]
						}, lic.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
						page: licensePage,
						lastPage: licenseLastPage,
						onChange: setLicensePage
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: Boolean(contractModal),
				onClose: () => setContractModal(null),
				title: contractModal?.id ? "ویرایش قرارداد" : "ثبت قرارداد جدید",
				size: "md",
				children: contractModal && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: saveContract,
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							placeholder: "شماره قرارداد",
							value: contractModal.contract_number || "",
							onChange: (e) => setContractModal({
								...contractModal,
								contract_number: e.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							placeholder: "عنوان قرارداد",
							value: contractModal.title_fa || "",
							onChange: (e) => setContractModal({
								...contractModal,
								title_fa: e.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							placeholder: "عنوان انگلیسی قرارداد",
							value: contractModal.title_en || "",
							onChange: (e) => setContractModal({
								...contractModal,
								title_en: e.target.value
							}),
							dir: "ltr",
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							placeholder: "کارفرما",
							value: contractModal.client_fa || "",
							onChange: (e) => setContractModal({
								...contractModal,
								client_fa: e.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							placeholder: "کارفرما (انگلیسی)",
							value: contractModal.client_en || "",
							onChange: (e) => setContractModal({
								...contractModal,
								client_en: e.target.value
							}),
							dir: "ltr",
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							placeholder: "مبلغ (میلیارد ریال)",
							value: contractModal.amount_billion_irr || 0,
							onChange: (e) => setContractModal({
								...contractModal,
								amount_billion_irr: Number(e.target.value)
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							type: "number",
							min: 1348,
							max: 1450,
							placeholder: "سال شروع",
							value: contractModal.start_year || "",
							onChange: (e) => setContractModal({
								...contractModal,
								start_year: Number(e.target.value)
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: contractModal.status || "active",
							onChange: (e) => setContractModal({
								...contractModal,
								status: e.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "active",
									children: "فعال"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "completed",
									children: "تکمیل‌شده"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "pending",
									children: "در انتظار"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "archived",
									children: "بایگانی"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUploader, {
							folder: "documents",
							currentUrl: contractModal.document_url || void 0,
							label: "پیوست PDF قرارداد",
							onUploaded: (url) => setContractModal({
								...contractModal,
								document_url: url
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							style: { backgroundColor: "var(--theme-primary)" },
							className: "w-full rounded-lg py-2 text-xs font-semibold text-white",
							children: "ذخیره قرارداد"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: Boolean(licenseModal),
				onClose: () => setLicenseModal(null),
				title: licenseModal?.id ? "ویرایش گواهینامه" : "افزودن گواهینامه و استاندارد",
				size: "md",
				children: licenseModal && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: saveLicense,
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							placeholder: "کد استاندارد (مثل API 6A)",
							value: licenseModal.code || "",
							onChange: (e) => setLicenseModal({
								...licenseModal,
								code: e.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							placeholder: "عنوان فارسی",
							value: licenseModal.title_fa || "",
							onChange: (e) => setLicenseModal({
								...licenseModal,
								title_fa: e.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							placeholder: "عنوان انگلیسی",
							value: licenseModal.title_en || "",
							onChange: (e) => setLicenseModal({
								...licenseModal,
								title_en: e.target.value
							}),
							dir: "ltr",
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							placeholder: "مرجع صادرکننده",
							value: licenseModal.issuer_fa || "",
							onChange: (e) => setLicenseModal({
								...licenseModal,
								issuer_fa: e.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							placeholder: "مرجع صادرکننده (انگلیسی)",
							value: licenseModal.issuer_en || "",
							onChange: (e) => setLicenseModal({
								...licenseModal,
								issuer_en: e.target.value
							}),
							dir: "ltr",
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs",
							children: ["تاریخ صدور", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersianDatePicker, {
								value: licenseModal.issue_date || "",
								onChange: (issue_date) => setLicenseModal({
									...licenseModal,
									issue_date
								}),
								className: "mt-1"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
							label: "دسته",
							options: [
								{
									value: "iso",
									label: "ISO"
								},
								{
									value: "api",
									label: "API"
								},
								{
									value: "knowledge_based",
									label: "دانش‌بنیان"
								}
							],
							value: licenseModal.category || "iso",
							onChange: (v) => setLicenseModal({
								...licenseModal,
								category: v
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUploader, {
							folder: "certificates",
							currentUrl: licenseModal.image_url || licenseModal.document_url || void 0,
							label: "تصویر یا PDF گواهینامه",
							onUploaded: (url) => setLicenseModal({
								...licenseModal,
								document_url: url,
								image_url: url.endsWith(".pdf") ? "/storage/certificates/iso-9001.jpg" : url
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							style: { backgroundColor: "var(--theme-primary)" },
							className: "w-full rounded-lg py-2 text-xs font-semibold text-white",
							children: "ثبت گواهینامه"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(deleteTarget),
				onClose: () => setDeleteTarget(null),
				onConfirm: confirmDelete,
				message: deleteTarget?.type === "contract" ? "آیا از حذف این قرارداد اطمینان دارید؟" : "آیا از حذف این گواهینامه اطمینان دارید؟",
				loading: deleting
			})
		]
	});
};
export { ContractsLicensesAdminPage };
