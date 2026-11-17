import { a as createLucideIcon, l as require_react, m as __toESM, o as useAppStore, r as formatLocalizedNumber, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { D as usePrefersReducedMotion, _ as EffectAction, i as Reveal, o as ParticleTextEffect, ot as Link, s as InfiniteBrandSlider, u as EffectImage, y as CssSlideshowEffect } from "./index-Dacn8Sc3.js";
import { t as ArrowLeft } from "./arrow-left-DZG4IumZ.js";
import { t as ArrowRight } from "./arrow-right-DHz6daHj.js";
import { t as BrandLogo } from "./BrandLogo-BGj8yBVG.js";
import { t as SeoHead } from "./SeoHead-g4XZ-3Rd.js";
import { s as DEFAULT_PAGES_CONFIG, t as ZeroBrokenImage } from "./ZeroBrokenImage-CvCIOfg-.js";
import { t as sanitizeHtml } from "./sanitizeHtml-B1l_T8WV.js";
import { t as useCmsPage } from "./useCmsPage-CoEg_6AT.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CirclePlay = createLucideIcon("circle-play", [["path", {
	d: "M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z",
	key: "kmsa83"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}]]);
// src/components/ui/StatCounter.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var StatCounter = ({ target, suffix, label, lang }) => {
	const [val, setVal] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		let start = 0;
		const duration = 900;
		const stepTime = 24;
		const inc = target / Math.max(1, Math.floor(duration / stepTime));
		const timer = setInterval(() => {
			start += inc;
			if (start >= target) {
				setVal(target);
				clearInterval(timer);
			} else setVal(Math.floor(start));
		}, stepTime);
		return () => clearInterval(timer);
	}, [target]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-1.5 border-b border-slate-200/70 pb-4 md:border-b-0 md:border-e md:pb-0 md:pe-6 last:border-0 dark:border-slate-800",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline gap-1.5 text-3xl font-extrabold tracking-tight text-(--theme-primary) tabular-nums sm:text-4xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatLocalizedNumber(val, lang) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-lg font-bold text-slate-600 dark:text-slate-300",
				children: suffix
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium text-slate-600 dark:text-slate-400 sm:text-sm",
			children: label
		})]
	});
};
// src/pages/public/HomePage.tsx
var HomePage = () => {
	const { bootstrap, previewPagesConfig, language } = useAppStore();
	const shouldReduceMotion = usePrefersReducedMotion();
	const [featuredProjects, setFeaturedProjects] = (0, import_react.useState)([]);
	const [articles, setArticles] = (0, import_react.useState)([]);
	const { page: spotlight } = useCmsPage("home-spotlight");
	(0, import_react.useEffect)(() => {
		apiRequest("/projects?per_page=6").then((res) => {
			if (!Array.isArray(res.data)) throw new TypeError("The projects API response must include a data array.");
			setFeaturedProjects(res.data);
		}).catch((error) => console.error("Could not load featured projects:", error));
		apiRequest("/articles?per_page=3").then((res) => {
			if (!Array.isArray(res.data)) throw new TypeError("The articles API response must include a data array.");
			setArticles(res.data);
		}).catch((error) => console.error("Could not load home page articles:", error));
	}, []);
	const kpis = bootstrap?.kpis || [];
	const services = bootstrap?.services || [];
	const partners = bootstrap?.partners || [];
	const banner = bootstrap?.banners?.find((b) => b.placement === "landing_mid");
	const ArrowIcon = language === "fa" ? ArrowLeft : ArrowRight;
	const homeText = (key) => {
		const value = spotlight?.metadata?.[`${key}_${language}`];
		return typeof value === "string" ? value : "";
	};
	const spotlightOverride = {
		...DEFAULT_PAGES_CONFIG.home_spotlight,
		...bootstrap?.pages_config?.home_spotlight || {},
		...previewPagesConfig?.home_spotlight || {}
	};
	const spotlightBadge = (language === "fa" ? spotlightOverride.badge_fa : spotlightOverride.badge_en) || (spotlight ? language === "fa" ? spotlight.subtitle_fa : spotlight.subtitle_en : "");
	const spotlightTitle = (language === "fa" ? spotlightOverride.title_fa : spotlightOverride.title_en) || (spotlight ? language === "fa" ? spotlight.title_fa : spotlight.title_en : "");
	const spotlightSubtitle = language === "fa" ? spotlightOverride.subtitle_fa : spotlightOverride.subtitle_en;
	const spotlightImages = spotlight ? [spotlight.metadata?.image_url, spotlight.metadata?.secondary_image_url].filter((image) => typeof image === "string" && image.length > 0) : [];
	const companyTitle = (language === "fa" ? bootstrap?.company?.name_fa : bootstrap?.company?.name_en) || (language === "fa" ? "پارس پولاد آقایی" : "PARS POOLAD AGHAEE");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeoHead, {
			title: (language === "fa" ? bootstrap?.seo?.site_title : bootstrap?.seo?.site_title_en) || bootstrap?.seo?.site_title || "",
			language
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-b border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 lg:px-8",
				children: kpis.map((k, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					delay: shouldReduceMotion ? 0 : index * .06,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCounter, {
						target: k.value,
						suffix: language === "fa" ? k.suffix_fa : k.suffix_en,
						label: language === "fa" ? k.label_fa : k.label_en,
						lang: language
					})
				}, k.id))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-10 flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold text-(--theme-primary)",
					children: homeText("capabilities_eyebrow")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white",
					style: { textWrap: "balance" },
					children: homeText("capabilities_title")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/services",
					className: "inline-flex items-center gap-1.5 text-sm font-semibold text-(--theme-link) hover:underline whitespace-nowrap",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: homeText("services_all") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowIcon, { className: "h-4 w-4" })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-6 md:grid-cols-3",
				children: services.map((svc, idx) => {
					const isWide = idx === 0 || idx === 3;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
						delay: idx * .06,
						className: `group overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900 ${isWide ? "md:col-span-2" : "md:col-span-1"}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `grid h-full ${isWide ? "sm:grid-cols-2" : "grid-cols-1"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col justify-between p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs font-bold text-slate-400 tabular-nums",
										children: [String(idx + 1).padStart(2, "0"), "."]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-2 text-lg font-bold text-slate-900 dark:text-white",
										children: language === "fa" ? svc.title_fa : svc.title_en
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300",
										children: language === "fa" ? svc.summary_fa : svc.summary_en
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/services",
									className: "mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-(--theme-primary) hover:underline",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: homeText("service_details") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowIcon, { className: "h-3.5 w-3.5" })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-52 overflow-hidden bg-slate-100 sm:h-full dark:bg-slate-800",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectImage, {
									src: svc.image_url,
									alt: language === "fa" ? svc.title_fa : svc.title_en,
									className: "h-full w-full object-cover"
								})
							})]
						})
					}, svc.id);
				})
			})]
		}),
		spotlight && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-y border-slate-200 bg-slate-900 py-16 text-white dark:border-slate-800",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid max-w-7xl items-stretch gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col justify-between gap-6 lg:col-span-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-slate-950/70 p-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLogo, {
									placement: "about",
									overrideUrl: spotlightOverride.logo_url,
									alt: companyTitle,
									className: "h-full w-full"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-amber-400",
								children: spotlightBadge
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 text-2xl font-extrabold leading-snug sm:text-3xl",
								style: { textWrap: "balance" },
								children: spotlightTitle
							})] })]
						}),
						spotlightSubtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-xs leading-relaxed text-amber-200/90",
							children: spotlightSubtitle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "prose prose-invert mt-4 max-w-none text-sm leading-relaxed text-slate-300",
							dangerouslySetInnerHTML: { __html: sanitizeHtml(language === "fa" ? spotlight.content_fa : spotlight.content_en) }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParticleTextEffect, {
								text: language === "en" ? companyTitle : "PARS POOLAD",
								color: "#fbbf24",
								height: 76
							})
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-3",
						children: [typeof spotlight.metadata?.primary_link === "string" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectAction, {
							as: Link,
							to: spotlight.metadata.primary_link,
							className: "rounded-lg bg-(--theme-primary) px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap",
							children: String(spotlight.metadata[language === "fa" ? "primary_label_fa" : "primary_label_en"] || "")
						}), typeof spotlight.metadata?.secondary_link === "string" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: spotlight.metadata.secondary_link,
							className: "inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 whitespace-nowrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlay, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: String(spotlight.metadata[language === "fa" ? "secondary_label_fa" : "secondary_label_en"] || "") })]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 lg:col-span-6",
					children: [spotlightImages.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative min-h-64 flex-1 overflow-hidden rounded-2xl border border-white/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CssSlideshowEffect, {
							images: spotlightImages,
							intervalPerSlideSeconds: 5
						})
					}), spotlightImages.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-3",
						children: spotlightImages.map((image) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-24 overflow-hidden rounded-xl border border-white/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectImage, {
								src: image,
								alt: spotlightTitle,
								className: "h-full w-full object-cover"
							})
						}, image))
					})]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-10 flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold text-(--theme-primary)",
					children: homeText("projects_eyebrow")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1.5 text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white",
					children: homeText("projects_title")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/projects",
					className: "inline-flex items-center gap-1.5 text-sm font-semibold text-(--theme-link) hover:underline whitespace-nowrap",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: homeText("projects_all") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowIcon, { className: "h-4 w-4" })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
				children: featuredProjects.slice(0, 6).map((p, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					delay: shouldReduceMotion ? 0 : index * .045,
					className: "h-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: `/projects/${p.slug}`,
						className: "group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-52 overflow-hidden bg-slate-100 dark:bg-slate-800",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectImage, {
								src: p.cover_image,
								alt: language === "fa" ? p.title_fa : p.title_en,
								className: "h-full w-full object-cover"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-1 flex-col justify-between p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.category?.name_fa }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											children: "·"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.year }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											children: "·"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.status === "completed" ? homeText("project_completed") : homeText("project_in_progress") })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-2 text-base font-bold leading-snug text-slate-900 group-hover:text-(--theme-primary) dark:text-white",
									children: language === "fa" ? p.title_fa : p.title_en
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300",
									children: language === "fa" ? p.summary_fa : p.summary_en
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: language === "fa" ? p.client_name_fa : p.client_name_en
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono shrink-0",
									children: p.contract_number
								})]
							})]
						})]
					})
				}, p.id))
			})]
		}),
		partners.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "overflow-hidden border-y border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto mb-8 max-w-7xl px-4 text-center sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold text-(--theme-primary)",
					children: homeText("partners_eyebrow")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-xl font-extrabold text-slate-900 dark:text-white",
					children: homeText("partners_title")
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfiniteBrandSlider, { items: partners.map((partner) => ({
					id: partner.id,
					name: language === "fa" ? partner.name_fa : partner.name_en,
					logoUrl: partner.logo_url,
					sector: partner.sector_fa
				})) })
			})]
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold text-(--theme-primary)",
					children: homeText("news_eyebrow")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-2xl font-extrabold text-slate-900 dark:text-white",
					children: homeText("news_title")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/news",
					className: "text-sm font-semibold text-(--theme-link) hover:underline",
					children: homeText("articles_all")
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-6 md:grid-cols-3",
				children: articles.map((art, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					delay: shouldReduceMotion ? 0 : index * .055,
					className: "h-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: `/news/${art.slug}`,
						className: "group h-full overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-44 overflow-hidden bg-slate-100 dark:bg-slate-800",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectImage, {
								src: art.cover_image,
								alt: art.title_fa,
								className: "h-full w-full object-cover"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-xs text-slate-500 tabular-nums",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: language === "fa" ? art.category_fa : art.category_en }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: art.published_at })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-2 text-base font-bold text-slate-900 group-hover:text-(--theme-primary) dark:text-white",
									children: language === "fa" ? art.title_fa : art.title_en
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-300",
									children: language === "fa" ? art.excerpt_fa : art.excerpt_en
								})
							]
						})]
					})
				}, art.id))
			})]
		}),
		banner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mx-auto mb-16 max-w-7xl px-4 sm:px-6 lg:px-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-12 text-white sm:px-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
					src: banner.image_url,
					alt: banner.title_fa,
					className: "absolute inset-0 h-full w-full object-cover opacity-25"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-2xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-extrabold sm:text-3xl",
							style: { textWrap: "balance" },
							children: language === "fa" ? banner.title_fa : banner.title_en
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2.5 text-sm text-slate-200",
							children: language === "fa" ? banner.subtitle_fa : banner.subtitle_en
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: banner.cta_link,
						style: {
							backgroundColor: "var(--theme-btn-bg)",
							color: "var(--theme-btn-text)"
						},
						className: "inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-lg transition-transform hover:-translate-y-0.5 whitespace-nowrap shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: language === "fa" ? banner.cta_text_fa : banner.cta_text_en }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowIcon, { className: "h-4 w-4" })]
					})]
				})]
			})
		})
	] });
};
export { HomePage };
