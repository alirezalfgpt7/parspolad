import React, { useEffect, useRef, useState } from 'react';
import { Check, Images, LoaderCircle, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { MediaThumbnail } from '../../components/admin/MediaThumbnail.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { MediaFile, PhotoAlbum, PhotoAlbumMedia } from '../../types/index.ts';

interface AlbumForm {
  title_fa: string;
  title_en: string;
  slug: string;
  description_fa: string;
  description_en: string;
  cover_media_id: number | null;
  layout: PhotoAlbum['layout'];
  columns: number;
  rows: number;
  transition: PhotoAlbum['transition'];
  interval_ms: number;
  image_effect: PhotoAlbum['image_effect'];
  card_effect: PhotoAlbum['card_effect'];
  sort_order: number;
  is_active: boolean;
}

interface AlbumListResponse {
  data: PhotoAlbum[];
  meta: { current_page: number; last_page: number; total: number };
}

interface MediaListResponse {
  data: MediaFile[];
  meta: { last_page: number; total: number };
}

const emptyForm = (): AlbumForm => ({
  title_fa: '',
  title_en: '',
  slug: '',
  description_fa: '',
  description_en: '',
  cover_media_id: null,
  layout: 'grid',
  columns: 3,
  rows: 2,
  transition: 'fade',
  interval_ms: 5000,
  image_effect: 'zoom',
  card_effect: 'lift',
  sort_order: 0,
  is_active: true,
});

const toAlbumMedia = (media: MediaFile | PhotoAlbumMedia): PhotoAlbumMedia => ({
  id: media.id,
  name: media.name,
  url: media.url,
  alt_text: media.alt_text,
  description: media.description,
});

const createSlug = (value: string): string => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 100);

const fieldClass = 'w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2.5 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)';

