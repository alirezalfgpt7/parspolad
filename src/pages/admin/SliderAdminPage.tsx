import React, { useEffect, useState } from 'react';
import { GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Slide, SlideEffect, Slider, SlideTextAnimation } from '../../types/index.ts';
import { ColorPicker } from '../../components/ui/ColorPicker.tsx';
import { MediaUrlField } from '../../components/ui/MediaUrlField.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';
import { isVideoMediaUrl } from '../../utils/brandingDefaults.ts';

const EFFECTS: Array<{ value: SlideEffect; label: string }> = [
  { value: 'ken-burns', label: 'Ken Burns (زوم نرم سینمایی)' },
  { value: 'fade', label: 'Fade (محو شدن)' },
  { value: 'slide', label: 'Slide (اسلاید افقی)' },
  { value: 'zoom-in', label: 'Zoom In (بزرگنمایی)' },
  { value: 'parallax', label: 'Parallax (پارالاکس)' },
];

const TEXT_ANIMS: Array<{ value: SlideTextAnimation; label: string }> = [
  { value: 'fade-up', label: 'Fade Up' },
  { value: 'split-text', label: 'Split Text (کلمه‌به‌کلمه)' },
  { value: 'typewriter', label: 'Typewriter (ماشین تحریر)' },
  { value: 'mask-reveal', label: 'Mask Reveal' },
];

const CTA_DESTINATIONS = [
  { value: '/', label: 'صفحه اصلی' },
  { value: '/about', label: 'درباره ما' },
  { value: '/services', label: 'خدمات' },
  { value: '/products', label: 'محصولات' },
  { value: '/projects', label: 'پروژه‌ها' },
  { value: '/contracts-licenses', label: 'قراردادها و گواهینامه‌ها' },
  { value: '/org-chart', label: 'ساختار سازمانی' },
  { value: '/news', label: 'اخبار و مقالات' },
  { value: '/contact', label: 'تماس با ما' },
  { value: '/rfq', label: 'درخواست همکاری' },
  { value: '/faq', label: 'سوالات متداول' },
  { value: '/legal', label: 'قوانین' },
  { value: '/sitemap', label: 'نقشه سایت' },
] as const;

const OVERLAY_PRESETS = [
  {
    label: 'تیره از سمت چپ',
    value: 'linear-gradient(90deg, rgba(10,15,28,0.88) 0%, rgba(15,23,42,0.4) 100%)',
  },
  {
    label: 'تیره از پایین',
    value: 'linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.82) 100%)',
  },
  {
    label: 'تیره ملایم',
    value: 'linear-gradient(90deg, rgba(10,15,28,0.55) 0%, rgba(15,23,42,0.18) 100%)',
  },
] as const;

