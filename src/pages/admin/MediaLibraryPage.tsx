import React, { useEffect, useState } from 'react';
import { Copy, FileText, Image as ImageIcon, Lock, Pencil, Save, Trash2, Unlock } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { MediaFile } from '../../types/index.ts';
import { isVideoMediaUrl } from '../../utils/brandingDefaults.ts';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.tsx';

export const MediaLibraryPage: React.FC = () => {
  const { addToast } = useAppStore();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [deleteFile, setDeleteFile] = useState<MediaFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [editForm, setEditForm] = useState({ name: '', alt_text: '', description: '' });
  const [savingMetadata, setSavingMetadata] = useState(false);

  const load = async (targetPage = page) => {
    try {
      const response = await apiRequest<{ data: MediaFile[]; meta: { last_page: number } }>(
        `/admin/media?page=${targetPage}&per_page=12`,
      );
      if (targetPage > response.meta.last_page) {
        setPage(Math.max(1, response.meta.last_page));
        return;
      }
      setFiles(response.data);
      setLastPage(response.meta.last_page);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'بارگذاری رسانه‌ها ناموفق بود.');
    }
  };

  useEffect(() => {
    void load(page);
  }, [page]);

  const confirmDelete = async () => {
    if (!deleteFile) return;

    setDeleting(true);
    try {
      await apiRequest(`/admin/media/${deleteFile.id}`, { method: 'DELETE' });
      setDeleteFile(null);
      load();
      addToast('success', 'فایل از کتابخانه رسانه حذف شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف فایل ناموفق بود.');
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (file: MediaFile) => {
    setEditingFile(file);
    setEditForm({
      name: file.name,
      alt_text: file.alt_text || '',
      description: file.description || '',
    });
  };

  const saveMetadata = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingFile) return;
    setSavingMetadata(true);
    try {
      await apiRequest(`/admin/media/${editingFile.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      setEditingFile(null);
      await load();
      addToast('success', 'مشخصات و اطلاعات سئوی فایل ذخیره شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره مشخصات فایل ناموفق بود.');
    } finally {
      setSavingMetadata(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={ImageIcon}
        eyebrow="Media library"
        title="کتابخانه رسانه"
        description="مدیریت متمرکز فایل‌های بارگذاری‌شده در فضای ذخیره‌سازی سایت."
      />
      <div className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow)">
        <FileUploader folder="uploads" onUploaded={() => load()} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((f) => {
          const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(f.extension.toLowerCase());
          const isVideo = isVideoMediaUrl(f.url) || ['mp4', 'webm'].includes(f.extension.toLowerCase());

          return (
            <div key={f.id} className="flex flex-col justify-between rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-4 shadow-(--theme-card-shadow)">
              <div>
                <div className="mb-3 flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-(--theme-border) bg-(--theme-surface-muted)">
                  {isVideo ? (
                    <video src={f.url} muted loop autoPlay playsInline className="h-full w-full object-contain" />
                  ) : isImage ? (
                    <ZeroBrokenImage src={f.url} alt={f.name} className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-(--theme-text-muted)">
                      <FileText className="h-8 w-8" />
                      <span className="font-mono text-[11px] uppercase">{f.extension}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-(--theme-text-muted)">
                  <span className="font-mono uppercase">{f.extension}</span>
                  <span className="tabular-nums">{Math.round(f.size_bytes / 1024)} KB</span>
                </div>
                <div className="mt-2 truncate text-sm font-bold text-(--theme-text)">{f.name}</div>
                <div className="mt-1 truncate font-mono text-[11px] text-(--theme-text-muted)" dir="ltr">{f.url}</div>
                {(f.alt_text || f.description) && (
                  <div className="mt-2 space-y-1 text-[11px] text-(--theme-text-muted)">
                    {f.alt_text && <p className="truncate">Alt: {f.alt_text}</p>}
                    {f.description && <p className="line-clamp-2">{f.description}</p>}
                  </div>
                )}
              </div>

            <div className="mt-4 flex items-center justify-between border-t border-(--theme-border) pt-3">
              <button
                type="button"
                onClick={async () => {
                  await apiRequest(`/admin/media/${f.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ requires_auth: !f.requires_auth }),
                  });
                  load();
                  addToast('info', 'سطح دسترسی دانلود فایل تغییر کرد.');
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-(--theme-text-muted) hover:text-(--theme-text)"
              >
                {f.requires_auth ? <Lock className="h-3.5 w-3.5 text-amber-600" /> : <Unlock className="h-3.5 w-3.5 text-emerald-600" />}
                <span>{f.requires_auth ? 'نیازمند ورود' : 'دانلود عمومی'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(f)}
                  className="rounded-lg p-1.5 text-(--theme-text-muted) hover:bg-(--theme-surface-muted) hover:text-(--theme-primary-ink)"
                  aria-label={`ویرایش مشخصات ${f.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(f.url);
                    addToast('success', 'مسیر فایل کپی شد.');
                  }}
                  className="rounded-lg p-1.5 text-(--theme-text-muted) hover:bg-(--theme-surface-muted) hover:text-(--theme-text)"
                  title="کپی آدرس"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteFile(f)}
                  className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  aria-label={`حذف ${f.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <ConfirmDialog
                open={Boolean(deleteFile)}
                onClose={() => setDeleteFile(null)}
                onConfirm={confirmDelete}
                message="این فایل از کتابخانه پنهان می‌شود و فایل ذخیره‌شده برای حذف فیزیکی پاک نمی‌شود. ادامه می‌دهید؟"
                loading={deleting}
              />
            </div>
          </div>
          );
        })}
      </div>
      <Pagination page={page} lastPage={lastPage} onChange={setPage} />
      <Modal
        open={Boolean(editingFile)}
        onClose={() => setEditingFile(null)}
        title="ویرایش مشخصات رسانه و سئو"
        size="md"
      >
        <form onSubmit={saveMetadata} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-(--theme-text)">پیوند فایل در کتابخانه</span>
            <div className="flex items-center gap-2">
              <input
                readOnly
                dir="ltr"
                value={editingFile?.url || ''}
                className="min-w-0 flex-1 rounded-xl border border-(--theme-input-border) bg-(--theme-surface-muted) px-3 py-2 font-mono text-xs text-(--theme-text)"
              />
              {editingFile?.url && (
                <>
                  <a
                    href={editingFile.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-xl border border-(--theme-border) px-3 py-2 text-xs font-semibold text-(--theme-link) hover:bg-(--theme-surface-muted)"
                  >
                    باز کردن
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(editingFile.url).then(
                        () => addToast('success', 'پیوند فایل کپی شد.'),
                        (error: unknown) => addToast('error', error instanceof Error ? error.message : 'کپی پیوند فایل ناموفق بود.'),
                      );
                    }}
                    className="shrink-0 rounded-xl border border-(--theme-border) p-2 text-(--theme-text) hover:bg-(--theme-surface-muted)"
                    aria-label="کپی پیوند فایل"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-(--theme-text)">نام فایل در کتابخانه</span>
            <input
              required
              maxLength={255}
              value={editForm.name}
              onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
              className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-(--theme-text)">متن جایگزین تصویر (Alt)</span>
            <input
              maxLength={255}
              value={editForm.alt_text}
              onChange={(event) => setEditForm({ ...editForm, alt_text: event.target.value })}
              placeholder="توصیف کوتاه و دقیق تصویر برای دسترس‌پذیری و موتورهای جستجو"
              className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-(--theme-text)">توضیحات تصویر</span>
            <textarea
              maxLength={5000}
              rows={4}
              value={editForm.description}
              onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
              placeholder="شرح تصویر یا اطلاعات تکمیلی برای استفاده در محتوای سایت"
              className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)"
            />
          </label>
          <button
            type="submit"
            disabled={savingMetadata}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--theme-btn-bg) px-4 py-2.5 text-xs font-semibold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover) disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {savingMetadata ? 'در حال ذخیره...' : 'ذخیره مشخصات'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
