import React from 'react';
import { mediaUrl } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { PreloaderModeSettings } from '../../types/index.ts';
import { isVideoMediaUrl, normalizePreloaderSettings } from '../../utils/brandingDefaults.ts';
import { cn } from '../../utils/i18n.ts';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { AnimatedBackground } from './AnimatedBackground.tsx';
import { EffectText } from './EffectText.tsx';
import { QuartetSpinnerEffect } from './Spinners.tsx';

interface EffectPreloaderProps {
  label: string;
  fullScreen?: boolean;
  mode?: 'initial' | 'internal';
  modeSettings?: PreloaderModeSettings;
  className?: string;
}

const getSizeBreakpoint = (width: number): 'mobile' | 'tablet' | 'desktop' => (
  width >= 1024 ? 'desktop' : width >= 640 ? 'tablet' : 'mobile'
);

export const EffectPreloader: React.FC<EffectPreloaderProps> = ({
  label,
  fullScreen = false,
  mode,
  modeSettings,
  className,
}) => {
  const [viewport, setViewport] = React.useState(() => ({
    width: typeof window === 'undefined' ? 1280 : window.innerWidth,
    height: typeof window === 'undefined' ? 800 : window.innerHeight,
  }));
  const sizeBreakpoint = getSizeBreakpoint(viewport.width);
  const bootstrapSettings = useAppStore((state) => state.bootstrap?.preloader);
  const previewSettings = useAppStore((state) => state.previewPreloader);
  const cachedSettings = useAppStore((state) => state.cachedPreloader);
  const language = useAppStore((state) => state.language);
  const logos = useAppStore((state) => state.previewLogos || state.bootstrap?.logos);
  const settingsMode = mode || (fullScreen ? 'initial' : 'internal');
  const settings = modeSettings || normalizePreloaderSettings(previewSettings || bootstrapSettings || cachedSettings)[settingsMode];

  React.useEffect(() => {
    const updateViewport = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  if (!settings.enabled) return null;

  const customLabel = language === 'fa' ? settings.text_fa : settings.text_en;
  const resolvedLabel = customLabel.trim() || label;
  const backgroundMedia = settings.show_background_media ? settings.background_image.trim() : '';
  const backgroundVideo = isVideoMediaUrl(backgroundMedia);
  const logoUrl = settings.logo_url.trim() || logos?.preloader || '';
  const contentEnabled = settings.display_mode === 'full';
  const showLogo = contentEnabled && settings.show_logo;
  const showSpinner = contentEnabled && settings.show_spinner;
  const showText = contentEnabled && settings.show_text;
  const showDots = contentEnabled && settings.show_dots;
  const showScene = showLogo || showSpinner;
  const transparentBackground = settings.background_color === 'transparent';
  const configuredLogoSize = settings[`logo_size_${sizeBreakpoint}`];
  const maxLogoSize = Math.min(viewport.height * 0.64, viewport.width * 0.9);
  const logoSize = fullScreen
    ? Math.max(32, Math.round(Math.min(
        maxLogoSize,
        Math.min(viewport.height * 0.32, viewport.width * 0.68) * configuredLogoSize / 128,
      )))
    : configuredLogoSize;
  const textSize = settings[`text_size_${sizeBreakpoint}`];
  const spinnerSize = showSpinner ? Math.max(112, showLogo ? Math.round(logoSize * 1.35) : 112) : logoSize;
  const style = {
    backgroundColor: transparentBackground ? undefined : settings.background_color,
    '--preloader-active-text-size': `${textSize}px`,
  } as React.CSSProperties;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={showText ? resolvedLabel : 'در حال بارگذاری'}
      style={style}
      className={cn(
        'effect-preloader relative flex flex-col items-center justify-center gap-5 overflow-hidden',
        fullScreen
          ? cn('fixed inset-0 z-100 min-h-dvh text-white', !transparentBackground && 'bg-slate-950')
          : 'min-h-48 w-full text-slate-700 dark:text-slate-200',
        className,
      )}
    >
      {backgroundMedia && (backgroundVideo ? (
        <video
          src={mediaUrl(backgroundMedia)}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <img
          src={mediaUrl(backgroundMedia)}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      ))}
      {backgroundMedia && !transparentBackground && settings.background_overlay_opacity > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: `rgba(2, 6, 23, ${Math.min(100, Math.max(0, settings.background_overlay_opacity)) / 100})` }}
        />
      )}
      {!transparentBackground && settings.show_particles && <AnimatedBackground particles />}
      {fullScreen && !transparentBackground && settings.show_particles && (
        <div className="effect-preloader-vignette pointer-events-none absolute inset-0" />
      )}

      {showScene && (
        <div
          className="effect-loader-scene relative z-10 grid place-items-center"
          style={{
            width: `${spinnerSize}px`,
            height: `${spinnerSize}px`,
          }}
          aria-hidden="true"
        >
          {showSpinner && <QuartetSpinnerEffect size={spinnerSize} />}
          {showLogo && (
            <div
              className={cn('effect-preloader-logo-frame', !settings.show_logo_frame && 'effect-preloader-logo-frame--plain')}
              style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
            >
              <BrandLogo
                placement="preloader"
                overrideUrl={logoUrl ? mediaUrl(logoUrl) : undefined}
                removeWhiteBackground={settings.remove_logo_background}
                className="h-full w-full"
                imgClassName="effect-preloader-logo object-contain"
              />
            </div>
          )}
        </div>
      )}

      {showText && (settings.text_color ? (
        <p className="effect-preloader-label relative z-10 font-medium tracking-wide" style={{ color: settings.text_color }}>
          {resolvedLabel}
        </p>
      ) : (
        <EffectText inverse={fullScreen} className="effect-preloader-label relative z-10 font-medium tracking-wide">
          {resolvedLabel}
        </EffectText>
      ))}
      {showDots && (
        <div className="relative z-10 flex items-center gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              style={{ animationDelay: `${dot * 140}ms` }}
              className="effect-loader-dot h-1.5 w-1.5 rounded-full bg-red-400"
            />
          ))}
        </div>
      )}
    </div>
  );
};
