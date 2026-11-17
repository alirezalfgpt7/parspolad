import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { d as EffectProfileAvatar, f as EffectProfileCard, it as Bell } from "./index-Dacn8Sc3.js";
import { t as Check } from "./check-BuKO0DJa.js";
import { t as Save } from "./save-CsxfzoRu.js";
import { t as ShieldCheck } from "./shield-check-Dq3Mld6F.js";
import { n as useForm, t as u } from "./zod-DW8XBK3S.js";
import { t as FileUploader } from "./FileUploader-BJ54GFf2.js";
import { t as Pagination } from "./Pagination-Cy7ez7lz.js";
import { a as object, o as string, r as boolean } from "./schemas-HxyU5SsU.js";
// src/pages/admin/ProfileNotificationsPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var profileSchema = object({
	name: string().trim().min(1, "نام الزامی است.").max(120, "نام نمی‌تواند بیش از ۱۲۰ نویسه باشد."),
	phone: string().max(30, "شماره تماس نمی‌تواند بیش از ۳۰ نویسه باشد."),
	avatar: string().max(255, "نشانی آواتار بیش از حد طولانی است."),
	two_factor_enabled: boolean(),
	current_password: string(),
	new_password: string().refine((value) => value === "" || value.length >= 8, "رمز عبور جدید باید حداقل ۸ نویسه باشد.")
}).refine((values) => values.new_password === "" || values.current_password !== "", {
	path: ["current_password"],
	message: "برای تغییر رمز عبور، رمز فعلی را وارد کنید."
});
var ProfilePage = () => {
	const { user, setAuth, token, addToast } = useAppStore();
	const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
		resolver: u(profileSchema),
		defaultValues: {
			name: user?.name || "",
			phone: user?.phone || "",
			avatar: user?.avatar || "/storage/logos/logo-small.png",
			two_factor_enabled: Boolean(user?.two_factor_enabled),
			current_password: "",
			new_password: ""
		}
	});
	const name = watch("name");
	const avatar = watch("avatar");
	(0, import_react.useEffect)(() => {
		reset({
			name: user?.name || "",
			phone: user?.phone || "",
			avatar: user?.avatar || "/storage/logos/logo-small.png",
			two_factor_enabled: Boolean(user?.two_factor_enabled),
			current_password: "",
			new_password: ""
		});
	}, [user, reset]);
	const handleSave = async (values) => {
		try {
			const res = await apiRequest("/auth/profile", {
				method: "PUT",
				body: JSON.stringify({
					name: values.name,
					phone: values.phone,
					avatar: values.avatar,
					two_factor_enabled: values.two_factor_enabled,
					current_password: values.current_password || void 0,
					new_password: values.new_password || void 0
				})
			});
			setAuth(res.user, token);
			reset({
				name: res.user.name,
				phone: res.user.phone || "",
				avatar: res.user.avatar || "/storage/logos/logo-small.png",
				two_factor_enabled: Boolean(res.user.two_factor_enabled),
				current_password: "",
				new_password: ""
			});
			addToast("success", "پروفایل و تنظیمات امنیتی بروزرسانی شد.");
		} catch (err) {
			addToast("error", err instanceof Error ? err.message : "خطا در بروزرسانی پروفایل");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(EffectProfileCard, {
		className: "mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-5 text-lg font-extrabold",
			children: "پروفایل کاربری، آواتار و احراز هویت دو مرحله‌ای (2FA)"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit(handleSave),
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectProfileAvatar, {
						src: avatar,
						alt: name,
						className: "h-16 w-16 rounded-full border border-slate-200 object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUploader, {
							folder: "avatars",
							accept: ".jpg,.jpeg,.png,.webp,.gif",
							currentUrl: avatar,
							label: "آپلود تصویر آواتار جدید",
							onUploaded: (url) => setValue("avatar", url, {
								shouldValidate: true,
								shouldDirty: true
							})
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "نام و نام خانوادگی"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						...register("name"),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					errors.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mt-1 text-xs text-red-600",
						children: errors.name.message
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs font-medium",
						children: "شماره تماس"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						dir: "ltr",
						...register("phone"),
						className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					errors.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mt-1 text-xs text-red-600",
						children: errors.phone.message
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2.5 rounded-lg border border-slate-200 p-3 text-xs font-semibold dark:border-slate-700",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							...register("two_factor_enabled")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-(--theme-primary)" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "فعال‌سازی احراز هویت دو مرحله‌ای (2FA) هنگام ورود" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 dark:border-slate-800",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							dir: "ltr",
							placeholder: "رمز عبور فعلی (در صورت تغییر)",
							...register("current_password"),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}), errors.current_password && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							role: "alert",
							className: "block text-xs text-red-600",
							children: errors.current_password.message
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							dir: "ltr",
							placeholder: "رمز عبور جدید",
							...register("new_password"),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}), errors.new_password && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							role: "alert",
							className: "block text-xs text-red-600",
							children: errors.new_password.message
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "submit",
					disabled: isSubmitting,
					style: { backgroundColor: "var(--theme-primary)" },
					className: "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ذخیره پروفایل" })]
				})
			]
		})]
	});
};
var NotificationsPage = () => {
	const addToast = useAppStore((state) => state.addToast);
	const [items, setItems] = (0, import_react.useState)([]);
	const [page, setPage] = (0, import_react.useState)(1);
	const [lastPage, setLastPage] = (0, import_react.useState)(1);
	const load = async (targetPage = page) => {
		try {
			const response = await apiRequest(`/notifications?page=${targetPage}&per_page=20`);
			if (targetPage > response.meta.last_page) {
				setPage(Math.max(1, response.meta.last_page));
				return;
			}
			setItems(response.data);
			setLastPage(response.meta.last_page);
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "دریافت اعلان‌ها ناموفق بود.");
		}
	};
	(0, import_react.useEffect)(() => {
		load(page);
	}, [page]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "flex items-center gap-2 text-lg font-extrabold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-5 w-5 text-(--theme-primary)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "مرکز اعلان‌ها (Notification Center)" })]
			}),
			items.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-bold",
						children: n.title_fa
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-slate-600 dark:text-slate-300",
						children: n.body_fa
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 text-[11px] text-slate-400",
						children: [
							n.channel,
							" · ",
							new Date(n.created_at).toLocaleString("fa-IR")
						]
					})
				] }), !n.is_read && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: async () => {
						try {
							await apiRequest(`/notifications/${n.id}/read`, { method: "POST" });
							await load();
						} catch (error) {
							addToast("error", error instanceof Error ? error.message : "علامت‌گذاری اعلان ناموفق بود.");
						}
					},
					className: "inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "خوانده شد" })]
				})]
			}, n.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
				page,
				lastPage,
				onChange: setPage
			})
		]
	});
};
export { NotificationsPage, ProfilePage };