const slideFormSchema = z.object({
  slider_id: z.number().int().positive(),
  title_fa: z.string().trim().min(1, 'عنوان فارسی الزامی است.').max(255),
  title_en: z.string().trim().min(1, 'عنوان انگلیسی الزامی است.').max(255),
  subtitle_fa: z.string().max(500).nullish().transform((value) => value ?? ''),
  subtitle_en: z.string().max(500).nullish().transform((value) => value ?? ''),
  cta_text_fa: z.string().max(120).nullish().transform((value) => value ?? ''),
  cta_text_en: z.string().max(120).nullish().transform((value) => value ?? ''),
  cta_link: z.string().max(255).nullish().transform((value) => value ?? ''),
  media_type: z.enum(['image', 'video']),
  desktop_media: z.string().trim().min(1, 'رسانه دسکتاپ الزامی است.').max(255),
  mobile_media: z.string().max(255).nullish().transform((value) => value ?? ''),
  text_position: z.enum(['right', 'center', 'left']),
  text_color: z.string().min(1).max(20),
  button_color: z.string().min(1).max(20),
  overlay_gradient: z.string().max(255).nullish().transform((value) => value ?? ''),
  duration_ms: z.number().int().min(3000).max(30000),
  effect: z.enum(['ken-burns', 'fade', 'slide', 'zoom-in', 'parallax']),
  text_animation: z.enum(['fade-up', 'split-text', 'typewriter', 'mask-reveal']),
  particles_enabled: z.boolean(),
  sort_order: z.number().int().min(0),
  is_active: z.boolean(),
}).superRefine((slide, context) => {
  const desktopIsVideo = isVideoMediaUrl(slide.desktop_media);
  if ((slide.media_type === 'video') !== desktopIsVideo) {
    context.addIssue({
      code: 'custom',
      path: ['desktop_media'],
      message: slide.media_type === 'video'
        ? 'برای نوع ویدیو، فایل دسکتاپ باید MP4 یا WebM باشد.'
        : 'فایل دسکتاپ ویدیویی است؛ نوع رسانه را روی ویدیو بگذارید.',
    });
  }

  if ((slide.cta_text_fa.trim() || slide.cta_text_en.trim()) && !slide.cta_link.trim()) {
    context.addIssue({
      code: 'custom',
      path: ['cta_link'],
      message: 'برای نمایش دکمه، مقصد آن را انتخاب یا وارد کنید.',
    });
  }

  if (slide.cta_link && (!slide.cta_link.startsWith('/') || slide.cta_link.startsWith('//'))) {
    context.addIssue({
      code: 'custom',
      path: ['cta_link'],
      message: 'مسیر داخلی باید با / شروع شود؛ برای مقصدهای رایج از فهرست استفاده کنید.',
    });
  }
});

