import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import { useT } from '../../utils/i18n.ts';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const language = useAppStore((s) => s.language);
  const t = useT(language);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-700 whitespace-nowrap"
      >
        <Download className="h-3.5 w-3.5" />
        <span>{t.installApp}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-700 whitespace-nowrap"
        >
          <Download className="h-3.5 w-3.5" />
          <span>{t.installApp}</span>
        </button>
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white">
              <h3 className="text-base font-bold">نصب وب‌اپلیکیشن در iOS</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                ۱. دکمه <strong>Share</strong> را در نوار مرورگر Safari لمس کنید.<br />
                ۲. گزینه <strong>Add to Home Screen</strong> را انتخاب نمایید.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-(--theme-primary) py-2 text-sm font-medium text-white"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
