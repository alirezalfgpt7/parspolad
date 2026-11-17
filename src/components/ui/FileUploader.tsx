import React, { useRef, useState } from 'react';
import { FileCheck2, Upload } from 'lucide-react';
import { apiRequest, fileToBase64 } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { MediaFile } from '../../types/index.ts';

interface FileUploaderProps {
  folder?: string;
  accept?: string;
  label?: string;
  onUploaded: (url: string, media?: MediaFile) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  folder = 'uploads',
  accept = '.pdf,.docx,.xlsx,.dwg,.zip,.mp4,.webm,.jpg,.jpeg,.png,.webp',
  label = 'انتخاب یا رها کردن فایل (PDF, DOCX, XLSX, DWG, ZIP, MP4, WEBM, JPG, PNG, WEBP)',
  onUploaded,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const addToast = useAppStore((s) => s.addToast);

  const handleFile = async (file?: File) => {
    if (!file) return;
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

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
      }}
      onClick={() => inputRef.current?.click()}
      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-5 text-center transition-colors hover:border-(--theme-primary) hover:bg-slate-100/60 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {uploadedName ? (
        <FileCheck2 className="h-6 w-6 text-emerald-600" />
      ) : (
        <Upload className="h-6 w-6 text-slate-400" />
      )}
      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
        {uploading ? 'در حال آپلود و اعتبارسنجی فایل...' : uploadedName || label}
      </p>
    </div>
  );
};
