import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { t as Pencil } from "./pencil-DgFD3KzF.js";
import { t as Plus } from "./plus-DOUCSCbs.js";
import { t as Save } from "./save-CsxfzoRu.js";
import { t as Trash2 } from "./trash-2-uk0pNdI5.js";
import { n as useForm, t as u } from "./zod-DW8XBK3S.js";
import { t as ConfirmDialog } from "./ConfirmDialog-5fpwSoSk.js";
import { t as FileUploader } from "./FileUploader-BJ54GFf2.js";
import { t as Pagination } from "./Pagination-Cy7ez7lz.js";
import { t as SearchableSelect } from "./SearchableSelect-BCBuOYhg.js";
import { a as object, i as number, o as string, r as boolean, s as union } from "./schemas-HxyU5SsU.js";
import { t as ZeroBrokenImage, u as isVideoMediaUrl } from "./ZeroBrokenImage-CvCIOfg-.js";
// src/pages/admin/ContentRecordsAdminPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var resources = [
	{
		value: "categories",
		label: "دسته‌بندی پروژه"
	},
	{
		value: "services",
		label: "خدمات"
	},
	{
		value: "products",
		label: "محصولات"
	},
	{
		value: "departments",
		label: "واحدهای سازمانی"
	},
	{
		value: "team",
		label: "اعضای تیم"
	},
	{
		value: "partners",
		label: "کارفرمایان و شرکا"
	},
	{
		value: "articles",
		label: "اخبار و مقالات"
	},
	{
		value: "pages",
		label: "صفحات"
	},
	{
		value: "banners",
		label: "بنرها"
	},
	{
		value: "kpis",
		label: "شاخص‌های آماری"
	},
	{
		value: "notification-templates",
		label: "قالب‌های اعلان"
	},
	{
		value: "faqs",
		label: "سوالات متداول"
	}
];
var emptyValue = (field, index) => {
	if (field.type === "boolean") return field.name === "is_active";
	if (field.type === "json") return "[]";
	if (field.type === "number") return field.name === "sort_order" ? index + 1 : 0;
	return "";
};
var recordLabel = (record) => String(record.title_fa ?? record.name_fa ?? record.label_fa ?? record.question_fa ?? record.event_key ?? record.slug ?? record.key ?? record.id);
var ContentRecordsAdminPage = () => {
	const { addToast } = useAppStore();
	const [resource, setResource] = (0, import_react.useState)("services");
	const [fields, setFields] = (0, import_react.useState)([]);
	const [records, setRecords] = (0, import_react.useState)([]);
	const [page, setPage] = (0, import_react.useState)(1);
	const [lastPage, setLastPage] = (0, import_react.useState)(1);
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [deleteTarget, setDeleteTarget] = (0, import_react.useState)(null);
	const formSchema = import_react.useMemo(() => {
		const shape = {};
		for (const field of fields) if (field.type === "boolean") shape[field.name] = boolean();
		else if (field.type === "json") shape[field.name] = string().superRefine((value, context) => {
			if (value === "" && !field.required) return;
			try {
				JSON.parse(value);
			} catch {
				context.addIssue({
					code: "custom",
					message: "ساختار JSON معتبر نیست."
				});
			}
		});
		else if (field.type === "number") shape[field.name] = union([number(), string()]).refine((value) => value === "" && !field.required || Number.isFinite(Number(value)), "یک عدد معتبر وارد کنید.");
		else shape[field.name] = field.required ? string().trim().min(1, "تکمیل این فیلد الزامی است.") : string();
		return object(shape);
	}, [fields]);
	const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
		resolver: u(formSchema),
		defaultValues: {}
	});
	const loadSchema = async (target) => {
		const schema = await apiRequest(`/admin/content-schema/${target}`);
		setFields(schema.data.fields);
	};
	const loadRecords = async (target = resource, targetPage = page) => {
		const rows = await apiRequest(`/admin/${target}?page=${targetPage}&per_page=20`);
		if (targetPage > rows.meta.last_page) {
			setPage(Math.max(1, rows.meta.last_page));
			return;
		}
		setRecords(rows.data);
		setLastPage(rows.meta.last_page);
	};
	(0, import_react.useEffect)(() => {
		loadSchema(resource).catch((error) => addToast("error", error instanceof Error ? error.message : "بارگذاری ساختار فیلدها ناموفق بود."));
	}, [resource]);
	(0, import_react.useEffect)(() => {
		loadRecords(resource, page).catch((error) => addToast("error", error instanceof Error ? error.message : "بارگذاری اطلاعات ناموفق بود."));
	}, [resource, page]);
	const startCreate = () => {
		setEditingId(null);
		reset(Object.fromEntries(fields.map((field) => [field.name, emptyValue(field, records.length)])));
	};
	const startEdit = (record) => {
		setEditingId(record.id);
		reset(Object.fromEntries(fields.map((field) => {
			const value = record[field.name];
			return [field.name, field.type === "json" ? JSON.stringify(value ?? [], null, 2) : value ?? ""];
		})));
	};
	const save = async (values) => {
		const payload = {};
		for (const field of fields) {
			const value = values[field.name];
			if (field.type === "json") {
				if (value === "" && !field.required && !editingId) continue;
				payload[field.name] = value === "" ? null : JSON.parse(String(value));
			} else if (field.type === "number") {
				if (value === "" && !field.required && !editingId) continue;
				payload[field.name] = value === "" ? null : Number(value);
			} else if (field.type === "boolean") payload[field.name] = Boolean(value);
			else {
				if (value === "" && !field.required && !editingId) continue;
				payload[field.name] = value === "" && !field.required ? null : value;
			}
		}
		try {
			await apiRequest(editingId ? `/admin/${resource}/${editingId}` : `/admin/${resource}`, {
				method: editingId ? "PUT" : "POST",
				body: JSON.stringify(payload)
			});
			reset({});
			setEditingId(null);
			await loadRecords(resource, page);
			addToast("success", "اطلاعات ذخیره شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "ذخیره اطلاعات ناموفق بود.");
		}
	};
	const remove = async () => {
		if (!deleteTarget) return;
		try {
			await apiRequest(`/admin/${resource}/${deleteTarget.id}`, { method: "DELETE" });
			setDeleteTarget(null);
			await loadRecords(resource, page);
			addToast("success", "رکورد نرم حذف شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "حذف رکورد ناموفق بود.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mb-2 text-lg font-extrabold",
						children: "مدیریت محتوای پایگاه‌داده"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
						label: "بخش",
						options: resources,
						value: resource,
						onChange: (value) => {
							setResource(value);
							setPage(1);
							setEditingId(null);
							reset({});
						}
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: startCreate,
					className: "inline-flex items-center gap-2 rounded-lg bg-(--theme-primary) px-4 py-2 text-sm font-semibold text-white",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "افزودن رکورد"]
				})]
			}),
			fields.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit(save),
				className: "grid gap-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-bold sm:col-span-2",
						children: editingId ? "ویرایش رکورد" : "رکورد جدید"
					}),
					fields.map((field) => {
						const isMediaField = field.type === "string" && /(image|logo|avatar|media|cover)/i.test(field.name);
						const currentMediaValue = isMediaField ? String(watch(field.name) ?? "") : "";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `space-y-1.5 text-xs font-medium ${field.type === "textarea" || field.type === "json" || isMediaField ? "sm:col-span-2" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [field.name, field.required ? " *" : ""] }), field.type === "boolean" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										...register(field.name),
										className: "ms-2"
									}) : field.type === "textarea" || field.type === "json" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										rows: field.type === "json" ? 4 : 2,
										...register(field.name),
										className: "w-full rounded-lg border border-slate-200 px-3 py-2 font-normal dark:border-slate-700 dark:bg-slate-800"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: field.type === "number" ? "number" : "text",
										dir: isMediaField ? "ltr" : void 0,
										...register(field.name),
										className: "w-full rounded-lg border border-slate-200 px-3 py-2 font-normal dark:border-slate-700 dark:bg-slate-800"
									})]
								}),
								isMediaField && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40",
									children: [currentMediaValue && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
											children: isVideoMediaUrl(currentMediaValue) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
												src: currentMediaValue,
												muted: true,
												loop: true,
												autoPlay: true,
												playsInline: true,
												className: "h-full w-full object-contain"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
												src: currentMediaValue,
												alt: field.name,
												className: "h-full w-full object-cover"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] text-slate-500",
											children: "پیش‌نمایش فایل فعلی"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUploader, {
										folder: resource,
										currentUrl: currentMediaValue || void 0,
										label: `آپلود فایل برای ${field.name}`,
										onUploaded: (url) => setValue(field.name, url, {
											shouldDirty: true,
											shouldValidate: true
										})
									})]
								}),
								errors[field.name]?.message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									role: "alert",
									className: "block text-red-600",
									children: String(errors[field.name]?.message)
								})
							]
						}, field.name);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							disabled: isSubmitting,
							className: "inline-flex items-center gap-2 rounded-lg bg-(--theme-primary) px-4 py-2 text-xs font-semibold text-white disabled:opacity-60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), "ذخیره"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setEditingId(null);
								reset({});
							},
							className: "rounded-lg border px-4 py-2 text-xs",
							children: "پاک‌کردن فرم"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-start text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3 text-start",
								children: "شناسه"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3 text-start",
								children: "عنوان"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3 text-start",
								children: "عملیات"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [records.map((record) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b last:border-0 dark:border-slate-800",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-3 tabular-nums",
								children: record.id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "max-w-xl truncate p-3",
								children: recordLabel(record)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => startEdit(record),
										"aria-label": "ویرایش",
										className: "rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setDeleteTarget(record),
										"aria-label": "حذف",
										className: "rounded p-1.5 text-red-600 hover:bg-red-50",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
									})]
								})
							})
						]
					}, record.id)), records.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 3,
						className: "p-8 text-center text-slate-500",
						children: "رکوردی ثبت نشده است."
					}) })] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
				page,
				lastPage,
				onChange: setPage
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(deleteTarget),
				onClose: () => setDeleteTarget(null),
				onConfirm: remove,
				message: "این رکورد نرم حذف می‌شود و از سایت عمومی نمایش داده نخواهد شد. ادامه می‌دهید؟"
			})
		]
	});
};
export { ContentRecordsAdminPage };
