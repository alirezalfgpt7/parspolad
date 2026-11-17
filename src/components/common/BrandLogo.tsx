import React, { useId, useState } from 'react';
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

  const resolvedUrl =
    (overrideUrl && overrideUrl.trim()) ||
    previewLogos?.[placement] ||
    logos?.[placement] ||
    legacyFallback ||
    DEFAULT_BRAND_LOGOS[placement];

  const isVideo = isVideoMediaUrl(resolvedUrl) && !videoFailed;

  return (
    <span className={cn('relative inline-flex items-center justify-center overflow-hidden', className)}>
      {placement === 'about' && (
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
          src={resolvedUrl}
          autoPlay
          muted
          loop
          playsInline
          aria-label={alt || undefined}
          aria-hidden={!alt}
          onError={() => setVideoFailed(true)}
          style={placement === 'about' ? { filter: `url(#${whiteBackgroundFilterId})` } : undefined}
          className={cn(
            'h-full w-full object-contain',
            placement === 'about' && 'scale-200',
            hueHover && 'effect-hue-circle',
            imgClassName
          )}
        />
      ) : (
        <ZeroBrokenImage
          src={resolvedUrl}
          alt={alt}
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
