import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { n as useForm, t as u } from "./zod-DW8XBK3S.js";
import { $ as CircleCheck } from "./index-Dacn8Sc3.js";
import { t as CmsPageIntro } from "./CmsPageIntro-DZsc0ikM.js";
import { a as object, o as string } from "./schemas-HxyU5SsU.js";
import { t as SearchableSelect } from "./SearchableSelect-BCBuOYhg.js";
import { n as SelfHostedCaptcha, t as PublicHoneypotField } from "./PublicHoneypotField-Fj1nUzIB.js";
// src/pages/public/RfqPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var rfqSchema = object({
	name: string().min(2, "نام مسئول استعلام الزامی است"),
	company: string().min(2, "نام شرکت یا کارفرما الزامی است"),
	email: string().email("ایمیل سازمانی معتبر وارد کنید"),
	phone: string().min(8, "شماره تماس معتبر وارد کنید"),
	subject: string().min(4, "عنوان مناقصه یا تجهیز را وارد کنید"),
	message: string().min(12, "مشخصات فنی (سایز، فشار، گرید و تعداد) را بنویسید"),
	captcha: string().min(1, "کد امنیتی را وارد کنید"),
	website: string().optional()
});
var RfqPage = () => {
	const { addToast, bootstrap, language } = useAppStore();
	const [scope, setScope] = (0, import_react.useState)("");
	const [done, setDone] = (0, import_react.useState)(false);
	const [captchaKey, setCaptchaKey] = (0, import_react.useState)("");
	const [captchaRefreshToken, setCaptchaRefreshToken] = (0, import_react.useState)(0);
	const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
		resolver: u(rfqSchema),
		defaultValues: {
			captcha: "",
			website: ""
		}
	});
	const refreshCaptcha = () => {
		setCaptchaKey("");
		setCaptchaRefreshToken((token) => token + 1);
		setValue("captcha", "", { shouldValidate: false });
	};
	const scopeOptions = (0, import_react.useMemo)(() => (bootstrap?.services ?? []).map((service) => {
		const title = language === "fa" ? service.title_fa : service.title_en;
		return {
			value: title,
			label: title
		};
	}), [bootstrap?.services, language]);
	(0, import_react.useEffect)(() => {
		if (scopeOptions.length > 0 && !scopeOptions.some((option) => option.value === scope)) setScope(scopeOptions[0].value);
	}, [scopeOptions, scope]);
	const onSubmit = async (data) => {
		try {
			await apiRequest("/contact", {
				method: "POST",
				body: JSON.stringify({
					...data,
					captcha_key: captchaKey,
					subject: `[RFQ - ${scope}] ${data.subject}`,
					type: "rfq"
				})
			});
			setDone(true);
			reset();
			refreshCaptcha();
			addToast("success", "فرم درخواست همکاری / RFQ با موفقیت ثبت شد.");
		} catch (err) {
			refreshCaptcha();
			addToast("error", err instanceof Error ? err.message : "خطا در ثبت استعلام");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsPageIntro, {
			slug: "rfq",
			className: "mb-6",
			titleClassName: "text-2xl font-extrabold text-slate-900 dark:text-white"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900",
			children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "py-10 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mx-auto h-12 w-12 text-emerald-600" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 text-lg font-bold",
						children: "درخواست استعلام شما ثبت گردید"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-slate-500",
						children: "واحد بازرگانی و مهندسی فروش پارس پولاد آقایی در کوتاه‌ترین زمان با شما تماس می‌گیرد."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setDone(false),
						className: "mt-5 rounded-lg bg-(--theme-primary) px-5 py-2 text-xs font-semibold text-white",
						children: "ثبت استعلام جدید"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit(onSubmit),
				className: "mt-6 space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicHoneypotField, { registration: register("website") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
						label: "حوزه تخصصی درخواست",
						options: scopeOptions,
						value: scope,
						onChange: setScope
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "mb-1 block text-xs font-medium",
								children: "نام و سمت متقاضی"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								...register("name"),
								className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							}),
							errors.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-red-600",
								children: errors.name.message
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "mb-1 block text-xs font-medium",
								children: "نام شرکت / کارفرما"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								...register("company"),
								className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							}),
							errors.company && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-red-600",
								children: errors.company.message
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "mb-1 block text-xs font-medium",
								children: "ایمیل سازمانی"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								...register("email"),
								type: "email",
								dir: "ltr",
								className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							}),
							errors.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-red-600",
								children: errors.email.message
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "mb-1 block text-xs font-medium",
								children: "تلفن تماس"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								...register("phone"),
								dir: "ltr",
								className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							}),
							errors.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-red-600",
								children: errors.phone.message
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mb-1 block text-xs font-medium",
							children: "عنوان پروژه / شماره مناقصه / تجهیز درخواستی"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							...register("subject"),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						errors.subject && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-red-600",
							children: errors.subject.message
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mb-1 block text-xs font-medium",
							children: "مشخصات فنی (سایز جداری، فشار کاری PSI، گرید متالورژی، استاندارد مورد نیاز و تعداد)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							...register("message"),
							rows: 5,
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						errors.message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-red-600",
							children: errors.message.message
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelfHostedCaptcha, {
						registration: register("captcha"),
						refreshToken: captchaRefreshToken,
						onKeyChange: setCaptchaKey,
						onRefresh: refreshCaptcha,
						error: errors.captcha?.message
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: isSubmitting || !captchaKey,
						style: {
							backgroundColor: "var(--theme-btn-bg)",
							color: "var(--theme-btn-text)"
						},
						className: "rounded-lg px-6 py-2.5 text-sm font-semibold shadow-xs disabled:opacity-60",
						children: isSubmitting ? "در حال ثبت..." : "ارسال رسمی درخواست استعلام"
					})
				]
			})
		})]
	});
};
export { RfqPage };
