import React, { useEffect, useId, useState } from 'react';
import { useAppStore } from '../../store/useAppStore.ts';
import type { LogoPlacement } from '../../types/index.ts';
import { DEFAULT_BRAND_LOGOS, isVideoMediaUrl } from '../../utils/brandingDefaults.ts';
import { cn } from '../../utils/i18n.ts';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';

interface BrandLogoProps {
  placement?: LogoPlacement;
  overrideUrl?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  hueHover?: boolean;
  removeWhiteBackground?: boolean;
}

/**
 * Unified brand emblem renderer supporting PNG, JPG, WEBP, SVG, animated GIF, and looping MP4/WEBM videos.
 * Resolves live preview overrides -> bootstrap.logos -> company legacy logo URLs -> built-in fallbacks.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  placement = 'navbar',
  overrideUrl,
  alt = '',
  className,
  imgClassName,
  hueHover = false,
  removeWhiteBackground: removeWhiteBackgroundOverride,
}) => {
  const previewLogos = useAppStore((s) => s.previewLogos);
  const logos = useAppStore((s) => s.bootstrap?.logos);
  const company = useAppStore((s) => s.bootstrap?.company);
  const [videoFailed, setVideoFailed] = useState(false);
  const whiteBackgroundFilterId = useId().replace(/:/g, '');

  const legacyFallback =
    placement === 'footer' || placement === 'seo_share'
      ? company?.logo_url || company?.logo_small_url
      : company?.logo_small_url || company?.logo_url;
  const configuredLogo = logos?.[placement];
  const smallLogoPlacement = placement === 'navbar' || placement === 'admin_sidebar';
  const configuredLogoOverride =
    smallLogoPlacement && configuredLogo === DEFAULT_BRAND_LOGOS[placement]
      ? undefined
      : configuredLogo;

  const resolvedUrl =
    (overrideUrl && overrideUrl.trim()) ||
    previewLogos?.[placement] ||
    configuredLogoOverride ||
    legacyFallback ||
    DEFAULT_BRAND_LOGOS[placement];

  useEffect(() => {
    setVideoFailed(false);
  }, [resolvedUrl]);

  const isVideo = isVideoMediaUrl(resolvedUrl) && !videoFailed;
  const removeWhiteBackground = removeWhiteBackgroundOverride ?? (placement === 'about' || placement === 'admin_sidebar');
  const mediaSource = resolvedUrl;
  const whiteBackgroundFilter = removeWhiteBackground ? { filter: `url(#${whiteBackgroundFilterId})` } : undefined;

  return (
    <span className={cn(
      'relative inline-flex items-center justify-center overflow-hidden',
      placement === 'admin_sidebar' && isVideo && 'bg-slate-950/70',
      className
    )}>
      {removeWhiteBackground && (
        <svg aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
          <defs>
            <filter id={whiteBackgroundFilterId} colorInterpolationFilters="sRGB">
              <feColorMatrix
                type="matrix"
                values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 -0.5 -0.5 1 0"
              />
            </filter>
          </defs>
        </svg>
      )}
      {isVideo ? (
        <video
          key={resolvedUrl}
          src={mediaSource}
          autoPlay
          muted
          loop
          playsInline
          aria-label={alt || undefined}
          aria-hidden={!alt}
          onError={() => setVideoFailed(true)}
          style={whiteBackgroundFilter}
          className={cn(
            'h-full w-full object-contain',
            placement === 'about' && 'scale-200',
            placement === 'admin_sidebar' && 'scale-200',
            hueHover && 'effect-hue-circle',
            imgClassName
          )}
        />
      ) : (
        <ZeroBrokenImage
          src={mediaSource}
          alt={alt}
          style={whiteBackgroundFilter}
          className={cn(
            'h-full w-full object-contain',
            placement === 'about' && 'scale-200',
            hueHover && 'effect-hue-circle',
            imgClassName
          )}
        />
      )}
    </span>
  );
};
