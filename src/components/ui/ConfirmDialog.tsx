import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal.tsx';
import { InlineLoader } from '../common/InlineLoader.tsx';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'تایید عملیات',
  message,
  confirmLabel = 'بله، انجام شود',
  cancelLabel = 'انصراف',
  loading = false,
}) => {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-red-50 p-2.5 text-red-700 dark:bg-red-950/60 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{message}</p>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 whitespace-nowrap"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-800 disabled:opacity-60 whitespace-nowrap"
        >
          {loading ? <InlineLoader label="در حال اجرا..." /> : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
