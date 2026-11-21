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
        style={{
          borderColor: 'var(--theme-footer-border)',
          backgroundColor: 'var(--theme-footer-surface)',
          color: 'var(--theme-footer-text)',
        }}
        className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-opacity hover:opacity-85 whitespace-nowrap"
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
          style={{
            borderColor: 'var(--theme-footer-border)',
            backgroundColor: 'var(--theme-footer-surface)',
            color: 'var(--theme-footer-text)',
          }}
          className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-opacity hover:opacity-85 whitespace-nowrap"
        >
          <Download className="h-3.5 w-3.5" />
          <span>{t.installApp}</span>
        </button>
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="theme-solid-surface w-full max-w-sm rounded-xl border border-(--theme-border) bg-(--theme-surface) p-6 text-(--theme-text) shadow-2xl">
              <h3 className="text-base font-bold">نصب وب‌اپلیکیشن در iOS</h3>
              <p className="mt-2 text-sm leading-relaxed text-(--theme-text-muted)">
                ۱. دکمه <strong>Share</strong> را در نوار مرورگر Safari لمس کنید.<br />
                ۲. گزینه <strong>Add to Home Screen</strong> را انتخاب نمایید.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-(--theme-primary) py-2 text-sm font-medium text-(--theme-primary-foreground)"
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
