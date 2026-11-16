import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface CaptchaChallenge {
  key: string;
  img: string;
}

interface SelfHostedCaptchaProps {
  registration: UseFormRegisterReturn;
  refreshToken: number;
  onKeyChange: (key: string) => void;
  onRefresh: () => void;
  error?: string;
}

function isCaptchaChallenge(value: unknown): value is CaptchaChallenge {
  return typeof value === 'object'
    && value !== null
    && 'key' in value
    && typeof value.key === 'string'
    && 'img' in value
    && typeof value.img === 'string';
}

export const SelfHostedCaptcha: React.FC<SelfHostedCaptchaProps> = ({
  registration,
  refreshToken,
  onKeyChange,
  onRefresh,
  error,
}) => {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    setChallenge(null);
    setLoadError('');
    onKeyChange('');

    fetch('/captcha/api/public', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`CAPTCHA request failed with status ${response.status}`);
        }

        const payload: unknown = await response.json();
        if (!isCaptchaChallenge(payload)) {
          throw new TypeError('CAPTCHA response did not contain an image and challenge key.');
        }

        if (active) {
          setChallenge(payload);
          onKeyChange(payload.key);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setLoadError(cause instanceof Error ? cause.message : 'خطا در دریافت کد امنیتی');
        }
      });

    return () => {
      active = false;
    };
  }, [refreshToken, onKeyChange]);

  return (
    <div className="space-y-2">
      <label htmlFor={registration.name} className="block text-xs font-medium">
        کد امنیتی را از تصویر وارد کنید
      </label>
      <div className="flex flex-wrap items-center gap-3">
        {challenge ? (
          <img
            src={challenge.img}
            alt="تصویر کد امنیتی"
            className="h-19 w-75 max-w-full rounded-lg border border-slate-200 bg-slate-100 object-contain dark:border-slate-700"
          />
        ) : (
          <div className="flex h-19 w-75 max-w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800">
            {loadError ? 'تصویر امنیتی بارگذاری نشد' : 'در حال بارگذاری تصویر امنیتی...'}
          </div>
        )}
        <button
          type="button"
          onClick={onRefresh}
          aria-label="تولید تصویر امنیتی جدید"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          تصویر جدید
        </button>
      </div>
      <input
        {...registration}
        id={registration.name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        dir="ltr"
        maxLength={3}
        aria-invalid={Boolean(error)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
      />
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
      {loadError && (
        <p role="alert" className="text-xs text-red-600">
          دریافت CAPTCHA ناموفق بود. برای تلاش دوباره «تصویر جدید» را بزنید.
        </p>
      )}
    </div>
  );
};
