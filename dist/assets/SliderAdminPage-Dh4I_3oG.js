import { a as createLucideIcon, l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { t as Plus } from "./plus-DOUCSCbs.js";
import { t as Save } from "./save-CsxfzoRu.js";
import { t as Trash2 } from "./trash-2-uk0pNdI5.js";
import { t as ColorPicker } from "./ColorPicker-BC4bX_Le.js";
import { t as MediaUrlField } from "./MediaUrlField-xcz31gVx.js";
import { k as Modal } from "./index-Dacn8Sc3.js";
import { t as SearchableSelect } from "./SearchableSelect-BCBuOYhg.js";
import { a as object, i as number, o as string, r as boolean, t as _enum } from "./schemas-HxyU5SsU.js";
import { t as ConfirmDialog } from "./ConfirmDialog-5fpwSoSk.js";
import { t as ZeroBrokenImage } from "./ZeroBrokenImage-CvCIOfg-.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var GripVertical = createLucideIcon("grip-vertical", [
	["circle", {
		cx: "9",
		cy: "12",
		r: "1",
		key: "1vctgf"
	}],
	["circle", {
		cx: "9",
		cy: "5",
		r: "1",
		key: "hp0tcf"
	}],
	["circle", {
		cx: "9",
		cy: "19",
		r: "1",
		key: "fkjjf6"
	}],
	["circle", {
		cx: "15",
		cy: "12",
		r: "1",
		key: "1tmaij"
	}],
	["circle", {
		cx: "15",
		cy: "5",
		r: "1",
		key: "19l28e"
	}],
	["circle", {
		cx: "15",
		cy: "19",
		r: "1",
		key: "f4zoj3"
	}]
]);
// src/pages/admin/SliderAdminPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var EFFECTS = [
	{
		value: "ken-burns",
		label: "Ken Burns (زوم نرم سینمایی)"
	},
	{
		value: "fade",
		label: "Fade (محو شدن)"
	},
	{
		value: "slide",
		label: "Slide (اسلاید افقی)"
	},
	{
		value: "zoom-in",
		label: "Zoom In (بزرگنمایی)"
	},
	{
		value: "parallax",
		label: "Parallax (پارالاکس)"
	}
];
var TEXT_ANIMS = [
	{
		value: "fade-up",
		label: "Fade Up"
	},
	{
		value: "split-text",
		label: "Split Text (کلمه‌به‌کلمه)"
	},
	{
		value: "typewriter",
		label: "Typewriter (ماشین تحریر)"
	},
	{
		value: "mask-reveal",
		label: "Mask Reveal"
	}
];
var slideFormSchema = object({
	slider_id: number().int().positive(),
	title_fa: string().trim().min(1, "عنوان فارسی الزامی است.").max(255),
	title_en: string().trim().min(1, "عنوان انگلیسی الزامی است.").max(255),
	subtitle_fa: string().max(500).nullish().transform((value) => value ?? ""),
	subtitle_en: string().max(500).nullish().transform((value) => value ?? ""),
	cta_text_fa: string().max(120).nullish().transform((value) => value ?? ""),
	cta_text_en: string().max(120).nullish().transform((value) => value ?? ""),
	cta_link: string().max(255).nullish().transform((value) => value ?? ""),
	media_type: _enum(["image", "video"]),
	desktop_media: string().trim().min(1, "رسانه دسکتاپ الزامی است.").max(255),
	mobile_media: string().max(255).nullish().transform((value) => value ?? ""),
	text_position: _enum([
		"right",
		"center",
		"left"
	]),
	text_color: string().min(1).max(20),
	button_color: string().min(1).max(20),
	overlay_gradient: string().max(255).nullish().transform((value) => value ?? ""),
	duration_ms: number().int().min(2e3).max(3e4),
	effect: _enum([
		"ken-burns",
		"fade",
		"slide",
		"zoom-in",
		"parallax"
	]),
	text_animation: _enum([
		"fade-up",
		"split-text",
		"typewriter",
		"mask-reveal"
	]),
	particles_enabled: boolean(),
	sort_order: number().int().min(0),
	is_active: boolean()
});
var SliderAdminPage = () => {
	const { fetchBootstrap, addToast } = useAppStore();
	const [sliders, setSliders] = (0, import_react.useState)([]);
	const [selectedSliderId, setSelectedSliderId] = (0, import_react.useState)(null);
	const [creatingSlider, setCreatingSlider] = (0, import_react.useState)(false);
	const [newSlider, setNewSlider] = (0, import_react.useState)({
		key: "",
		title_fa: "",
		title_en: "",
		page_slug: ""
	});
	const [slides, setSlides] = (0, import_react.useState)([]);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [dragIdx, setDragIdx] = (0, import_react.useState)(null);
	const [deleteId, setDeleteId] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	const slider = sliders.find((item) => item.id === selectedSliderId) ?? null;
	(0, import_react.useEffect)(() => {
		apiRequest("/admin/sliders").then((r) => {
			setSliders(r.data);
			setSelectedSliderId((current) => current ?? r.data[0]?.id ?? null);
		}).catch((error) => addToast("error", error instanceof Error ? error.message : "دریافت اسلایدرها ناموفق بود."));
	}, [addToast]);
	(0, import_react.useEffect)(() => {
		setSlides(slider ? [...slider.slides].sort((a, b) => a.sort_order - b.sort_order) : []);
	}, [slider]);
	const createSlider = async (event) => {
		event.preventDefault();
		try {
			const response = await apiRequest("/admin/sliders", {
				method: "POST",
				body: JSON.stringify(newSlider)
			});
			setSliders((current) => [...current, response.data]);
			setSelectedSliderId(response.data.id);
			setCreatingSlider(false);
			setNewSlider({
				key: "",
				title_fa: "",
				title_en: "",
				page_slug: ""
			});
			await fetchBootstrap();
			addToast("success", "اسلایدر صفحه جدید ایجاد شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "ایجاد اسلایدر ناموفق بود.");
		}
	};
	const persistSlides = async (nextSlides, successMessage = "ترتیب و تنظیمات اسلایدر با موفقیت ذخیره شد.") => {
		if (!slider) return;
		await apiRequest(`/admin/sliders/${slider.id}/slides`, {
			method: "PUT",
			body: JSON.stringify({ slides: nextSlides })
		});
		await fetchBootstrap();
		addToast("success", successMessage);
	};
	const handleDrop = async (targetIdx) => {
		if (dragIdx === null || dragIdx === targetIdx) return;
		const copy = [...slides];
		const [moved] = copy.splice(dragIdx, 1);
		copy.splice(targetIdx, 0, moved);
		const reordered = copy.map((s, idx) => ({
			...s,
			sort_order: idx + 1
		}));
		setSlides(reordered);
		setDragIdx(null);
		await persistSlides(reordered);
	};
	const openNewSlide = () => {
		if (!slider) return;
		setEditing({
			id: Date.now(),
			slider_id: slider.id,
			title_fa: "عنوان اسلاید جدید",
			title_en: "New Slide Headline",
			subtitle_fa: "توضیحات اسلاید تجهیزات سرچاهی و درون‌چاهی",
			subtitle_en: "Wellhead & Downhole Engineering",
			cta_text_fa: "مشاهده جزئیات",
			cta_text_en: "Learn More",
			cta_link: "/projects",
			media_type: "image",
			desktop_media: "/storage/hero/hero-banner.jpg",
			mobile_media: "/storage/hero/hero-banner.jpg",
			text_position: "right",
			text_color: "#FFFFFF",
			button_color: "#B91C1C",
			overlay_gradient: "linear-gradient(90deg, rgba(10,15,28,0.88) 0%, rgba(15,23,42,0.4) 100%)",
			duration_ms: 6e3,
			effect: "ken-burns",
			text_animation: "fade-up",
			particles_enabled: false,
			sort_order: slides.length + 1,
			is_active: true
		});
	};
	const saveSlideEdit = async (e) => {
		e.preventDefault();
		if (!editing) return;
		const parsed = slideFormSchema.safeParse(editing);
		if (!parsed.success) {
			addToast("error", parsed.error.issues[0]?.message ?? "اطلاعات اسلاید معتبر نیست.");
			return;
		}
		const validatedSlide = {
			...editing,
			...parsed.data
		};
		const next = slides.some((s) => s.id === editing.id) ? slides.map((s) => s.id === editing.id ? validatedSlide : s) : [...slides, validatedSlide];
		setSlides(next);
		setEditing(null);
		await persistSlides(next);
	};
	const confirmDeleteSlide = async () => {
		if (deleteId === null) return;
		const next = slides.filter((s) => s.id !== deleteId).map((s, idx) => ({
			...s,
			sort_order: idx + 1
		}));
		setDeleting(true);
		try {
			await persistSlides(next, "اسلاید حذف شد.");
			setSlides(next);
			setDeleteId(null);
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "حذف اسلاید ناموفق بود.");
		} finally {
			setDeleting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-extrabold",
					children: "مدیریت اسلایدر صفحات (Drag & Drop + افکت‌ها)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-slate-500",
					children: "اسلایدر را بر اساس صفحه انتخاب کنید؛ ترتیب اسلایدها را با کشیدن کارت‌ها تغییر دهید."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							"aria-label": "انتخاب اسلایدر",
							value: selectedSliderId ?? "",
							onChange: (event) => setSelectedSliderId(Number(event.target.value) || null),
							className: "rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800",
							children: sliders.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: item.id,
								children: [
									item.title_fa,
									" · /",
									item.page_slug
								]
							}, item.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setCreatingSlider((open) => !open),
							className: "rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700",
							children: "اسلایدر صفحه جدید"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: openNewSlide,
							disabled: !slider,
							style: { backgroundColor: "var(--theme-primary)" },
							className: "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white disabled:opacity-50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "افزودن اسلاید" })]
						})
					]
				})]
			}),
			creatingSlider && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: createSlider,
				className: "grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						value: newSlider.title_fa,
						onChange: (event) => setNewSlider({
							...newSlider,
							title_fa: event.target.value
						}),
						placeholder: "عنوان فارسی",
						className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						value: newSlider.title_en,
						onChange: (event) => setNewSlider({
							...newSlider,
							title_en: event.target.value
						}),
						placeholder: "عنوان انگلیسی",
						className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						pattern: "[a-z0-9_-]+",
						value: newSlider.key,
						onChange: (event) => setNewSlider({
							...newSlider,
							key: event.target.value
						}),
						placeholder: "کلید یکتا (مثلاً services)",
						dir: "ltr",
						className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						pattern: "[a-z0-9-]+",
						value: newSlider.page_slug,
						onChange: (event) => setNewSlider({
							...newSlider,
							page_slug: event.target.value
						}),
						placeholder: "مسیر صفحه (مثلاً services)",
						dir: "ltr",
						className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "rounded-lg bg-(--theme-primary) px-4 py-2 text-xs font-semibold text-white sm:col-span-2",
						children: "ایجاد اسلایدر"
					})
				]
			}),
			!slider && !creatingSlider && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl border border-dashed p-6 text-center text-sm text-slate-500",
				children: "برای این بخش هنوز اسلایدری ایجاد نشده است."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: slides.map((slide, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					draggable: true,
					onDragStart: () => setDragIdx(idx),
					onDragOver: (e) => e.preventDefault(),
					onDrop: () => handleDrop(idx),
					className: "flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "h-5 w-5 cursor-grab text-slate-400 shrink-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-900",
								children: slide.media_type === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
									src: slide.desktop_media,
									muted: true,
									className: "h-full w-full object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
									src: slide.desktop_media,
									alt: slide.title_fa,
									className: "h-full w-full object-cover"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-sm font-bold",
									children: slide.title_fa
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 text-xs text-slate-500 tabular-nums",
									children: [
										"افکت: ",
										slide.effect,
										" · ورود متن: ",
										slide.text_animation,
										" · مدت: ",
										slide.duration_ms / 1e3,
										"ثانیه · ",
										slide.is_active ? "فعال" : "غیرفعال"
									]
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setEditing(slide),
							className: "rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800",
							children: "ویرایش افکت و محتوا"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setDeleteId(slide.id),
							className: "rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40",
							"aria-label": "حذف",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
						})]
					})]
				}, slide.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: Boolean(editing),
				onClose: () => setEditing(null),
				title: "ویرایش اسلاید صفحه اول",
				size: "xl",
				children: editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: saveSlideEdit,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "mb-1 block text-xs font-medium",
								children: "عنوان فارسی"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								value: editing.title_fa,
								onChange: (e) => setEditing({
									...editing,
									title_fa: e.target.value
								}),
								className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "mb-1 block text-xs font-medium",
								children: "عنوان انگلیسی"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: editing.title_en,
								onChange: (e) => setEditing({
									...editing,
									title_en: e.target.value
								}),
								dir: "ltr",
								className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mb-1 block text-xs font-medium",
							children: "زیرعنوان فارسی"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							rows: 2,
							value: editing.subtitle_fa,
							onChange: (e) => setEditing({
								...editing,
								subtitle_fa: e.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1 block text-xs font-medium",
									children: "متن دکمه (CTA)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: editing.cta_text_fa,
									onChange: (e) => setEditing({
										...editing,
										cta_text_fa: e.target.value
									}),
									className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1 block text-xs font-medium",
									children: "لینک دکمه"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									dir: "ltr",
									value: editing.cta_link,
									onChange: (e) => setEditing({
										...editing,
										cta_link: e.target.value
									}),
									className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1 block text-xs font-medium",
									children: "مدت نمایش (میلی‌ثانیه)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: 2e3,
									step: 500,
									value: editing.duration_ms,
									onChange: (e) => setEditing({
										...editing,
										duration_ms: Number(e.target.value)
									}),
									className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
									label: "نوع رسانه",
									options: [{
										value: "image",
										label: "تصویر"
									}, {
										value: "video",
										label: "ویدیو MP4/WebM"
									}],
									value: editing.media_type,
									onChange: (v) => setEditing({
										...editing,
										media_type: v
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
									label: "افکت ترنزیشن",
									options: EFFECTS,
									value: editing.effect,
									onChange: (v) => setEditing({
										...editing,
										effect: v
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
									label: "انیمیشن ورود متن",
									options: TEXT_ANIMS,
									value: editing.text_animation,
									onChange: (v) => setEditing({
										...editing,
										text_animation: v
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
									label: "موقعیت متن",
									options: [
										{
											value: "right",
											label: "راست"
										},
										{
											value: "center",
											label: "وسط"
										},
										{
											value: "left",
											label: "چپ"
										}
									],
									value: editing.text_position,
									onChange: (v) => setEditing({
										...editing,
										text_position: v
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaUrlField, {
								label: "رسانه دسکتاپ (تصویر، GIF یا ویدیو)",
								value: editing.desktop_media,
								onChange: (url) => setEditing({
									...editing,
									desktop_media: url
								}),
								folder: "hero",
								accept: ".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm",
								placeholder: "/storage/hero/hero-banner.jpg"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaUrlField, {
								label: "رسانه موبایل",
								value: editing.mobile_media,
								onChange: (url) => setEditing({
									...editing,
									mobile_media: url
								}),
								folder: "hero",
								accept: ".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm",
								placeholder: "/storage/hero/hero-banner.jpg"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPicker, {
								label: "رنگ متن اسلاید",
								value: editing.text_color,
								onChange: (v) => setEditing({
									...editing,
									text_color: v
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPicker, {
								label: "رنگ دکمه CTA",
								value: editing.button_color,
								onChange: (v) => setEditing({
									...editing,
									button_color: v
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-xs font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: editing.particles_enabled,
									onChange: (e) => setEditing({
										...editing,
										particles_enabled: e.target.checked
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "افکت ذرات (Particles) روی اسلاید" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-xs font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: editing.is_active,
									onChange: (e) => setEditing({
										...editing,
										is_active: e.target.checked
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "اسلاید فعال باشد" })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-2 pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setEditing(null),
								className: "rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-700",
								children: "انصراف"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "submit",
								style: { backgroundColor: "var(--theme-primary)" },
								className: "inline-flex items-center gap-1.5 rounded-lg px-5 py-2 text-xs font-semibold text-white",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ذخیره اسلاید" })]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: deleteId !== null,
				onClose: () => setDeleteId(null),
				onConfirm: confirmDeleteSlide,
				message: "حذف این اسلاید از صفحه اول را تأیید می‌کنید؟",
				loading: deleting
			})
		]
	});
};
export { SliderAdminPage };
