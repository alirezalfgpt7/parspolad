import React, { useState } from 'react';
import { FileText, FolderOpen, Sparkles, Trash2, UploadCloud } from 'lucide-react';
import { apiRequest, mediaUrl } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { MediaFile } from '../../types/index.ts';
import { BUILTIN_BRAND_MEDIA_PRESETS, isAnimatedMediaUrl, isVideoMediaUrl } from '../../utils/brandingDefaults.ts';
import { FileUploader } from './FileUploader.tsx';
import { Modal } from './Modal.tsx';
import { Pagination } from './Pagination.tsx';
import { ZeroBrokenImage } from './ZeroBrokenImage.tsx';
import { MediaLibraryPreview } from '../admin/MediaLibraryPreview.tsx';

interface MediaUrlFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  placeholder?: string;
  showAnimatedPresets?: boolean;
  hint?: string;
}

/**
 * Rich media selector & live preview component showing current or previously saved images, GIFs, or looping videos.
 */
export const MediaUrlField: React.FC<MediaUrlFieldProps> = ({
  label,
  value,
  onChange,
  folder = 'logos',
  accept = '.png,.jpg,.jpeg,.webp,.gif,.mp4,.webm',
  placeholder = '/storage/logos/logo-main.png',
  showAnimatedPresets = false,
  hint,
}) => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaFile[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [libraryPage, setLibraryPage] = useState(1);
  const [libraryLastPage, setLibraryLastPage] = useState(1);
  const addToast = useAppStore((state) => state.addToast);

  const loadLibraryPage = async (page: number) => {
    setLoadingLibrary(true);
    try {
      const res = await apiRequest<{ data: MediaFile[]; meta: { last_page: number } }>(`/admin/media?page=${page}&per_page=40`);
      setMediaItems(res.data || []);
      setLibraryPage(page);
      setLibraryLastPage(res.meta.last_page);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'دریافت کتابخانهٔ رسانه ناموفق بود.');
    } finally {
      setLoadingLibrary(false);
    }
  };

  const openLibrary = () => {
    setLibraryOpen(true);
    void loadLibraryPage(1);
  };

  const isVideo = isVideoMediaUrl(value);
  const isAnimated = isAnimatedMediaUrl(value);
  const acceptedExtensions = accept
    .split(',')
    .map((extension) => extension.trim().replace(/^\./, '').toLowerCase())
    .filter((extension) => extension && !extension.includes('/'));
  const matchesAccept = (item: Pick<MediaFile, 'url' | 'extension'>): boolean => {
    if (acceptedExtensions.length === 0 || acceptedExtensions.includes('*')) return true;
    const extension = (item.extension || item.url.split(/[?#]/, 1)[0].split('.').pop() || '').replace(/^\./, '').toLowerCase();
    return acceptedExtensions.includes(extension);
  };
  const acceptsDocuments = acceptedExtensions.some((extension) => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'dwg'].includes(extension));
  const isImage = /\.(png|jpe?g|webp|gif|svg|ico)(\?.*)?$/i.test(value);

  return (
    <div className="space-y-2 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-(--theme-text)">{label}</span>
        {isAnimated && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
            <Sparkles className="h-3 w-3" />
            فایل متحرک
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-(--theme-border) bg-(--theme-surface) p-1.5 shadow-xs">
          {!value ? (
            <span className="text-[10px] text-(--theme-text-muted)">بدون تصویر</span>
          ) : isVideo ? (
            <video
              key={value}
              src={mediaUrl(value)}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full rounded-lg object-contain"
            />
          ) : isImage ? (
            <ZeroBrokenImage
              src={mediaUrl(value)}
              alt={label}
              className="h-full w-full rounded-lg object-contain"
            />
          ) : (
            <FileText className="h-7 w-7 text-(--theme-text-muted)" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              dir="ltr"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5 py-1.5 font-mono text-xs text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                title="پاک کردن"
                className="rounded-lg border border-(--theme-border) bg-(--theme-surface) p-1.5 text-(--theme-text-muted) hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setUploadOpen((o) => !o)}
              className="inline-flex items-center gap-1 rounded-lg border border-(--theme-border) bg-(--theme-surface) px-2.5 py-1 text-[11px] font-semibold text-(--theme-text) hover:border-(--theme-primary)"
            >
              <UploadCloud className="h-3.5 w-3.5 text-(--theme-primary-ink)" />
              <span>آپلود جدید</span>
            </button>
            <button
              type="button"
              onClick={openLibrary}
              className="inline-flex items-center gap-1 rounded-lg border border-(--theme-border) bg-(--theme-surface) px-2.5 py-1 text-[11px] font-semibold text-(--theme-text) hover:border-(--theme-primary)"
            >
              <FolderOpen className="h-3.5 w-3.5 text-(--theme-accent-ink)" />
              <span>کتابخانه رسانه</span>
            </button>
            {showAnimatedPresets && BUILTIN_BRAND_MEDIA_PRESETS.slice(0, 3).map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() => onChange(preset.url)}
                className="rounded-lg border border-(--theme-border) bg-(--theme-surface) px-2 py-1 text-[10px] font-medium text-(--theme-text) hover:border-(--theme-primary)"
              >
                {preset.label}
              </button>
            ))}
          </div>
          {hint && <p className="text-[11px] text-(--theme-text-muted)">{hint}</p>}
        </div>
      </div>

      {uploadOpen && (
        <div className="pt-1">
          <FileUploader
            folder={folder}
            accept={accept}
            label={acceptsDocuments ? 'آپلود کاتالوگ یا سند' : 'آپلود تصویر یا ویدئو'}
            onUploaded={(url) => {
              onChange(url);
              setUploadOpen(false);
            }}
          />
        </div>
      )}

      <Modal open={libraryOpen} onClose={() => setLibraryOpen(false)} title={acceptsDocuments ? 'انتخاب سند از کتابخانه رسانه' : 'انتخاب تصویر یا فایل از کتابخانه رسانه'} size="lg">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {BUILTIN_BRAND_MEDIA_PRESETS.map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() => {
                  onChange(preset.url);
                  setLibraryOpen(false);
                }}
                style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 8%, transparent)' }}
                className="rounded-lg border border-(--theme-primary)/30 px-3 py-1.5 text-xs font-semibold text-(--theme-primary-ink) transition hover:opacity-85"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {loadingLibrary ? (
            <p className="py-8 text-center text-xs text-(--theme-text-muted)">در حال بارگذاری رسانه...</p>
          ) : (
            <>
              {mediaItems.filter(matchesAccept).length === 0 ? (
                <p className="py-8 text-center text-xs text-(--theme-text-muted)">در این صفحه رسانهٔ سازگار پیدا نشد؛ صفحه‌های دیگر را بررسی یا فایل را آپلود کنید.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {mediaItems
                    .filter(matchesAccept)
                    .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      const isVideoFile = item.mime_type.startsWith('video/') || isVideoMediaUrl(item.url);
                      const selectedUrl = isVideoFile
                        ? item.optimized_preview_url || item.preview_url || item.url
                        : item.preview_url || item.url;
                      onChange(isVideoFile && !isVideoMediaUrl(selectedUrl) ? `${selectedUrl}#video` : selectedUrl);
                      setLibraryOpen(false);
                    }}
                    className="group overflow-hidden rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-2 text-start transition hover:border-(--theme-primary)"
                  >
                    <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg bg-(--theme-surface)">
                      {isVideoMediaUrl(item.url) || item.mime_type.startsWith('video/') ? (
                        <MediaLibraryPreview item={item} />
                      ) : item.mime_type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg|ico)(\?.*)?$/i.test(item.url) ? (
                        <MediaLibraryPreview item={item} />
                      ) : (
                        <FileText className="h-7 w-7 text-(--theme-text-muted)" aria-hidden="true" />
                      )}
                    </div>
                    <div className="mt-1.5 truncate text-[11px] font-semibold text-(--theme-text)">
                      {item.name}
                    </div>
                  </button>
                    ))}
                </div>
              )}
              <Pagination page={libraryPage} lastPage={libraryLastPage} onChange={(page) => void loadLibraryPage(page)} />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
