import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { O as InlineLoader, ct as useParams, ot as Link } from "./index-Dacn8Sc3.js";
import { t as ArrowRight } from "./arrow-right-DHz6daHj.js";
import { n as useForm, t as u } from "./zod-DW8XBK3S.js";
import { t as SeoHead } from "./SeoHead-g4XZ-3Rd.js";
import { t as Breadcrumb } from "./Breadcrumb-C4l8Yv4F.js";
import { t as Pagination } from "./Pagination-Cy7ez7lz.js";
import { t as ZeroBrokenImage } from "./ZeroBrokenImage-CvCIOfg-.js";
import { a as object, o as string } from "./schemas-HxyU5SsU.js";
import { n as SelfHostedCaptcha, t as PublicHoneypotField } from "./PublicHoneypotField-Fj1nUzIB.js";
import { t as sanitizeHtml } from "./sanitizeHtml-B1l_T8WV.js";
import { t as CmsPageIntro } from "./CmsPageIntro-DZsc0ikM.js";
// src/pages/public/NewsPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var commentSchema = object({
	author_name: string().min(2, "نام خود را وارد کنید").max(120),
	body: string().min(10, "متن دیدگاه حداقل ۱۰ کاراکتر باشد").max(2e3, "متن دیدگاه حداکثر ۲۰۰۰ کاراکتر باشد"),
	captcha: string().min(1, "کد امنیتی را وارد کنید"),
	website: string().optional()
});
var NewsPage = () => {
	const { slug } = useParams();
	const language = useAppStore((s) => s.language);
	const addToast = useAppStore((s) => s.addToast);
	const [articles, setArticles] = (0, import_react.useState)([]);
	const [articlePage, setArticlePage] = (0, import_react.useState)(1);
	const [articleLastPage, setArticleLastPage] = (0, import_react.useState)(1);
	const [single, setSingle] = (0, import_react.useState)(null);
	const [comments, setComments] = (0, import_react.useState)([]);
	const [commentsPage, setCommentsPage] = (0, import_react.useState)(1);
	const [commentsLastPage, setCommentsLastPage] = (0, import_react.useState)(1);
	const [commentsLoading, setCommentsLoading] = (0, import_react.useState)(false);
	const [commentsError, setCommentsError] = (0, import_react.useState)("");
	const [captchaKey, setCaptchaKey] = (0, import_react.useState)("");
	const [captchaRefreshToken, setCaptchaRefreshToken] = (0, import_react.useState)(0);
	const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
		resolver: u(commentSchema),
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
	(0, import_react.useEffect)(() => {
		let active = true;
		if (slug) {
			setSingle(null);
			setComments([]);
			setCommentsError("");
			setCommentsPage(1);
			reset();
			apiRequest(`/articles/${slug}`).then((r) => {
				if (active) setSingle(r.data);
			}).catch((error) => {
				if (active) addToast("error", error instanceof Error ? error.message : "دریافت مقاله ناموفق بود.");
			});
		} else {
			setSingle(null);
			setCommentsLoading(false);
		}
		return () => {
			active = false;
		};
	}, [
		slug,
		reset,
		addToast
	]);
	(0, import_react.useEffect)(() => {
		if (!slug) return;
		let active = true;
		setCommentsLoading(true);
		setCommentsError("");
		apiRequest(`/articles/${slug}/comments?page=${commentsPage}&per_page=20`).then((response) => {
			if (active) {
				setComments(response.data);
				setCommentsLastPage(response.meta.last_page);
			}
		}).catch(() => {
			if (active) setCommentsError("دریافت دیدگاه‌ها با خطا روبه‌رو شد.");
		}).finally(() => {
			if (active) setCommentsLoading(false);
		});
		return () => {
			active = false;
		};
	}, [slug, commentsPage]);
	(0, import_react.useEffect)(() => {
		if (slug) return;
		let active = true;
		apiRequest(`/articles?page=${articlePage}&per_page=9`).then((response) => {
			if (active) {
				setArticles(response.data);
				setArticleLastPage(response.meta.last_page);
			}
		}).catch((error) => {
			if (active) addToast("error", error instanceof Error ? error.message : "دریافت فهرست مقالات ناموفق بود.");
		});
		return () => {
			active = false;
		};
	}, [
		slug,
		articlePage,
		addToast
	]);
	const submitComment = async (data) => {
		if (!slug) return;
		try {
			await apiRequest(`/articles/${slug}/comments`, {
				method: "POST",
				body: JSON.stringify({
					...data,
					captcha_key: captchaKey
				})
			});
			reset();
			refreshCaptcha();
			addToast("success", "دیدگاه شما پس از بررسی مدیر منتشر خواهد شد.");
		} catch (error) {
			refreshCaptcha();
			addToast("error", error instanceof Error ? error.message : "ارسال دیدگاه ناموفق بود.");
		}
	};
	if (slug && single) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeoHead, {
				title: language === "fa" ? single.title_fa : single.title_en,
				description: language === "fa" ? single.excerpt_fa : single.excerpt_en,
				image: single.cover_image,
				language
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumb, { items: [{
				label: "اخبار و مقالات",
				to: "/news"
			}, { label: single.title_fa }] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-72 bg-slate-100 dark:bg-slate-800",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
						src: single.cover_image,
						alt: single.title_fa,
						className: "h-full w-full object-cover"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-6 sm:p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: single.category_fa }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: single.published_at }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: single.author_fa }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"زمان مطالعه: ",
									single.read_minutes,
									" دقیقه"
								] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-3 text-2xl font-extrabold text-slate-900 dark:text-white",
							children: language === "fa" ? single.title_fa : single.title_en
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "prose mt-6 max-w-none text-sm leading-8 text-slate-700 dark:prose-invert dark:text-slate-300",
							dangerouslySetInnerHTML: { __html: sanitizeHtml(language === "fa" ? single.content_fa : single.content_en) }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mt-10 border-t border-slate-200 pt-8 dark:border-slate-800",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-bold",
									children: "دیدگاه‌ها"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-slate-500",
									children: "دیدگاه‌ها پس از بررسی مدیر نمایش داده می‌شوند."
								}),
								commentsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-5 text-sm text-slate-500",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineLoader, { label: "در حال بارگذاری دیدگاه‌ها..." })
								}) : commentsError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									role: "alert",
									className: "mt-5 text-sm text-red-600",
									children: commentsError
								}) : comments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-5 text-sm text-slate-500",
									children: "هنوز دیدگاهی برای این مقاله ثبت نشده است."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-5 space-y-3",
									children: comments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: "rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "text-sm font-semibold",
												children: comment.author_name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
												className: "text-xs text-slate-500",
												children: new Date(comment.created_at).toLocaleDateString(language === "fa" ? "fa-IR" : "en-US")
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300",
											children: comment.body
										})]
									}, comment.id))
								}),
								comments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
									page: commentsPage,
									lastPage: commentsLastPage,
									onChange: setCommentsPage
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: handleSubmit(submitComment),
									className: "relative mt-8 space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:p-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicHoneypotField, { registration: register("website") }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-sm font-bold",
											children: "ثبت دیدگاه"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "comment-author",
												className: "mb-1 block text-xs font-medium",
												children: "نام شما"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												...register("author_name"),
												id: "comment-author",
												maxLength: 120,
												className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
											}),
											errors.author_name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-red-600",
												children: errors.author_name.message
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "comment-body",
												className: "mb-1 block text-xs font-medium",
												children: "متن دیدگاه"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												...register("body"),
												id: "comment-body",
												rows: 4,
												maxLength: 2e3,
												className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
											}),
											errors.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-red-600",
												children: errors.body.message
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
											className: "rounded-lg bg-(--theme-primary) px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60",
											children: isSubmitting ? "در حال ارسال..." : "ارسال دیدگاه"
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/news",
							className: "mt-8 inline-flex items-center gap-1.5 text-xs font-semibold text-(--theme-primary) hover:underline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "بازگشت به فهرست مقالات" })]
						})
					]
				})]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsPageIntro, {
				slug: "news",
				className: "mb-8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-6 md:grid-cols-3",
				children: articles.map((art) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: `/news/${art.slug}`,
					className: "group overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-48 overflow-hidden bg-slate-100 dark:bg-slate-800",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
							src: art.cover_image,
							alt: art.title_fa,
							className: "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs text-slate-500 tabular-nums",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: art.category_fa }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: art.published_at })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 text-base font-bold text-slate-900 group-hover:text-(--theme-primary) dark:text-white",
								children: language === "fa" ? art.title_fa : art.title_en
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 line-clamp-3 text-xs text-slate-600 dark:text-slate-300",
								children: language === "fa" ? art.excerpt_fa : art.excerpt_en
							})
						]
					})]
				}, art.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
				page: articlePage,
				lastPage: articleLastPage,
				onChange: setArticlePage
			})
		]
	});
};
export { NewsPage };
