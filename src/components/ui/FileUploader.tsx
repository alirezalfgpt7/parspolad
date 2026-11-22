import React, { useRef, useState } from 'react';
import { Camera, FileCheck2, FileText, Film, Image as ImageIcon, Upload } from 'lucide-react';
import { apiRequest, fileToBase64 } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { MediaFile } from '../../types/index.ts';
import { isVideoMediaUrl } from '../../utils/brandingDefaults.ts';
import { InlineLoader } from '../common/InlineLoader.tsx';
import { ZeroBrokenImage } from './ZeroBrokenImage.tsx';

interface FileUploaderProps {
  folder?: string;
  accept?: string;
  label?: string;
  currentUrl?: string;
  variant?: 'dropzone' | 'icon-button';
  onUploaded: (url: string, media?: MediaFile) => void;
}

const isImagePreview = (url: string): boolean =>
  /\.(png|jpe?g|webp|gif|svg|ico)(\?.*)?$/i.test(url) || url.startsWith('data:image/');

export const FileUploader: React.FC<FileUploaderProps> = ({
  folder = 'uploads',
  accept = '.pdf,.docx,.xlsx,.dwg,.zip,.mp4,.webm,.jpg,.jpeg,.png,.webp,.gif',
  label = 'انتخاب یا رها کردن فایل (JPG, PNG, WEBP, GIF, MP4, WEBM, PDF, DOCX, ZIP)',
  currentUrl,
  variant = 'dropzone',
  onUploaded,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string>('');
  const addToast = useAppStore((s) => s.addToast);

  const previewUrl = localPreview || currentUrl || '';

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      try {
        setLocalPreview(URL.createObjectURL(file));
      } catch {
        // ignore object URL failure
      }
    }
    setUploading(true);
    try {
      const b64 = await fileToBase64(file);
      const res = await apiRequest<{ data: MediaFile }>('/admin/media/upload', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          content_base64: b64,
          folder,
        }),
      });
      setUploadedName(file.name);
      addToast('success', `فایل «${file.name}» با موفقیت آپلود شد.`);
      onUploaded(res.data.url, res.data);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'خطا در آپلود فایل');
    } finally {
      setUploading(false);
    }
  };

  if (variant === 'icon-button') {
    return (
      <div className="absolute -bottom-1 -right-1 z-10">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          aria-label={uploading ? 'در حال آپلود تصویر پروفایل' : label}
          aria-busy={uploading}
          title={label}
          className="grid h-8 w-8 place-items-center rounded-full border-2 border-(--theme-card-surface) bg-(--theme-primary) text-(--theme-primary-foreground) shadow-md transition hover:bg-(--theme-primary-hover) disabled:cursor-wait disabled:opacity-70"
        >
          <Camera className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {previewUrl && (
        <div className="flex items-center gap-3 rounded-xl border border-(--theme-border) bg-(--theme-surface) p-2.5">
          <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-(--theme-border) bg-(--theme-surface-muted)">
            {isVideoMediaUrl(previewUrl) ? (
              <video
                src={previewUrl}
                muted
                loop
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
            ) : isImagePreview(previewUrl) ? (
              <ZeroBrokenImage src={previewUrl} alt="پیش‌نمایش" className="h-full w-full object-cover" />
            ) : (
              <FileText className="h-5 w-5 text-(--theme-text-muted)" />
            )}
          </div>
          <div className="min-w-0 flex-1 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-(--theme-text)">
              {isVideoMediaUrl(previewUrl) ? (
                <Film className="h-3.5 w-3.5 text-(--theme-primary-ink)" />
              ) : (
                <ImageIcon className="h-3.5 w-3.5 text-(--theme-primary-ink)" />
              )}
              <span>پیش‌نمایش فایل فعلی</span>
            </div>
            <div dir="ltr" className="mt-0.5 truncate font-mono text-[11px] text-(--theme-text-muted)">
              {previewUrl}
            </div>
          </div>
        </div>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-(--theme-border-strong) bg-(--theme-surface-muted) p-4 text-center transition-colors hover:border-(--theme-primary)"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {uploadedName ? (
          <FileCheck2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <Upload className="h-5 w-5 text-(--theme-text-muted)" />
        )}
        <p className="text-xs font-medium text-(--theme-text)">
          {uploading ? <InlineLoader label="در حال آپلود و اعتبارسنجی فایل..." /> : uploadedName || label}
        </p>
      </div>
    </div>
  );
};
