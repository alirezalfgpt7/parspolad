import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { O as InlineLoader, T as AnimatedBackground, _ as EffectAction, c as FlipAuthCardEffect, g as GlassPanelEffect, ot as Link, r as RotatingText, st as useNavigate, v as DecorativeCube, w as EffectText, y as CssSlideshowEffect } from "./index-Dacn8Sc3.js";
import { n as useForm, t as u } from "./zod-DW8XBK3S.js";
import { o as DEFAULT_LOGIN_SETTINGS } from "./ZeroBrokenImage-CvCIOfg-.js";
import { t as BrandLogo } from "./BrandLogo-BGj8yBVG.js";
import { t as SeoHead } from "./SeoHead-g4XZ-3Rd.js";
import { n as SelfHostedCaptcha, t as PublicHoneypotField } from "./PublicHoneypotField-Fj1nUzIB.js";
import { a as object, o as string } from "./schemas-HxyU5SsU.js";
import { t as DynamicLucideIcon } from "./LucideIconMap-Dn9cJkOH.js";
// src/pages/auth/AuthPages.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var registerSchema = object({
	name: string().min(2, "نام و نام خانوادگی را وارد کنید"),
	email: string().email("ایمیل معتبر وارد کنید"),
	phone: string().optional(),
	password: string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
	captcha: string().min(1, "کد امنیتی را وارد کنید"),
	website: string().optional()
});
var loginSchema = object({
	email: string().email("ایمیل معتبر وارد کنید"),
	password: string().min(1, "رمز عبور الزامی است"),
	captcha: string().min(1, "کد امنیتی را وارد کنید"),
	website: string().optional()
});
var twoFactorSchema = string().regex(/^\d{6}$/, "کد تایید باید ۶ رقم باشد.");
var FALLBACK_BG_SLIDES = [
	"/images/hero/slide-1.jpg",
	"/images/hero/slide-2.jpg",
	"/images/hero/slide-3.jpg"
];
var AuthShellPage = ({ initialMode }) => {
	const navigate = useNavigate();
	const { setAuth, addToast, bootstrap, previewLogin, language } = useAppStore();
	const [mode, setMode] = (0, import_react.useState)(initialMode);
	const [challengeToken, setChallengeToken] = (0, import_react.useState)("");
	const [twoFactorCode, setTwoFactorCode] = (0, import_react.useState)("");
	const [demoHint, setDemoHint] = (0, import_react.useState)("");
	const [loginCaptchaKey, setLoginCaptchaKey] = (0, import_react.useState)("");
	const [loginCaptchaRefresh, setLoginCaptchaRefresh] = (0, import_react.useState)(0);
	const [regCaptchaKey, setRegCaptchaKey] = (0, import_react.useState)("");
	const [regCaptchaRefresh, setRegCaptchaRefresh] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		setMode(initialMode);
	}, [initialMode]);
	const loginCfg = {
		...DEFAULT_LOGIN_SETTINGS,
		...bootstrap?.login || {},
		...previewLogin || {}
	};
	const t = (faVal, enVal) => (language === "fa" ? faVal : enVal) || faVal || "";
	const companyName = (language === "fa" ? bootstrap?.company?.name_fa : bootstrap?.company?.name_en) || (language === "fa" ? "پارس پولاد آقایی" : "Pars Poolad Aghaee");
	const companySlogan = (language === "fa" ? bootstrap?.company?.slogan_fa : bootstrap?.company?.slogan_en) || "مهندسی دقیق، ساخت پایدار";
	const heroSlideImages = bootstrap?.sliders?.flatMap((s) => s.slides).map((s) => s.desktop_media).filter((u) => Boolean(u) && !/\.(mp4|webm)(\?.*)?$/i.test(u)).slice(0, 4) || [];
	const bgSlides = heroSlideImages.length > 0 ? heroSlideImages : FALLBACK_BG_SLIDES;
	const loginForm = useForm({
		resolver: u(loginSchema),
		defaultValues: {
			email: "",
			password: "",
			captcha: "",
			website: ""
		}
	});
	const regForm = useForm({
		resolver: u(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			password: "",
			captcha: "",
			website: ""
		}
	});
	const refreshLoginCaptcha = () => {
		setLoginCaptchaKey("");
		setLoginCaptchaRefresh((token) => token + 1);
		loginForm.setValue("captcha", "", { shouldValidate: false });
	};
	const refreshRegCaptcha = () => {
		setRegCaptchaKey("");
		setRegCaptchaRefresh((token) => token + 1);
		regForm.setValue("captcha", "", { shouldValidate: false });
	};
	const handleLogin = async (values) => {
		if (!loginCaptchaKey) {
			addToast("error", "تصویر کد امنیتی هنوز آماده نشده است.");
			return;
		}
		if (challengeToken) {
			const parsedCode = twoFactorSchema.safeParse(twoFactorCode);
			if (!parsedCode.success) {
				addToast("error", parsedCode.error.issues[0]?.message ?? "کد تایید معتبر نیست.");
				return;
			}
		}
		try {
			const payload = {
				...values,
				captcha_key: loginCaptchaKey,
				...challengeToken ? { two_factor_code: twoFactorCode } : {}
			};
			const res = await apiRequest("/auth/login", {
				method: "POST",
				body: JSON.stringify(payload)
			});
			if (res.requires_2fa) {
				setChallengeToken(res.challenge_token || "pending");
				setDemoHint(res.demo_hint || "");
				refreshLoginCaptcha();
				addToast("info", "لطفاً کد تایید دو مرحله‌ای را وارد نمایید.");
				return;
			}
			if (res.token && res.user) {
				setAuth(res.user, res.token);
				addToast("success", `خوش آمدید، ${res.user.name}`);
				navigate(res.user.role === "user" ? "/admin/profile" : "/admin");
			}
		} catch (err) {
			refreshLoginCaptcha();
			addToast("error", err instanceof Error ? err.message : "ورود ناموفق بود");
		}
	};
	const handleRegister = async (data) => {
		if (!regCaptchaKey) {
			addToast("error", "تصویر کد امنیتی هنوز آماده نشده است.");
			return;
		}
		try {
			const res = await apiRequest("/auth/register", {
				method: "POST",
				body: JSON.stringify({
					...data,
					captcha_key: regCaptchaKey
				})
			});
			setAuth(res.user, res.token);
			addToast("success", "ثبت‌نام شما با موفقیت انجام شد.");
			regForm.reset();
			refreshRegCaptcha();
			navigate("/admin/profile");
		} catch (err) {
			refreshRegCaptcha();
			addToast("error", err instanceof Error ? err.message : "خطا در ثبت‌نام");
		}
	};
	const switchMode = (target) => {
		setMode(target);
		if (!loginCfg.enable_3d_flip) navigate(target === "login" ? "/login" : "/register");
	};
	const cardCustomStyle = {
		backgroundColor: loginCfg.card_bg_color || void 0,
		color: loginCfg.text_color || "#F8FAFC"
	};
	const inputCustomStyle = {
		backgroundColor: loginCfg.input_bg_color || void 0,
		color: loginCfg.text_color || "#F8FAFC"
	};
	const accentStyle = { backgroundColor: loginCfg.accent_color || "var(--theme-primary)" };
	const loginFace = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassPanelEffect, {
		style: cardCustomStyle,
		className: "login-glass-panel relative w-full rounded-2xl p-6 sm:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					"aria-label": companyName,
					className: "flex min-w-0 items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/90 p-1 shadow-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLogo, {
							placement: "login",
							alt: companyName,
							className: "h-full w-full"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotatingText, {
						items: [companyName, companySlogan].filter((item, idx, list) => item.trim() && list.indexOf(item) === idx),
						showController: true,
						className: "max-w-56 text-sm font-extrabold"
					})]
				}), loginCfg.show_decorative_cube && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DecorativeCube, {
					size: "sm",
					className: "h-10 w-10 shrink-0 rounded-xl border border-white/10 bg-white/5"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "auth-security-badge",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
					name: loginCfg.badge_icon,
					fallback: "ShieldCheck",
					className: "h-3.5 w-3.5"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(loginCfg.badge_text_fa, loginCfg.badge_text_en) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-bold",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectText, {
					inverse: true,
					children: challengeToken ? t(loginCfg.two_factor_title_fa, loginCfg.two_factor_title_en) : t(loginCfg.title_fa, loginCfg.title_en)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs opacity-75",
				children: challengeToken ? demoHint || t(loginCfg.two_factor_hint_fa, loginCfg.two_factor_hint_en) : t(loginCfg.subtitle_fa, loginCfg.subtitle_en)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: loginForm.handleSubmit(handleLogin),
				className: "auth-glass-form mt-6 space-y-4",
				children: [
					!challengeToken ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicHoneypotField, { registration: loginForm.register("website") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mb-1.5 flex items-center gap-1.5 text-xs opacity-85",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
									name: loginCfg.email_icon,
									fallback: "Mail",
									className: "h-3.5 w-3.5"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(loginCfg.email_label_fa, loginCfg.email_label_en) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "email",
								dir: "ltr",
								style: inputCustomStyle,
								placeholder: t(loginCfg.email_placeholder_fa, loginCfg.email_placeholder_en),
								...loginForm.register("email"),
								className: "auth-glass-input w-full rounded-lg px-3.5 py-2.5 text-sm"
							}),
							loginForm.formState.errors.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								role: "alert",
								className: "mt-1 text-xs text-red-400",
								children: loginForm.formState.errors.email.message
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mb-1.5 flex items-center gap-1.5 text-xs opacity-85",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
									name: loginCfg.password_icon,
									fallback: "Lock",
									className: "h-3.5 w-3.5"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(loginCfg.password_label_fa, loginCfg.password_label_en) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "password",
								dir: "ltr",
								style: inputCustomStyle,
								placeholder: t(loginCfg.password_placeholder_fa, loginCfg.password_placeholder_en),
								...loginForm.register("password"),
								className: "auth-glass-input w-full rounded-lg px-3.5 py-2.5 text-sm"
							}),
							loginForm.formState.errors.password && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								role: "alert",
								className: "mt-1 text-xs text-red-400",
								children: loginForm.formState.errors.password.message
							})
						] })
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mb-1.5 flex items-center gap-1.5 text-xs opacity-85",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
							name: loginCfg.two_factor_icon,
							fallback: "ShieldCheck",
							className: "h-4 w-4 text-amber-400"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(loginCfg.two_factor_title_fa, loginCfg.two_factor_title_en) })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						required: true,
						dir: "ltr",
						style: inputCustomStyle,
						value: twoFactorCode,
						onChange: (e) => setTwoFactorCode(e.target.value),
						placeholder: "482910",
						className: "auth-glass-input w-full rounded-lg px-3.5 py-2.5 text-center font-mono text-lg tracking-widest"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelfHostedCaptcha, {
						registration: loginForm.register("captcha"),
						refreshToken: loginCaptchaRefresh,
						onKeyChange: setLoginCaptchaKey,
						onRefresh: refreshLoginCaptcha,
						error: loginForm.formState.errors.captcha?.message,
						appearance: "glass",
						mode: "mixed"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectAction, {
						type: "submit",
						disabled: loginForm.formState.isSubmitting || !challengeToken && !loginCaptchaKey,
						style: accentStyle,
						className: "inline-flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60",
						children: loginForm.formState.isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineLoader, {
							label: language === "fa" ? "در حال بررسی..." : "Signing in...",
							className: "justify-center"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
							name: loginCfg.submit_icon,
							fallback: "LogIn",
							className: "h-4 w-4"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: challengeToken ? t(loginCfg.two_factor_submit_fa, loginCfg.two_factor_submit_en) : t(loginCfg.submit_text_fa, loginCfg.submit_text_en) })] })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-xs opacity-80",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => switchMode("register"),
					className: "inline-flex items-center gap-1.5 hover:opacity-100 hover:underline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
						name: loginCfg.register_icon,
						fallback: "UserPlus",
						className: "h-3.5 w-3.5"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(loginCfg.register_cta_fa, loginCfg.register_cta_en) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "inline-flex items-center gap-1 hover:opacity-100 hover:underline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
						name: loginCfg.back_icon,
						fallback: "ArrowRight",
						className: "h-3.5 w-3.5"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(loginCfg.back_home_fa, loginCfg.back_home_en) })]
				})]
			})
		]
	});
	const registerFace = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassPanelEffect, {
		style: cardCustomStyle,
		className: "login-glass-panel relative w-full rounded-2xl p-6 sm:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/90 p-1 shadow-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLogo, {
							placement: "register",
							alt: companyName,
							className: "h-full w-full"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-extrabold",
						children: t(loginCfg.register_title_fa, loginCfg.register_title_en)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] opacity-75",
						children: t(loginCfg.register_subtitle_fa, loginCfg.register_subtitle_en)
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex h-9 w-9 items-center justify-center rounded-xl bg-white/10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
						name: loginCfg.register_icon,
						fallback: "UserPlus",
						className: "h-4 w-4"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: regForm.handleSubmit(handleRegister),
				className: "auth-glass-form space-y-3.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicHoneypotField, { registration: regForm.register("website") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mb-1 block text-xs opacity-85",
							children: t(loginCfg.register_name_label_fa, loginCfg.register_name_label_en)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							...regForm.register("name"),
							style: inputCustomStyle,
							className: "auth-glass-input w-full rounded-lg px-3 py-2 text-sm"
						}),
						regForm.formState.errors.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-red-400",
							children: regForm.formState.errors.name.message
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mb-1 flex items-center gap-1.5 text-xs opacity-85",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
								name: loginCfg.email_icon,
								fallback: "Mail",
								className: "h-3.5 w-3.5"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(loginCfg.email_label_fa, loginCfg.email_label_en) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							...regForm.register("email"),
							type: "email",
							dir: "ltr",
							style: inputCustomStyle,
							placeholder: t(loginCfg.email_placeholder_fa, loginCfg.email_placeholder_en),
							className: "auth-glass-input w-full rounded-lg px-3 py-2 text-sm"
						}),
						regForm.formState.errors.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-red-400",
							children: regForm.formState.errors.email.message
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1 block text-xs opacity-85",
						children: t(loginCfg.register_phone_label_fa, loginCfg.register_phone_label_en)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						...regForm.register("phone"),
						dir: "ltr",
						style: inputCustomStyle,
						className: "auth-glass-input w-full rounded-lg px-3 py-2 text-sm"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mb-1 flex items-center gap-1.5 text-xs opacity-85",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
								name: loginCfg.password_icon,
								fallback: "Lock",
								className: "h-3.5 w-3.5"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(loginCfg.password_label_fa, loginCfg.password_label_en) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							...regForm.register("password"),
							type: "password",
							dir: "ltr",
							style: inputCustomStyle,
							className: "auth-glass-input w-full rounded-lg px-3 py-2 text-sm"
						}),
						regForm.formState.errors.password && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-red-400",
							children: regForm.formState.errors.password.message
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelfHostedCaptcha, {
						registration: regForm.register("captcha"),
						refreshToken: regCaptchaRefresh,
						onKeyChange: setRegCaptchaKey,
						onRefresh: refreshRegCaptcha,
						error: regForm.formState.errors.captcha?.message,
						appearance: "glass"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectAction, {
						type: "submit",
						disabled: regForm.formState.isSubmitting || !regCaptchaKey,
						style: accentStyle,
						className: "inline-flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white",
						children: regForm.formState.isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineLoader, {
							label: language === "fa" ? "در حال ثبت..." : "Submitting...",
							className: "justify-center"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
							name: loginCfg.register_icon,
							fallback: "UserPlus",
							className: "h-4 w-4"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(loginCfg.register_submit_fa, loginCfg.register_submit_en) })] })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-xs opacity-80",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => switchMode("login"),
					className: "inline-flex items-center gap-1.5 hover:opacity-100 hover:underline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
						name: loginCfg.submit_icon,
						fallback: "LogIn",
						className: "h-3.5 w-3.5"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(loginCfg.login_cta_fa, loginCfg.login_cta_en) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "inline-flex items-center gap-1 hover:opacity-100 hover:underline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicLucideIcon, {
						name: loginCfg.back_icon,
						fallback: "ArrowRight",
						className: "h-3.5 w-3.5"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(loginCfg.back_home_fa, loginCfg.back_home_en) })]
				})]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "auth-shell relative isolate flex min-h-screen items-center justify-center overflow-hidden p-4",
		style: {
			backgroundColor: loginCfg.backdrop_color || "#020617",
			color: loginCfg.text_color || "#F8FAFC"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeoHead, { title: mode === "login" ? t(loginCfg.title_fa, loginCfg.title_en) : t(loginCfg.register_title_fa, loginCfg.register_title_en) }),
			loginCfg.enable_bg_slideshow && bgSlides.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 opacity-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CssSlideshowEffect, {
					images: bgSlides,
					intervalPerSlideSeconds: 6
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedBackground, { particles: loginCfg.enable_particles }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10 w-full max-w-lg",
				children: loginCfg.enable_3d_flip ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlipAuthCardEffect, {
					flipped: mode === "register",
					front: loginFace,
					back: registerFace
				}) : mode === "login" ? loginFace : registerFace
			})
		]
	});
};
var LoginPage = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthShellPage, { initialMode: "login" });
var RegisterPage = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthShellPage, { initialMode: "register" });
export { LoginPage, RegisterPage };
