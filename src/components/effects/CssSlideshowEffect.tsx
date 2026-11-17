import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/i18n.ts';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.ts';
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
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || validImages.length < 2) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % validImages.length);
    }, intervalPerSlideSeconds * 1000);

    return () => window.clearInterval(intervalId);
  }, [intervalPerSlideSeconds, reducedMotion, validImages.length]);

  if (validImages.length === 0) return null;

  return (
    <div className={cn('effect-css-slideshow', className)} aria-hidden="true">
      {validImages.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className="effect-css-slide"
          data-active={index === activeIndex}
        >
          <ZeroBrokenImage src={src} alt="" loading={index === activeIndex ? 'eager' : 'lazy'} className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
};
