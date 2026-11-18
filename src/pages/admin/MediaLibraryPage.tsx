import React, { useEffect, useState } from 'react';
import { Copy, FileText, Lock, Pencil, Save, Trash2, Unlock } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { MediaFile } from '../../types/index.ts';
import { isVideoMediaUrl } from '../../utils/brandingDefaults.ts';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';
import { Modal } from '../../components/ui/Modal.tsx';

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
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-3 text-lg font-extrabold">کتابخانه رسانه و مدیریت متمرکز فایل‌ها (storage/app/public)</h1>
        <FileUploader folder="uploads" onUploaded={() => load()} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((f) => {
          const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(f.extension.toLowerCase());
          const isVideo = isVideoMediaUrl(f.url) || ['mp4', 'webm'].includes(f.extension.toLowerCase());

          return (
            <div key={f.id} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <div className="mb-3 flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                  {isVideo ? (
                    <video src={f.url} muted loop autoPlay playsInline className="h-full w-full object-contain" />
                  ) : isImage ? (
                    <ZeroBrokenImage src={f.url} alt={f.name} className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <FileText className="h-8 w-8" />
                      <span className="font-mono text-[11px] uppercase">{f.extension}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="font-mono uppercase">{f.extension}</span>
                  <span className="tabular-nums">{Math.round(f.size_bytes / 1024)} KB</span>
                </div>
                <div className="mt-2 truncate text-sm font-bold">{f.name}</div>
                <div className="mt-1 truncate font-mono text-[11px] text-slate-400" dir="ltr">{f.url}</div>
                {(f.alt_text || f.description) && (
                  <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                    {f.alt_text && <p className="truncate">Alt: {f.alt_text}</p>}
                    {f.description && <p className="line-clamp-2">{f.description}</p>}
                  </div>
                )}
              </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
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
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300"
              >
                {f.requires_auth ? <Lock className="h-3.5 w-3.5 text-amber-600" /> : <Unlock className="h-3.5 w-3.5 text-emerald-600" />}
                <span>{f.requires_auth ? 'نیازمند ورود' : 'دانلود عمومی'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(f)}
                  className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-(--theme-primary) dark:hover:bg-slate-800"
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
                  className="rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="کپی آدرس"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteFile(f)}
                  className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
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
            <span className="text-xs font-semibold">نام فایل در کتابخانه</span>
            <input
              required
              maxLength={255}
              value={editForm.name}
              onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold">متن جایگزین تصویر (Alt)</span>
            <input
              maxLength={255}
              value={editForm.alt_text}
              onChange={(event) => setEditForm({ ...editForm, alt_text: event.target.value })}
              placeholder="توصیف کوتاه و دقیق تصویر برای دسترس‌پذیری و موتورهای جستجو"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold">توضیحات تصویر</span>
            <textarea
              maxLength={5000}
              rows={4}
              value={editForm.description}
              onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
              placeholder="شرح تصویر یا اطلاعات تکمیلی برای استفاده در محتوای سایت"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <button
            type="submit"
            disabled={savingMetadata}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-(--theme-primary) px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {savingMetadata ? 'در حال ذخیره...' : 'ذخیره مشخصات'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
