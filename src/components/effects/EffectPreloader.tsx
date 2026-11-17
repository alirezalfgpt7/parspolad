import React from 'react';
import { cn } from '../../utils/i18n.ts';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';
import { AnimatedBackground } from './AnimatedBackground.tsx';
import { EffectText } from './EffectText.tsx';

interface EffectPreloaderProps {
  label: string;
  fullScreen?: boolean;
}

export const EffectPreloader: React.FC<EffectPreloaderProps> = ({
  label,
  fullScreen = false,
}) => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className={cn(
      'effect-preloader relative flex flex-col items-center justify-center gap-5 overflow-hidden',
      fullScreen
        ? 'fixed inset-0 z-100 min-h-dvh bg-slate-950 text-white'
        : 'min-h-48 w-full text-slate-700 dark:text-slate-200'
    )}
  >
    {fullScreen && (
      <>
        <AnimatedBackground />
        <div className="effect-preloader-vignette pointer-events-none absolute inset-0" />
      </>
    )}

    <div className="effect-loader-scene relative z-10 grid h-28 w-28 place-items-center" aria-hidden="true">
      <div className="effect-spinner-quartet">
        {[0, 1, 2, 3].map((dot) => <span key={dot} />)}
      </div>
      <div className="effect-preloader-logo-frame">
        <ZeroBrokenImage
          src="/storage/logos/preloader.gif"
          alt=""
          className="effect-preloader-logo"
          loading="eager"
        />
      </div>
    </div>

    <EffectText inverse={fullScreen} className="relative z-10 text-sm font-medium tracking-wide">
      {label}
    </EffectText>
    <div className="relative z-10 flex items-center gap-1.5" aria-hidden="true">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          style={{ animationDelay: `${dot * 140}ms` }}
          className="effect-loader-dot h-1.5 w-1.5 rounded-full bg-red-400"
        />
      ))}
    </div>
  </div>
);