export const PhotoAlbumsAdminPage: React.FC = () => {
  const { addToast } = useAppStore();
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [albumPage, setAlbumPage] = useState(1);
  const [albumLastPage, setAlbumLastPage] = useState(1);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loadingAlbum, setLoadingAlbum] = useState(false);
  const [form, setForm] = useState<AlbumForm>(emptyForm);
  const [selectedMedia, setSelectedMedia] = useState<PhotoAlbumMedia[]>([]);
  const [images, setImages] = useState<MediaFile[]>([]);
  const [mediaPage, setMediaPage] = useState(1);
  const [mediaLastPage, setMediaLastPage] = useState(1);
  const [mediaTotal, setMediaTotal] = useState(0);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [deleteAlbum, setDeleteAlbum] = useState<PhotoAlbum | null>(null);
  const [deleting, setDeleting] = useState(false);
  const requestSequence = useRef(0);

  const loadAlbums = async (targetPage = albumPage) => {
    setAlbumsLoading(true);
    try {
      const response = await apiRequest<AlbumListResponse>(`/admin/albums?per_page=20&page=${targetPage}`);
      if (targetPage > response.meta.last_page) {
        setAlbumPage(Math.max(1, response.meta.last_page));
        return;
      }
      setAlbums(response.data);
      setAlbumLastPage(response.meta.last_page);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'بارگذاری آلبوم‌ها ناموفق بود.');
    } finally {
      setAlbumsLoading(false);
    }
  };

  useEffect(() => {
    void loadAlbums(albumPage);
  }, [albumPage]);

  useEffect(() => {
    if (!formOpen) return;
    const sequence = ++requestSequence.current;
    setMediaLoading(true);
    apiRequest<MediaListResponse>(
      `/admin/media?type=images&optimizable=1&source_only=1&public_only=1&sort=newest&page=${mediaPage}&per_page=18`,
    )
      .then((response) => {
        if (sequence !== requestSequence.current) return;
        setImages(response.data);
        setMediaLastPage(response.meta.last_page);
        setMediaTotal(response.meta.total);
      })
      .catch((error: unknown) => {
        if (sequence === requestSequence.current) {
          addToast('error', error instanceof Error ? error.message : 'بارگذاری تصاویر کتابخانه ناموفق بود.');
        }
      })
      .finally(() => {
        if (sequence === requestSequence.current) setMediaLoading(false);
      });
  }, [addToast, formOpen, mediaPage]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setSelectedMedia([]);
    setMediaPage(1);
    setSlugEdited(false);
    setFormOpen(true);
  };

  const openEdit = async (albumId: number) => {
    setLoadingAlbum(true);
    try {
      const response = await apiRequest<{ data: PhotoAlbum }>(`/admin/albums/${albumId}`);
      const album = response.data;
      setEditingId(album.id);
      setForm({
        title_fa: album.title_fa,
        title_en: album.title_en,
        slug: album.slug,
        description_fa: album.description_fa || '',
        description_en: album.description_en || '',
        cover_media_id: album.cover_media_id,
        layout: album.layout,
        columns: album.columns,
        rows: album.rows,
        transition: album.transition,
        interval_ms: album.interval_ms,
        image_effect: album.image_effect,
        card_effect: album.card_effect,
        sort_order: album.sort_order,
        is_active: album.is_active,
      });
      setSelectedMedia(album.media.map(toAlbumMedia));
      setMediaPage(1);
      setSlugEdited(true);
      setFormOpen(true);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'دریافت اطلاعات آلبوم ناموفق بود.');
    } finally {
      setLoadingAlbum(false);
    }
  };

  const updateForm = <K extends keyof AlbumForm>(key: K, value: AlbumForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleMedia = (media: MediaFile) => {
    setSelectedMedia((current) => {
      const exists = current.some((item) => item.id === media.id);
      if (exists) {
        const next = current.filter((item) => item.id !== media.id);
        if (form.cover_media_id === media.id) {
          setForm((previous) => ({ ...previous, cover_media_id: next[0]?.id ?? null }));
        }
        return next;
      }
      if (current.length >= 60) {
        addToast('info', 'هر آلبوم حداکثر می‌تواند ۶۰ تصویر داشته باشد.');
        return current;
      }
      const next = [...current, toAlbumMedia(media)];
      if (!form.cover_media_id) {
        setForm((previous) => ({ ...previous, cover_media_id: media.id }));
      }
      return next;
    });
  };

  const removeSelected = (mediaId: number) => {
    setSelectedMedia((current) => {
      const next = current.filter((item) => item.id !== mediaId);
      if (form.cover_media_id === mediaId) {
        setForm((previous) => ({ ...previous, cover_media_id: next[0]?.id ?? null }));
      }
      return next;
    });
  };

  const saveAlbum = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMedia.length) {
      addToast('error', 'حداقل یک تصویر از کتابخانه برای آلبوم انتخاب کنید.');
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      cover_media_id: form.cover_media_id || selectedMedia[0].id,
      media_ids: selectedMedia.map((media) => media.id),
    };
    try {
      await apiRequest(editingId ? `/admin/albums/${editingId}` : '/admin/albums', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      setFormOpen(false);
      await loadAlbums();
      addToast('success', editingId ? 'تنظیمات آلبوم ذخیره شد.' : 'آلبوم تصاویر ساخته شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره آلبوم ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteAlbum) return;
    setDeleting(true);
    try {
      await apiRequest(`/admin/albums/${deleteAlbum.id}`, { method: 'DELETE' });
      setDeleteAlbum(null);
      await loadAlbums();
      addToast('success', 'آلبوم حذف شد؛ فایل‌های کتابخانه دست‌نخورده باقی ماندند.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف آلبوم ناموفق بود.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Images}
        eyebrow="Photo gallery"
        title="مدیریت آلبوم تصاویر"
        description="آلبوم‌های عمومی را با تصاویر کتابخانه بسازید و چیدمان، تعداد ردیف و ستون و افکت نمایش آن‌ها را تنظیم کنید."
        actions={(
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-(--theme-btn-bg) px-4 py-2.5 text-sm font-bold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover)"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            آلبوم جدید
          </button>
        )}
      />

      {albumsLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-(--theme-card-border) p-12 text-sm text-(--theme-text-muted)">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          در حال دریافت آلبوم‌ها...
        </div>
      ) : albums.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {albums.map((album) => (
            <article key={album.id} className="overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) shadow-(--theme-card-shadow)">
              <div className="flex gap-4 p-4">
                <div className="h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-(--theme-surface-muted)">
                  {album.cover_media_id ? (
                    <MediaThumbnail mediaId={album.cover_media_id} alt={album.title_fa} isVideo={false} originalUrl={album.cover_url || undefined} />
                  ) : <Images className="m-auto h-8 w-8 text-(--theme-text-muted)" aria-hidden="true" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="truncate text-sm font-black text-(--theme-text)">{album.title_fa}</h2>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${album.is_active ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-(--theme-surface-muted) text-(--theme-text-muted)'}`}>
                      {album.is_active ? 'منتشرشده' : 'پیش‌نویس'}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-(--theme-text-muted)" dir="ltr">/albums/{album.slug}</p>
                  <p className="mt-2 text-xs text-(--theme-text-muted)">
                    {(album.media_count ?? album.media.length).toLocaleString('fa-IR')} تصویر · {album.layout}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-(--theme-border) px-4 py-3">
                <a href={`/albums/${album.slug}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-(--theme-link) hover:underline">
                  مشاهدهٔ صفحه
                </a>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void openEdit(album.id)}
                    disabled={loadingAlbum}
                    className="inline-flex items-center gap-1 rounded-lg border border-(--theme-border) px-2.5 py-1.5 text-xs font-semibold text-(--theme-text) hover:bg-(--theme-surface-muted) disabled:opacity-50"
                  >
                    {loadingAlbum ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
                    ویرایش
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteAlbum(album)}
                    className="rounded-lg p-1.5 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    aria-label={`حذف آلبوم ${album.title_fa}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-(--theme-border-strong) bg-(--theme-card-surface) p-12 text-center">
          <Images className="mx-auto h-10 w-10 text-(--theme-text-muted)" aria-hidden="true" />
          <h2 className="mt-3 text-base font-bold text-(--theme-text)">هنوز آلبومی ساخته نشده است</h2>
          <p className="mt-1 text-sm text-(--theme-text-muted)">برای شروع، تصاویر عمومی کتابخانه را در یک آلبوم مرتب کنید.</p>
        </div>
      )}
      {!albumsLoading && albums.length > 0 && (
        <Pagination page={albumPage} lastPage={albumLastPage} onChange={setAlbumPage} />
      )}

      <Modal
        open={formOpen}
        onClose={() => {
          if (!saving) setFormOpen(false);
        }}
        title={editingId ? 'ویرایش آلبوم تصاویر' : 'ساخت آلبوم تصاویر'}
        size="xl"
      >
        <form onSubmit={saveAlbum} className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
              <span>عنوان فارسی</span>
              <input required maxLength={160} value={form.title_fa} onChange={(event) => updateForm('title_fa', event.target.value)} className={fieldClass} />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
              <span>عنوان انگلیسی</span>
              <input
                required
                maxLength={160}
                value={form.title_en}
                onChange={(event) => {
                  updateForm('title_en', event.target.value);
                  if (!slugEdited) updateForm('slug', createSlug(event.target.value));
                }}
                className={fieldClass}
              />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
              <span>آدرس کوتاه صفحه</span>
              <input
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                maxLength={100}
                dir="ltr"
                value={form.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  updateForm('slug', createSlug(event.target.value));
                }}
                className={`${fieldClass} font-mono`}
              />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
              <span>ترتیب نمایش</span>
              <input type="number" min={0} max={100000} value={form.sort_order} onChange={(event) => updateForm('sort_order', Number(event.target.value))} className={fieldClass} />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-(--theme-text) md:col-span-2">
              <span>توضیحات فارسی</span>
              <textarea rows={2} maxLength={2000} value={form.description_fa} onChange={(event) => updateForm('description_fa', event.target.value)} className={fieldClass} />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-(--theme-text) md:col-span-2">
              <span>توضیحات انگلیسی</span>
              <textarea rows={2} maxLength={2000} value={form.description_en} onChange={(event) => updateForm('description_en', event.target.value)} className={fieldClass} />
            </label>
          </section>

          <section className="space-y-3 rounded-2xl border border-(--theme-border) bg-(--theme-surface-muted)/50 p-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-(--theme-text)">انتخاب تصاویر از کتابخانه</h3>
                <p className="mt-1 text-xs text-(--theme-text-muted)">فقط تصاویر اصلی و عمومی کتابخانه قابل انتخاب‌اند؛ فایل‌های در دسترس‌نبودنی غیرفعال هستند. حداکثر ۶۰ تصویر.</p>
              </div>
              <span className="text-xs font-bold text-(--theme-primary-ink)">{selectedMedia.length} / 60 انتخاب‌شده</span>
            </div>

            {selectedMedia.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedMedia.map((media, index) => (
                  <div key={media.id} className="flex items-center gap-2 rounded-lg border border-(--theme-border) bg-(--theme-card-surface) px-2 py-1.5">
                    <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-(--theme-text)">
                      <input
                        type="radio"
                        name="album-cover"
                        checked={form.cover_media_id === media.id}
                        onChange={() => updateForm('cover_media_id', media.id)}
                      />
                      {index === 0 ? 'کاور' : `تصویر ${index + 1}`}
                    </label>
                    <button type="button" onClick={() => removeSelected(media.id)} className="text-red-600 hover:text-red-700" aria-label={`حذف ${media.name} از آلبوم`}>×</button>
                  </div>
                ))}
              </div>
            )}

            {mediaLoading ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-(--theme-text-muted)">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                در حال دریافت تصاویر...
              </div>
            ) : images.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
                {images.map((image) => {
                  const selected = selectedMedia.some((item) => item.id === image.id);
                  const unavailable = image.source_available === false;
                  return (
                    <button
                      type="button"
                      key={image.id}
                      disabled={unavailable || (!selected && selectedMedia.length >= 60)}
                      onClick={() => toggleMedia(image)}
                      className={`relative overflow-hidden rounded-xl border text-start transition ${selected ? 'border-(--theme-primary) ring-2 ring-(--theme-primary)/30' : 'border-(--theme-border)'} disabled:cursor-not-allowed disabled:opacity-45`}
                      title={unavailable ? 'فایل اصلی در فضای ذخیره‌سازی پیدا نشد.' : image.name}
                    >
                      <div className="aspect-square bg-(--theme-surface-muted)">
                        <MediaThumbnail mediaId={image.id} alt={image.alt_text || image.name} isVideo={false} originalUrl={image.url} />
                      </div>
                      <span className="block truncate px-2 py-1.5 text-[10px] text-(--theme-text-muted)">{image.name}</span>
                      {selected && <span className="absolute end-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-(--theme-primary) text-(--theme-primary-foreground)"><Check className="h-4 w-4" aria-hidden="true" /></span>}
                      {unavailable && <span className="absolute inset-0 grid place-items-center bg-black/55 px-2 text-center text-[10px] font-bold text-white">فایل اصلی در دسترس نیست</span>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-(--theme-border-strong) p-8 text-center text-xs text-(--theme-text-muted)">
                در کتابخانه تصویر عمومی و قابل استفاده‌ای وجود ندارد.
              </div>
            )}
            <div className="flex items-center justify-between text-[11px] text-(--theme-text-muted)">
              <span>{mediaTotal.toLocaleString('fa-IR')} تصویر قابل استفاده در کتابخانه</span>
              <Pagination page={mediaPage} lastPage={mediaLastPage} onChange={setMediaPage} />
            </div>
          </section>

          <section className="grid gap-4 rounded-2xl border border-(--theme-border) p-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
              <span>حالت نمایش</span>
              <select value={form.layout} onChange={(event) => updateForm('layout', event.target.value as AlbumForm['layout'])} className={fieldClass}>
                <option value="grid">شبکه‌ای</option>
                <option value="masonry">نامنظم (Masonry)</option>
                <option value="mosaic">موزاییکی</option>
                <option value="slider">اسلایدر</option>
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
              <span>تعداد ستون‌ها</span>
              <input type="number" min={2} max={8} value={form.columns} onChange={(event) => updateForm('columns', Number(event.target.value))} className={fieldClass} />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
              <span>تعداد ردیف‌های اولیه</span>
              <input type="number" min={1} max={10} value={form.rows} onChange={(event) => updateForm('rows', Number(event.target.value))} className={fieldClass} />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
              <span>افکت تغییر اسلاید</span>
              <select value={form.transition} onChange={(event) => updateForm('transition', event.target.value as AlbumForm['transition'])} className={fieldClass}>
                <option value="fade">محو شدن</option>
                <option value="slide">حرکت</option>
                <option value="zoom">بزرگ‌نمایی</option>
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
              <span>زمان اسلاید (ثانیه)</span>
              <input type="number" min={2.5} max={15} step={0.5} value={form.interval_ms / 1000} onChange={(event) => updateForm('interval_ms', Number(event.target.value) * 1000)} className={fieldClass} />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
              <span>افکت تصویر</span>
              <select value={form.image_effect} onChange={(event) => updateForm('image_effect', event.target.value as AlbumForm['image_effect'])} className={fieldClass}>
                <option value="none">بدون افکت</option>
                <option value="zoom">بزرگ‌نمایی</option>
                <option value="pan">حرکت آرام</option>
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-(--theme-text)">
              <span>افکت کارت</span>
              <select value={form.card_effect} onChange={(event) => updateForm('card_effect', event.target.value as AlbumForm['card_effect'])} className={fieldClass}>
                <option value="none">بدون افکت</option>
                <option value="lift">برجسته‌شدن</option>
                <option value="glow">درخشش</option>
              </select>
            </label>
            <label className="flex items-center gap-2 self-end rounded-xl border border-(--theme-border) px-3 py-3 text-xs font-semibold text-(--theme-text)">
              <input type="checkbox" checked={form.is_active} onChange={(event) => updateForm('is_active', event.target.checked)} />
              انتشار عمومی
            </label>
          </section>

          <button
            type="submit"
            disabled={saving || loadingAlbum || selectedMedia.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--theme-btn-bg) px-4 py-3 text-sm font-bold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            {saving ? 'در حال ذخیره...' : 'ذخیره آلبوم'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteAlbum)}
        onClose={() => setDeleteAlbum(null)}
        onConfirm={confirmDelete}
        message={`آلبوم «${deleteAlbum?.title_fa || ''}» حذف می‌شود؛ فایل‌های اصلی کتابخانه حذف نخواهند شد.`}
        loading={deleting}
      />
    </div>
  );
};