export const SliderAdminPage: React.FC = () => {
  const { fetchBootstrap, addToast } = useAppStore();
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [selectedSliderId, setSelectedSliderId] = useState<number | null>(null);
  const [creatingSlider, setCreatingSlider] = useState(false);
  const [newSlider, setNewSlider] = useState({ key: '', title_fa: '', title_en: '', page_slug: '' });
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [savingSlide, setSavingSlide] = useState(false);
  const slider = sliders.find((item) => item.id === selectedSliderId) ?? null;

  useEffect(() => {
    apiRequest<{ data: Slider[] }>('/admin/sliders')
      .then((r) => {
        setSliders(r.data);
        setSelectedSliderId((current) => current ?? r.data[0]?.id ?? null);
      })
      .catch((error: unknown) => addToast('error', error instanceof Error ? error.message : 'دریافت اسلایدرها ناموفق بود.'));
  }, [addToast]);

  useEffect(() => {
    setSlides(slider ? [...slider.slides].sort((a, b) => a.sort_order - b.sort_order) : []);
  }, [slider]);

  const createSlider = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await apiRequest<{ data: Slider }>('/admin/sliders', {
        method: 'POST',
        body: JSON.stringify(newSlider),
      });
      setSliders((current) => [...current, response.data]);
      setSelectedSliderId(response.data.id);
      setCreatingSlider(false);
      setNewSlider({ key: '', title_fa: '', title_en: '', page_slug: '' });
      await fetchBootstrap();
      addToast('success', 'اسلایدر صفحه جدید ایجاد شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ایجاد اسلایدر ناموفق بود.');
    }
  };

  const persistSlides = async (nextSlides: Slide[], successMessage = 'ترتیب و تنظیمات اسلایدر با موفقیت ذخیره شد.') => {
    if (!slider) return;
    const slidesToSave = nextSlides.map(({ id, ...slide }) => ({
      ...slide,
      ...(id > 0 ? { id } : {}),
    }));
    const response = await apiRequest<{ data: Slider }>(`/admin/sliders/${slider.id}/slides`, {
      method: 'PUT',
      body: JSON.stringify({ slides: slidesToSave }),
    });
    const savedSlides = [...response.data.slides].sort((a, b) => a.sort_order - b.sort_order);
    setSlides(savedSlides);
    setSliders((current) => current.map((item) => item.id === response.data.id ? response.data : item));
    await fetchBootstrap();
    addToast('success', successMessage);
  };

  const handleDrop = async (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const copy = [...slides];
    const [moved] = copy.splice(dragIdx, 1);
    copy.splice(targetIdx, 0, moved);
    const reordered = copy.map((s, idx) => ({ ...s, sort_order: idx + 1 }));
    setDragIdx(null);
    try {
      await persistSlides(reordered);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره ترتیب اسلایدها ناموفق بود.');
    }
  };

  const openNewSlide = () => {
    if (!slider) return;
    setEditing({
      id: -Date.now(),
      slider_id: slider.id,
      title_fa: 'عنوان اسلاید جدید',
      title_en: 'New Slide Headline',
      subtitle_fa: 'توضیحات اسلاید تجهیزات سرچاهی و درون‌چاهی',
      subtitle_en: 'Wellhead & Downhole Engineering',
      cta_text_fa: 'مشاهده جزئیات',
      cta_text_en: 'Learn More',
      cta_link: '/projects',
      media_type: 'image',
      desktop_media: '/storage/hero/hero-banner.jpg',
      mobile_media: '/storage/hero/hero-banner.jpg',
      text_position: 'right',
      text_color: '#FFFFFF',
      button_color: '#B91C1C',
      overlay_gradient: 'linear-gradient(90deg, rgba(10,15,28,0.88) 0%, rgba(15,23,42,0.4) 100%)',
      duration_ms: 6000,
      effect: 'ken-burns',
      text_animation: 'fade-up',
      particles_enabled: false,
      sort_order: slides.length + 1,
      is_active: true,
    });
  };

  const saveSlideEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const parsed = slideFormSchema.safeParse(editing);
    if (!parsed.success) {
      addToast('error', parsed.error.issues[0]?.message ?? 'اطلاعات اسلاید معتبر نیست.');
      return;
    }
    const validatedSlide = { ...editing, ...parsed.data };
    const exists = slides.some((s) => s.id === editing.id);
    const next = exists
      ? slides.map((s) => (s.id === editing.id ? validatedSlide : s))
      : [...slides, validatedSlide];
    setSavingSlide(true);
    try {
      await persistSlides(next);
      setEditing(null);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره اسلاید ناموفق بود.');
    } finally {
      setSavingSlide(false);
    }
  };

  const confirmDeleteSlide = async () => {
    if (deleteId === null) return;

    const next = slides.filter((s) => s.id !== deleteId).map((s, idx) => ({ ...s, sort_order: idx + 1 }));
    setDeleting(true);
    try {
      await persistSlides(next, 'اسلاید حذف شد.');
      setDeleteId(null);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف اسلاید ناموفق بود.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-lg font-extrabold">مدیریت اسلایدر صفحات (Drag & Drop + افکت‌ها)</h1>
          <p className="mt-1 text-xs text-slate-500">
            اسلایدر را بر اساس صفحه انتخاب کنید؛ ترتیب اسلایدها را با کشیدن کارت‌ها تغییر دهید.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="انتخاب اسلایدر"
            value={selectedSliderId ?? ''}
            onChange={(event) => setSelectedSliderId(Number(event.target.value) || null)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
          >
            {sliders.map((item) => (
              <option key={item.id} value={item.id}>{item.title_fa} · /{item.page_slug}</option>
            ))}
          </select>
          <button type="button" onClick={() => setCreatingSlider((open) => !open)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700">
            اسلایدر صفحه جدید
          </button>
          <button
            type="button"
            onClick={openNewSlide}
            disabled={!slider}
            style={{ backgroundColor: 'var(--theme-primary)' }}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>افزودن اسلاید</span>
          </button>
        </div>
      </div>

      {creatingSlider && (
        <form onSubmit={createSlider} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
          <input required value={newSlider.title_fa} onChange={(event) => setNewSlider({ ...newSlider, title_fa: event.target.value })} placeholder="عنوان فارسی" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <input required value={newSlider.title_en} onChange={(event) => setNewSlider({ ...newSlider, title_en: event.target.value })} placeholder="عنوان انگلیسی" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <input required pattern="[a-z0-9_-]+" value={newSlider.key} onChange={(event) => setNewSlider({ ...newSlider, key: event.target.value })} placeholder="کلید یکتا (مثلاً services)" dir="ltr" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <input required pattern="[a-z0-9-]+" value={newSlider.page_slug} onChange={(event) => setNewSlider({ ...newSlider, page_slug: event.target.value })} placeholder="مسیر صفحه (مثلاً services)" dir="ltr" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <button type="submit" className="rounded-lg bg-(--theme-primary) px-4 py-2 text-xs font-semibold text-white sm:col-span-2">ایجاد اسلایدر</button>
        </form>
      )}

      {!slider && !creatingSlider && <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">برای این بخش هنوز اسلایدری ایجاد نشده است.</p>}

      <div className="space-y-3">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(idx)}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-(--theme-primary) dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3 min-w-0">
              <GripVertical className="h-5 w-5 cursor-grab text-slate-400 shrink-0" />
              <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-900">
                {slide.media_type === 'video' ? (
                  <video src={slide.desktop_media} muted className="h-full w-full object-cover" />
                ) : (
                  <ZeroBrokenImage src={slide.desktop_media} alt={slide.title_fa} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{slide.title_fa}</div>
                <div className="mt-1 text-xs text-slate-500 tabular-nums">
                  افکت: {slide.effect} · ورود متن: {slide.text_animation} · مدت: {slide.duration_ms / 1000}ثانیه · {slide.is_active ? 'فعال' : 'غیرفعال'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditing(slide)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                ویرایش افکت و محتوا
              </button>
              <button
                type="button"
                onClick={() => setDeleteId(slide.id)}
                className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
                aria-label="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => {
          if (!savingSlide) setEditing(null);
        }}
        title={editing && editing.id < 0 ? 'افزودن اسلاید' : 'ویرایش اسلاید'}
        size="xl"
      >
        {editing && (
          <form onSubmit={saveSlideEdit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">عنوان فارسی</label>
                <input required value={editing.title_fa} onChange={(e) => setEditing({ ...editing, title_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">عنوان انگلیسی</label>
                <input required value={editing.title_en} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} dir="ltr" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">زیرعنوان فارسی</label>
                <textarea rows={2} value={editing.subtitle_fa} onChange={(e) => setEditing({ ...editing, subtitle_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">زیرعنوان انگلیسی</label>
                <textarea rows={2} value={editing.subtitle_en} onChange={(e) => setEditing({ ...editing, subtitle_en: e.target.value })} dir="ltr" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">متن دکمه فارسی</label>
                <input value={editing.cta_text_fa} onChange={(e) => setEditing({ ...editing, cta_text_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">متن دکمه انگلیسی</label>
                <input dir="ltr" value={editing.cta_text_en} onChange={(e) => setEditing({ ...editing, cta_text_en: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">مقصد پیشنهادی دکمه</label>
                <select
                  value={CTA_DESTINATIONS.some((route) => route.value === editing.cta_link) ? editing.cta_link : ''}
                  onChange={(event) => setEditing({ ...editing, cta_link: event.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="">انتخاب از مسیرهای آماده</option>
                  {CTA_DESTINATIONS.map((route) => (
                    <option key={route.value} value={route.value}>{route.label} — {route.value}</option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">برای مثال، «پروژه‌ها» مسیر /projects را تنظیم می‌کند.</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">مسیر داخلی سفارشی</label>
                <input dir="ltr" value={editing.cta_link} onChange={(e) => setEditing({ ...editing, cta_link: e.target.value })} placeholder="/projects/example" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                <p className="mt-1 text-[11px] text-slate-500">مسیر باید با / شروع شود. اگر متن دکمه خالی باشد، دکمه نمایش داده نمی‌شود.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">مدت نمایش (میلی‌ثانیه)</label>
                <input type="number" min={3000} max={30000} step={500} value={editing.duration_ms} onChange={(e) => setEditing({ ...editing, duration_ms: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                <p className="mt-1 text-[11px] text-slate-500">
                  معادل {(editing.duration_ms / 1000).toLocaleString('fa-IR', { maximumFractionDigits: 2 })} ثانیه؛ حد مجاز ۳ تا ۳۰ ثانیه است.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <SearchableSelect
                label="نوع رسانه"
                options={[{ value: 'image', label: 'تصویر' }, { value: 'video', label: 'ویدیو MP4/WebM' }]}
                value={editing.media_type}
                onChange={(v) => setEditing({ ...editing, media_type: v as 'image' | 'video' })}
              />
              <SearchableSelect
                label="افکت ترنزیشن"
                options={EFFECTS}
                value={editing.effect}
                onChange={(v) => setEditing({ ...editing, effect: v as SlideEffect })}
              />
              <SearchableSelect
                label="انیمیشن ورود متن"
                options={TEXT_ANIMS}
                value={editing.text_animation}
                onChange={(v) => setEditing({ ...editing, text_animation: v as SlideTextAnimation })}
              />
              <SearchableSelect
                label="موقعیت متن"
                options={[{ value: 'right', label: 'راست' }, { value: 'center', label: 'وسط' }, { value: 'left', label: 'چپ' }]}
                value={editing.text_position}
                onChange={(v) => setEditing({ ...editing, text_position: v as 'right' | 'center' | 'left' })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <MediaUrlField
                label="رسانه دسکتاپ (منبع اصلی)"
                value={editing.desktop_media}
                onChange={(url) => setEditing({ ...editing, desktop_media: url })}
                folder="hero"
                accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm"
                placeholder="/storage/hero/hero-banner.jpg"
                hint="نوع فایل دسکتاپ باید با «نوع رسانه» هماهنگ باشد. فایل ویدیویی روی دسکتاپ با دکمه پخش اجرا می‌شود."
              />
              <MediaUrlField
                label="رسانه جایگزین موبایل"
                value={editing.mobile_media}
                onChange={(url) => setEditing({ ...editing, mobile_media: url })}
                folder="hero"
                accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm"
                placeholder="/storage/hero/hero-banner.jpg"
                hint="فقط در نمایشگرهای موبایل استفاده می‌شود؛ اگر خالی باشد، رسانه دسکتاپ به‌کار می‌رود."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">پوشش رنگی روی تصویر (Overlay)</label>
                <select
                  value={OVERLAY_PRESETS.some((preset) => preset.value === editing.overlay_gradient) ? editing.overlay_gradient : ''}
                  onChange={(event) => {
                    if (event.target.value) setEditing({ ...editing, overlay_gradient: event.target.value });
                  }}
                  className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="">گرادیان سفارشی</option>
                  {OVERLAY_PRESETS.map((preset) => (
                    <option key={preset.value} value={preset.value}>{preset.label}</option>
                  ))}
                </select>
                <textarea rows={2} value={editing.overlay_gradient} onChange={(event) => setEditing({ ...editing, overlay_gradient: event.target.value })} dir="ltr" aria-label="CSS گرادیان پوشش اسلاید" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ColorPicker label="رنگ متن اسلاید" value={editing.text_color} onChange={(v) => setEditing({ ...editing, text_color: v })} />
              <ColorPicker label="رنگ دکمه CTA" value={editing.button_color} onChange={(v) => setEditing({ ...editing, button_color: v })} />
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-xs font-medium">
                <input type="checkbox" checked={editing.particles_enabled} onChange={(e) => setEditing({ ...editing, particles_enabled: e.target.checked })} />
                <span>افکت ذرات (Particles) روی اسلاید</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium">
                <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                <span>اسلاید فعال باشد</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} disabled={savingSlide} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold disabled:opacity-50 dark:border-slate-700">انصراف</button>
              <button type="submit" disabled={savingSlide} style={{ backgroundColor: 'var(--theme-primary)' }} className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2 text-xs font-semibold text-white disabled:opacity-50">
                <Save className="h-4 w-4" />
                <span>{savingSlide ? 'در حال ذخیره...' : 'ذخیره اسلاید'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDeleteSlide}
        message="حذف این اسلاید از صفحه اول را تأیید می‌کنید؟"
        loading={deleting}
      />
    </div>
  );
};
