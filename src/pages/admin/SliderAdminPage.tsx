import React, { useEffect, useState } from 'react';
import { GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Slide, SlideEffect, Slider, SlideTextAnimation } from '../../types/index.ts';
import { ColorPicker } from '../../components/ui/ColorPicker.tsx';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';

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

export const SliderAdminPage: React.FC = () => {
  const { fetchBootstrap, addToast } = useAppStore();
  const [slider, setSlider] = useState<Slider | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    apiRequest<{ data: Slider[] }>('/admin/sliders')
      .then((r) => {
        const s = r.data[0];
        if (s) {
          setSlider(s);
          setSlides([...s.slides].sort((a, b) => a.sort_order - b.sort_order));
        }
      })
      .catch(() => {});
  }, []);

  const persistSlides = async (nextSlides: Slide[], successMessage = 'ترتیب و تنظیمات اسلایدر با موفقیت ذخیره شد.') => {
    if (!slider) return;
    await apiRequest(`/admin/sliders/${slider.id}/slides`, {
      method: 'PUT',
      body: JSON.stringify({ slides: nextSlides }),
    });
    await fetchBootstrap();
    addToast('success', successMessage);
  };

  const handleDrop = async (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const copy = [...slides];
    const [moved] = copy.splice(dragIdx, 1);
    copy.splice(targetIdx, 0, moved);
    const reordered = copy.map((s, idx) => ({ ...s, sort_order: idx + 1 }));
    setSlides(reordered);
    setDragIdx(null);
    await persistSlides(reordered);
  };

  const openNewSlide = () => {
    if (!slider) return;
    setEditing({
      id: Date.now(),
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
    const exists = slides.some((s) => s.id === editing.id);
    const next = exists
      ? slides.map((s) => (s.id === editing.id ? editing : s))
      : [...slides, editing];
    setSlides(next);
    setEditing(null);
    await persistSlides(next);
  };

  const confirmDeleteSlide = async () => {
    if (deleteId === null) return;

    const next = slides.filter((s) => s.id !== deleteId).map((s, idx) => ({ ...s, sort_order: idx + 1 }));
    setDeleting(true);
    try {
      await persistSlides(next, 'اسلاید حذف شد.');
      setSlides(next);
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
          <h1 className="text-lg font-extrabold">مدیریت اسلایدر صفحه اول (Drag & Drop + افکت‌ها)</h1>
          <p className="mt-1 text-xs text-slate-500">
            برای تغییر ترتیب، کارت هر اسلاید را بکشید و رها کنید. پشتیبانی از تصویر و ویدیو MP4 برای دسکتاپ و موبایل.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewSlide}
          style={{ backgroundColor: 'var(--theme-primary)' }}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          <span>افزودن اسلاید جدید</span>
        </button>
      </div>

      <div className="space-y-3">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(idx)}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-[var(--theme-primary)] dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3 min-w-0">
              <GripVertical className="h-5 w-5 cursor-grab text-slate-400 shrink-0" />
              <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-900">
                {slide.media_type === 'video' ? (
                  <video src={slide.desktop_media} muted className="h-full w-full object-cover" />
                ) : (
                  <img src={slide.desktop_media} alt={slide.title_fa} className="h-full w-full object-cover" />
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

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="ویرایش اسلاید صفحه اول" size="xl">
        {editing && (
          <form onSubmit={saveSlideEdit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">عنوان فارسی</label>
                <input required value={editing.title_fa} onChange={(e) => setEditing({ ...editing, title_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">عنوان انگلیسی</label>
                <input value={editing.title_en} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} dir="ltr" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">زیرعنوان فارسی</label>
              <textarea rows={2} value={editing.subtitle_fa} onChange={(e) => setEditing({ ...editing, subtitle_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium">متن دکمه (CTA)</label>
                <input value={editing.cta_text_fa} onChange={(e) => setEditing({ ...editing, cta_text_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">لینک دکمه</label>
                <input dir="ltr" value={editing.cta_link} onChange={(e) => setEditing({ ...editing, cta_link: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">مدت نمایش (میلی‌ثانیه)</label>
                <input type="number" min={2000} step={500} value={editing.duration_ms} onChange={(e) => setEditing({ ...editing, duration_ms: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
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
              <div>
                <label className="mb-1 block text-xs font-medium">آدرس رسانه دسکتاپ</label>
                <input dir="ltr" value={editing.desktop_media} onChange={(e) => setEditing({ ...editing, desktop_media: e.target.value })} className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
                <FileUploader folder="hero" label="آپلود تصویر یا ویدیو دسکتاپ" onUploaded={(url) => setEditing({ ...editing, desktop_media: url })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">آدرس تصویر موبایل</label>
                <input dir="ltr" value={editing.mobile_media} onChange={(e) => setEditing({ ...editing, mobile_media: e.target.value })} className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
                <FileUploader folder="hero" label="آپلود تصویر موبایل" onUploaded={(url) => setEditing({ ...editing, mobile_media: url })} />
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
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-700">انصراف</button>
              <button type="submit" style={{ backgroundColor: 'var(--theme-primary)' }} className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2 text-xs font-semibold text-white">
                <Save className="h-4 w-4" />
                <span>ذخیره اسلاید</span>
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
