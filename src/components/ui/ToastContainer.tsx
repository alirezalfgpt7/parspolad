import React from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.ts';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 end-4 z-50 flex max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const Icon = t.type === 'success' ? CheckCircle2 : t.type === 'error' ? XCircle : Info;
        const colors =
          t.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100'
            : t.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100'
              : 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

        return (
          <div
            key={t.id}
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${colors}`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t.text}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="rounded p-0.5 opacity-60 hover:opacity-100"
              aria-label="بستن"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
