import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Film, Image as ImageIcon, LoaderCircle, Sparkles } from 'lucide-react';
import { ApiError, apiBlob, apiMultipartRequest, apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { MediaFile } from '../../types/index.ts';
import { Modal } from '../ui/Modal.tsx';
import { Pagination } from '../ui/Pagination.tsx';
import { MediaThumbnail } from './MediaThumbnail.tsx';

interface OptimizerCapabilities {
  images: { available: boolean; format: string };
  videos: { available: boolean; format: string };
}

interface OptimizedMedia {
  source: MediaFile;
  variants: MediaFile[];
}

interface MediaOptimizerTabProps {
  autoOptimizeMediaId?: number | null;
  onAutoOptimizeStarted?: () => void;
  onOptimized?: () => void;
}

const isVideo = (media: MediaFile) => media.mime_type.startsWith('video/');

export const MediaOptimizerTab: React.FC<MediaOptimizerTabProps> = ({
  autoOptimizeMediaId = null,
  onAutoOptimizeStarted,
  onOptimized,
}) => {
  const { addToast } = useAppStore();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [results, setResults] = useState<Record<number, MediaFile[]>>({});
  const [capabilities, setCapabilities] = useState<OptimizerCapabilities | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ media: MediaFile; message: string } | null>(null);
  const processingLock = useRef(false);
  const lastAutoOptimizeId = useRef<number | null>(null);
  const browserVideoAvailable = typeof Worker !== 'undefined' && typeof WebAssembly !== 'undefined';

  const load = async (targetPage = page) => {
    setLoading(true);
    try {
      const [mediaResponse, capabilityResponse] = await Promise.all([
        apiRequest<{ data: MediaFile[]; meta: { last_page: number } }>(
          `/admin/media?optimizable=1&page=${targetPage}&per_page=12`,
        ),
        capabilities
          ? Promise.resolve({ data: capabilities })
          : apiRequest<{ data: OptimizerCapabilities }>('/admin/media/optimizer/capabilities'),
      ]);
      if (targetPage > mediaResponse.meta.last_page) {
        setPage(Math.max(1, mediaResponse.meta.last_page));
        return;
      }
      setFiles(mediaResponse.data);
      setLastPage(mediaResponse.meta.last_page);
      setCapabilities(capabilityResponse.data);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'بارگذاری ابزار بهینه‌سازی ناموفق بود.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(page);
  }, [page]);

  const runOptimization = async (media: MediaFile, force: boolean) => {
    if (processingLock.current) return;
    processingLock.current = true;
    setProcessingId(media.id);
    try {
      if (isVideo(media) && !capabilities?.videos.available) {
        setProcessingMessage('در حال دریافت ویدئو برای پردازش مرورگری...');
        const source = await apiBlob(`/admin/media/${media.id}/optimizer-source`);
        if (source.size > 25 * 1024 * 1024) {
          throw new Error('حجم ویدئو برای پردازش مرورگری بیش از ۲۵ مگابایت است.');
        }

        const { transcodeVideoInBrowser } = await import('../../services/browserVideoOptimizer.ts');
        const outputFiles = await transcodeVideoInBrowser(
          new Uint8Array(await source.arrayBuffer()),
          media.extension,
          setProcessingMessage,
        );
        const savedVariants: MediaFile[] = [];
        for (const output of outputFiles) {
          setProcessingMessage(`در حال ذخیرهٔ نسخهٔ ${output.variant}...`);
          const form = new FormData();
          form.append('file', output.file);
          form.append('variant', output.variant);
          const response = await apiMultipartRequest<{ data: MediaFile }>(
            `/admin/media/${media.id}/optimizer-variant`,
            form,
          );
          savedVariants.push(response.data);
        }
        setResults((current) => ({ ...current, [media.id]: savedVariants }));
        addToast('success', `نسخه‌های ویدئویی «${media.name}» در مرورگر ساخته شد؛ فایل اصلی بدون تغییر باقی ماند.`);
        onOptimized?.();
        return;
      }

      const response = await apiRequest<{ data: OptimizedMedia }>(`/admin/media/${media.id}/optimize`, {
        method: 'POST',
        body: JSON.stringify({ force }),
      });
      setResults((current) => ({ ...current, [media.id]: response.data.variants }));
      addToast('success', `نسخه‌های بهینهٔ «${media.name}» آماده شد؛ فایل اصلی بدون تغییر باقی ماند.`);
      onOptimized?.();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'بهینه‌سازی رسانه ناموفق بود.');
    } finally {
      processingLock.current = false;
      setProcessingId(null);
      setProcessingMessage(null);
    }
  };

  const optimize = async (media: MediaFile) => {
    if (processingLock.current) return;
    processingLock.current = true;
    setProcessingId(media.id);
    setProcessingMessage('در حال بررسی حجم و نسخه‌های قبلی...');
    try {
      const response = await apiRequest<{
        data: { requires_confirmation: boolean; reason: string | null };
      }>(`/admin/media/${media.id}/optimization-check`);
      if (response.data.requires_confirmation) {
        setConfirmation({
          media,
          message: `${response.data.reason || 'این فایل ممکن است از قبل بهینه باشد.'} آیا با وجود این می‌خواهید ادامه دهید؟`,
        });
        return;
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setConfirmation({
          media,
          message: `${error.message} آیا می‌خواهید با وجود این ادامه دهید؟`,
        });
        return;
      }
      addToast('error', error instanceof Error ? error.message : 'بررسی رسانه ناموفق بود.');
      return;
    } finally {
      processingLock.current = false;
      setProcessingId(null);
      setProcessingMessage(null);
    }

    await runOptimization(media, false);
  };

  const confirmOptimization = () => {
    if (!confirmation) return;
    const { media } = confirmation;
    setConfirmation(null);
    void runOptimization(media, true);
  };

  useEffect(() => {
    if (
      autoOptimizeMediaId === null
      || loading
      || processingId !== null
      || confirmation !== null
      || lastAutoOptimizeId.current === autoOptimizeMediaId
    ) {
      return;
    }

    const media = files.find((item) => item.id === autoOptimizeMediaId);
    if (!media) return;

    lastAutoOptimizeId.current = autoOptimizeMediaId;
    onAutoOptimizeStarted?.();
    void optimize(media);
  }, [autoOptimizeMediaId, confirmation, files, loading, onAutoOptimizeStarted, optimize, processingId]);

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      addToast('success', 'آدرس نسخهٔ بهینه کپی شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'کپی آدرس ناموفق بود.');
    }
  };

  return (
    <section className="space-y-5" aria-label="بهینه‌سازی رسانه">
      <div className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow)">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-(--theme-surface-muted) p-2 text-(--theme-primary-ink)">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-(--theme-text)">تولید خودکار نسخه‌های مناسب وب</h2>
            <p className="text-xs leading-6 text-(--theme-text-muted)">
              فایل اصلی حفظ می‌شود. برای تصاویر، WebP بندانگشتی، محتوایی و بزرگ ساخته می‌شود؛
              ویدئو در سرور یا مرورگر مدیر به MP4 بهینه و تصویر پیش‌نمایش تبدیل می‌شود.
            </p>
            <p className="text-[11px] leading-5 text-(--theme-text-muted)">
              فشرده‌سازی WebP و ویدئو از نوع باکیفیت و با اتلاف بصری کم است، نه تضمینِ صفرِ تغییر پیکسلی؛
              نسخهٔ اصلی همیشه برای حفظ کیفیت در دسترس می‌ماند.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full bg-(--theme-surface-muted) px-3 py-1.5 text-(--theme-text)">
            <ImageIcon className="h-3.5 w-3.5" />
            تصویر: {capabilities?.images.available ? 'WebP فعال' : 'GD/WebP در دسترس نیست'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-(--theme-surface-muted) px-3 py-1.5 text-(--theme-text)">
            <Film className="h-3.5 w-3.5" />
            ویدئو: {capabilities?.videos.available ? 'FFmpeg سرور فعال' : browserVideoAvailable ? 'تبدیل مرورگری فعال' : 'در این مرورگر پشتیبانی نمی‌شود'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-(--theme-card-border) p-10 text-sm text-(--theme-text-muted)">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          در حال بارگذاری رسانه‌ها...
        </div>
      ) : files.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--theme-card-border) p-10 text-center text-sm text-(--theme-text-muted)">
          رسانهٔ تصویری یا ویدئویی برای بهینه‌سازی پیدا نشد.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {files.map((media) => {
            const video = isVideo(media);
            const supported = media.source_available !== false && (video
              ? capabilities?.videos.available || browserVideoAvailable
              : capabilities?.images.available);
            const sourceMissing = media.source_available === false;
            const isProcessing = processingId === media.id;
            const variants = media.derived_files?.length ? media.derived_files : results[media.id];
            const sizeChange = (variant: MediaFile) => media.size_bytes > 0
              ? Math.round((1 - variant.size_bytes / media.size_bytes) * 100)
              : null;

            return (
              <article key={media.id} className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-3 shadow-(--theme-card-shadow)">
                <div className="flex gap-3">
                  <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-(--theme-border) bg-(--theme-surface-muted)">
                    <MediaThumbnail
                      mediaId={media.id}
                      alt={media.alt_text || media.name}
                      isVideo={video}
                      originalUrl={media.preview_url || media.url}
                      thumbnailUrl={media.thumbnail_url}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-(--theme-text)">{media.name}</h3>
                    <p className="mt-1 text-xs text-(--theme-text-muted)">
                      {media.extension.toUpperCase()} · {Math.max(1, Math.round(media.size_bytes / 1024))} KB
                    </p>
                    <button
                      type="button"
                      onClick={() => void optimize(media)}
                      disabled={!supported || isProcessing || processingId !== null}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-(--theme-btn-bg) px-3 py-2 text-xs font-semibold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover) disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isProcessing ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      {isProcessing ? processingMessage || 'در حال پردازش...' : variants ? 'ساخت دوبارهٔ نسخه‌ها' : 'بهینه‌سازی و ساخت نسخه‌ها'}
                    </button>
                  </div>
                </div>
                {!supported && (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                    {sourceMissing
                      ? 'فایل اصلی روی فضای ذخیره‌سازی پیدا نشد؛ این مورد از پردازش کنار گذاشته شد.'
                      : video
                        ? 'مرورگر فعلی از پردازش ویدئو پشتیبانی نمی‌کند.'
                        : 'پردازش تصویر به GD با پشتیبانی WebP نیاز دارد.'}
                  </p>
                )}
                {variants && (
                  <div className="mt-4 space-y-2 border-t border-(--theme-border) pt-3">
                    <p className="text-xs font-semibold text-(--theme-text)">نسخه‌های ساخته‌شده زیر فایل اصلی در کتابخانه نمایش داده می‌شوند</p>
                    {variants.map((variant) => {
                      const change = sizeChange(variant);
                      return (
                        <div key={variant.id} className="flex min-w-0 items-center gap-2 text-xs">
                          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          <span className="min-w-0 flex-1 text-(--theme-text-muted)">
                            <span className="block truncate">
                              {variant.variant} · {variant.extension.toUpperCase()} · {Math.max(1, Math.round(variant.size_bytes / 1024))} KB
                              {' · '}
                              {change === null ? '—' : change >= 0 ? `${change}٪ کاهش` : `${Math.abs(change)}٪ افزایش`}
                            </span>
                            <span className="block truncate font-mono text-[10px]" dir="ltr">
                              {variant.storage_path || variant.folder}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => void copyUrl(variant.url)}
                            className="shrink-0 rounded-lg p-1.5 text-(--theme-text-muted) hover:bg-(--theme-surface-muted) hover:text-(--theme-text)"
                            aria-label={`کپی آدرس ${variant.variant}`}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      {!loading && <Pagination page={page} lastPage={lastPage} onChange={setPage} />}
      <Modal
        open={Boolean(confirmation)}
        onClose={() => setConfirmation(null)}
        title="بررسی نیاز به بهینه‌سازی"
        size="sm"
      >
        <p className="text-sm leading-6 text-(--theme-text-muted)">{confirmation?.message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setConfirmation(null)}
            className="rounded-xl border border-(--theme-border) px-4 py-2 text-sm font-medium text-(--theme-text) hover:bg-(--theme-surface-muted)"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={confirmOptimization}
            className="rounded-xl bg-(--theme-btn-bg) px-4 py-2 text-sm font-semibold text-(--theme-btn-text) hover:bg-(--theme-btn-hover)"
          >
            ادامه و بهینه‌سازی
          </button>
        </div>
      </Modal>
    </section>
  );
};
