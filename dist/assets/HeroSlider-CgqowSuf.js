import { l as require_react, m as __toESM, n as cn, o as useAppStore, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { D as usePrefersReducedMotion, E as ParticleHoverNetwork, _ as EffectAction, et as ChevronRight, ot as Link, t as WaveHeroEffect, tt as ChevronLeft } from "./index-Dacn8Sc3.js";
import { t as ArrowLeft } from "./arrow-left-DZG4IumZ.js";
import { t as ArrowRight } from "./arrow-right-DHz6daHj.js";
import { t as ZeroBrokenImage } from "./ZeroBrokenImage-CvCIOfg-.js";
// src/components/slider/HeroSlider.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var AnimatedHeadline = ({ text, mode, color, active, reducedMotion }) => {
	const [typedCount, setTypedCount] = (0, import_react.useState)(text.length);
	(0, import_react.useEffect)(() => {
		if (!active || mode !== "typewriter" || reducedMotion) {
			setTypedCount(text.length);
			return;
		}
		setTypedCount(0);
		let index = 0;
		const timer = window.setInterval(() => {
			index += 1;
			setTypedCount(index);
			if (index >= text.length) window.clearInterval(timer);
		}, 28);
		return () => window.clearInterval(timer);
	}, [
		active,
		mode,
		reducedMotion,
		text
	]);
	if (mode === "split-text") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		"data-animation": mode,
		style: {
			color,
			textWrap: "balance"
		},
		className: "effect-hero-title flex max-w-3xl flex-wrap gap-x-2.5 gap-y-1 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[54px]",
		children: text.split(" ").map((word, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			style: { animationDelay: `${index * 40}ms` },
			children: word
		}, `${word}-${index}`))
	}, `${text}-${active}`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		"data-animation": mode,
		style: {
			color,
			textWrap: "balance"
		},
		className: "effect-hero-title max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[54px]",
		children: mode === "typewriter" ? text.slice(0, typedCount) : text
	}, `${text}-${active}`);
};
var HeroSlider = ({ slides }) => {
	const language = useAppStore((state) => state.language);
	const shouldReduceMotion = usePrefersReducedMotion();
	const [activeIndex, setActiveIndex] = (0, import_react.useState)(0);
	const [isMobile, setIsMobile] = (0, import_react.useState)(false);
	const [isPaused, setIsPaused] = (0, import_react.useState)(false);
	const activeSlides = (0, import_react.useMemo)(() => slides.filter((slide) => slide.is_active).sort((a, b) => a.sort_order - b.sort_order), [slides]);
	const selectedSlide = activeSlides[activeIndex];
	const ArrowIcon = language === "fa" ? ArrowLeft : ArrowRight;
	(0, import_react.useEffect)(() => {
		const check = () => setIsMobile(window.innerWidth < 768);
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, []);
	(0, import_react.useEffect)(() => {
		if (activeSlides.length < 2 || shouldReduceMotion || isPaused) return;
		const duration = Math.max(3e3, selectedSlide?.duration_ms || 6e3);
		const timer = window.setTimeout(() => setActiveIndex((index) => (index + 1) % activeSlides.length), duration);
		return () => window.clearTimeout(timer);
	}, [
		activeIndex,
		activeSlides,
		isPaused,
		selectedSlide?.duration_ms,
		shouldReduceMotion
	]);
	(0, import_react.useEffect)(() => {
		if (activeIndex >= activeSlides.length) setActiveIndex(0);
	}, [activeIndex, activeSlides.length]);
	if (!activeSlides.length) return null;
	const moveSlide = (direction) => {
		setActiveIndex((index) => (index + direction + activeSlides.length) % activeSlides.length);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative h-135 w-full overflow-hidden bg-slate-950 sm:h-150 lg:h-160",
		"aria-roledescription": "carousel",
		"aria-label": language === "fa" ? "اسلایدر صفحه" : "Page slider",
		onPointerEnter: () => setIsPaused(true),
		onPointerLeave: () => setIsPaused(false),
		onFocusCapture: () => setIsPaused(true),
		onBlurCapture: (event) => {
			if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
		},
		children: [
			activeSlides.map((slide, index) => {
				const active = activeIndex === index;
				const mediaSrc = isMobile && slide.mobile_media ? slide.mobile_media : slide.desktop_media;
				const title = language === "fa" ? slide.title_fa : slide.title_en;
				const subtitle = language === "fa" ? slide.subtitle_fa : slide.subtitle_en;
				const cta = language === "fa" ? slide.cta_text_fa : slide.cta_text_en;
				const alignClass = slide.text_position === "center" ? "items-center text-center mx-auto" : slide.text_position === "left" ? "items-end text-end ms-auto" : "items-start text-start me-auto";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "effect-hero-slide",
					"data-active": active,
					"data-transition": slide.effect,
					"aria-hidden": !active,
					children: [
						slide.media_type === "video" && !isMobile ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							src: mediaSrc,
							autoPlay: active && !shouldReduceMotion,
							muted: true,
							loop: true,
							playsInline: true,
							preload: "metadata",
							"aria-hidden": "true",
							className: "effect-hero-media absolute inset-0 h-full w-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
							src: mediaSrc,
							alt: "",
							loading: index === 0 ? "eager" : "lazy",
							className: "effect-hero-media absolute inset-0 h-full w-full object-cover"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 z-10",
							style: { background: slide.overlay_gradient }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParticleHoverNetwork, {
							enabled: active && slide.particles_enabled && !shouldReduceMotion,
							className: "z-10"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative z-20 mx-auto flex h-full max-w-7xl items-center px-6 sm:px-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("effect-hero-copy flex max-w-3xl flex-col gap-5", alignClass),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedHeadline, {
										text: title,
										mode: slide.text_animation,
										color: slide.text_color,
										active,
										reducedMotion: shouldReduceMotion
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										style: {
											color: slide.text_color,
											animationDelay: "80ms"
										},
										className: "max-w-2xl text-sm leading-relaxed sm:text-base lg:text-lg",
										children: subtitle
									}),
									cta && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(EffectAction, {
										as: Link,
										to: slide.cta_link || "/projects",
										style: { backgroundColor: slide.button_color || "var(--theme-btn-bg)" },
										effects: [
											"shimmer",
											"glow",
											"liquid"
										],
										className: "inline-flex items-center gap-2.5 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 whitespace-nowrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: cta }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowIcon, { className: "h-4 w-4" })]
									})
								]
							})
						})
					]
				}, slide.id);
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-x-0 bottom-0 z-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveHeroEffect, {
					bottomFill: "var(--theme-bg)",
					tintRgb: "255 255 255"
				})
			}),
			activeSlides.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-0 top-1/2 z-30 mx-auto flex max-w-7xl -translate-y-1/2 justify-between px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => moveSlide(-1),
					className: "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-xs transition-colors hover:bg-black/60",
					"aria-label": language === "fa" ? "اسلاید قبل" : "Previous slide",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-5 w-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => moveSlide(1),
					className: "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-xs transition-colors hover:bg-black/60",
					"aria-label": language === "fa" ? "اسلاید بعد" : "Next slide",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-5 w-5" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-0 bottom-5 z-30 flex justify-center gap-2",
				role: "group",
				"aria-label": language === "fa" ? "انتخاب اسلاید" : "Choose slide",
				children: activeSlides.map((slide, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setActiveIndex(index),
					"aria-label": language === "fa" ? `اسلاید ${index + 1}` : `Slide ${index + 1}`,
					"aria-current": activeIndex === index ? "true" : void 0,
					className: cn("h-1.5 rounded-full transition-all duration-300", activeIndex === index ? "w-8 bg-white" : "w-3 bg-white/45 hover:bg-white/75")
				}, slide.id))
			})] })
		]
	});
};
export { HeroSlider };
