import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { InlineLoader } from '../common/InlineLoader.tsx';
import { cn } from '../../utils/i18n.ts';
import { apiRequest } from '../../services/api.ts';

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
  appearance?: 'default' | 'glass';
  mode?: 'standard' | 'mixed';
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
  appearance = 'default',
  mode = 'standard',
}) => {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [loadError, setLoadError] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let active = true;
    setChallenge(null);
    setLoadError('');
    setImageError(false);
    onKeyChange('');

    const challengeRequest = mode === 'mixed'
      ? apiRequest<unknown>('/captcha/challenge', { cache: 'no-store' })
      : fetch('/captcha/api/public', {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        }).then(async (response) => {
          if (!response.ok) {
            throw new Error(`CAPTCHA request failed with status ${response.status}`);
          }
          return response.json();
        });

    challengeRequest
      .then((payload: unknown) => {
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
  }, [refreshToken, onKeyChange, mode]);

  return (
    <div className={cn('space-y-2', appearance === 'glass' && 'auth-glass-captcha')}>
      <label htmlFor={registration.name} className="block text-xs font-medium">
        {mode === 'mixed'
          ? 'عبارت یا حروف داخل تصویر را وارد کنید'
          : 'کد امنیتی را از تصویر وارد کنید'}
      </label>
      <div className="flex flex-wrap items-center gap-3">
        {challenge && !imageError ? (
          <img
            src={challenge.img}
            alt="تصویر کد امنیتی"
            onError={() => setImageError(true)}
            className={cn(
              'h-14 w-56 max-w-full rounded-lg border object-contain',
              appearance === 'glass'
                ? 'border-white/20 bg-white/10'
                : 'border-(--theme-border) bg-(--theme-surface-muted)'
            )}
          />
        ) : (
          <div
            className={cn(
              'flex h-14 w-56 max-w-full items-center justify-center rounded-lg border text-xs',
              appearance === 'glass'
                ? 'border-white/20 bg-white/5 text-slate-300'
                : 'border-(--theme-border) bg-(--theme-surface-muted) text-(--theme-text-muted)'
            )}
          >
            {loadError || imageError
              ? 'تصویر امنیتی بارگذاری نشد'
              : <InlineLoader label="در حال بارگذاری تصویر امنیتی..." />}
          </div>
        )}
        <button
          type="button"
          onClick={onRefresh}
          aria-label="تولید تصویر امنیتی جدید"
          className={cn(
            'inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors',
            appearance === 'glass'
              ? 'border-white/20 bg-white/5 text-white hover:bg-white/10'
              : 'border-(--theme-border) bg-(--theme-surface) text-(--theme-text) hover:bg-(--theme-surface-muted)'
          )}
        >
          <RefreshCw className="h-4 w-4" />
          تصویر جدید
        </button>
      </div>
      <input
        {...registration}
        id={registration.name}
        type="text"
        inputMode="text"
        autoComplete="off"
        dir="ltr"
        maxLength={20}
        aria-invalid={Boolean(error)}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-sm',
          appearance === 'glass'
            ? 'auth-glass-input text-white'
            : 'border-(--theme-input-border) bg-(--theme-input-bg) text-(--theme-input-text) placeholder:text-(--theme-placeholder) focus:border-(--theme-primary) focus:outline-none'
        )}
      />
      {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
      {loadError && (
        <p role="alert" className="text-xs text-red-500">
          دریافت CAPTCHA ناموفق بود. برای تلاش دوباره «تصویر جدید» را بزنید.
        </p>
      )}
    </div>
  );
};
