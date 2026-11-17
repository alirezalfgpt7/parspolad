import React from 'react';
import { cn } from '../../utils/i18n.ts';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';
import './CssSlideshowEffect.css';

interface CssSlideshowEffectProps {
  images: string[];
  className?: string;
  intervalPerSlideSeconds?: number;
}

/**
 * Effect 041: Image Slideshow In CSS
 * Pure keyframe cross-fade + soft zoom slideshow layered neatly inside relative containers.
 */
export const CssSlideshowEffect: React.FC<CssSlideshowEffectProps> = ({
  images,
  className,
  intervalPerSlideSeconds = 5,
}) => {
  const validImages = images.filter(Boolean);
  if (validImages.length === 0) return null;
  const totalDuration = Math.max(validImages.length, 1) * intervalPerSlideSeconds;

  return (
    <div className={cn('effect-css-slideshow', className)} aria-hidden="true">
      {validImages.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className="effect-css-slide"
          style={
            validImages.length > 1
              ? {
                  animationDuration: `${totalDuration}s`,
                  animationDelay: `${index * intervalPerSlideSeconds}s`,
                }
              : { opacity: 1, animation: 'none' }
          }
        >
          <ZeroBrokenImage src={src} alt="" className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
};
