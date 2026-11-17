import React, { useState } from 'react';
import { FolderOpen, Sparkles, Trash2, UploadCloud } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import type { MediaFile } from '../../types/index.ts';
import { BUILTIN_BRAND_MEDIA_PRESETS, isAnimatedMediaUrl, isVideoMediaUrl } from '../../utils/brandingDefaults.ts';
import { FileUploader } from './FileUploader.tsx';
import { Modal } from './Modal.tsx';
import { ZeroBrokenImage } from './ZeroBrokenImage.tsx';

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

  const openLibrary = async () => {
    setLibraryOpen(true);
    setLoadingLibrary(true);
    try {
      const res = await apiRequest<{ data: MediaFile[] }>('/admin/media?per_page=40');
      setMediaItems(res.data || []);
    } catch {
      setMediaItems([]);
    } finally {
      setLoadingLibrary(false);
    }
  };

  const isVideo = isVideoMediaUrl(value);
  const isAnimated = isAnimatedMediaUrl(value);

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</span>
        {isAnimated && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-300">
            <Sparkles className="h-3 w-3" />
            فایل متحرک
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs dark:border-slate-700 dark:bg-slate-950">
          {!value ? (
            <span className="text-[10px] text-slate-400">بدون تصویر</span>
          ) : isVideo ? (
            <video
              key={value}
              src={value}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full rounded-lg object-contain"
            />
          ) : (
            <ZeroBrokenImage
              src={value}
              alt={label}
              className="h-full w-full rounded-lg object-contain"
            />
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
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs outline-none focus:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-900"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                title="پاک کردن"
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:hover:bg-red-950/40"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setUploadOpen((o) => !o)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold hover:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800"
            >
              <UploadCloud className="h-3.5 w-3.5 text-(--theme-primary)" />
              <span>آپلود جدید</span>
            </button>
            <button
              type="button"
              onClick={openLibrary}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold hover:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800"
            >
              <FolderOpen className="h-3.5 w-3.5 text-amber-500" />
              <span>کتابخانه رسانه</span>
            </button>
            {showAnimatedPresets && BUILTIN_BRAND_MEDIA_PRESETS.slice(0, 3).map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() => onChange(preset.url)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium hover:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800"
              >
                {preset.label}
              </button>
            ))}
          </div>
          {hint && <p className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>}
        </div>
      </div>

      {uploadOpen && (
        <div className="pt-1">
          <FileUploader
            folder={folder}
            accept={accept}
            onUploaded={(url) => {
              onChange(url);
              setUploadOpen(false);
            }}
          />
        </div>
      )}

      <Modal open={libraryOpen} onClose={() => setLibraryOpen(false)} title="انتخاب تصویر یا فایل متحرک از کتابخانه رسانه" size="lg">
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
                className="rounded-lg border border-(--theme-primary)/30 bg-(--theme-primary)/5 px-3 py-1.5 text-xs font-semibold text-(--theme-primary) hover:bg-(--theme-primary)/15"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {loadingLibrary ? (
            <p className="py-8 text-center text-xs text-slate-500">در حال بارگذاری رسانه...</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {mediaItems
                .filter((m) => /\.(png|jpe?g|webp|gif|mp4|webm|svg)$/i.test(m.url))
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.url);
                      setLibraryOpen(false);
                    }}
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 text-start hover:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-slate-900">
                      {isVideoMediaUrl(item.url) ? (
                        <video src={item.url} muted loop autoPlay playsInline className="h-full w-full object-contain" />
                      ) : (
                        <ZeroBrokenImage src={item.url} alt={item.name} className="h-full w-full object-contain" />
                      )}
                    </div>
                    <div className="mt-1.5 truncate text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                      {item.name}
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
