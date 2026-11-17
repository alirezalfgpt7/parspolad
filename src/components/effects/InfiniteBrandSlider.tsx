import React from 'react';
import { cn } from '../../utils/i18n.ts';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';
import './InfiniteBrandSlider.css';

export interface BrandSliderItem {
  id: string | number;
  name: string;
  logoUrl: string;
  sector?: string;
}

interface InfiniteBrandSliderProps {
  items: BrandSliderItem[];
  className?: string;
}

/**
 * Effect 067: Infinite Brand Logo Strip Slider
 * Grayscale logos morphing to vivid full color with subtle hover zoom inside a floating surface strip.
 */
export const InfiniteBrandSlider: React.FC<InfiniteBrandSliderProps> = ({ items, className }) => {
  if (items.length === 0) return null;
  const shouldLoop = items.length >= 2;

  return (
    <div dir="ltr" className={cn('effect-brand-strip', className)}>
      <div className="effect-brand-track" data-loop={shouldLoop}>
        {[0, ...(shouldLoop ? [1] : [])].map((copy) => (
          <div key={copy} className="effect-brand-group">
            {items.map((item) => (
              <div key={item.id} className="effect-brand-slide">
                <ZeroBrokenImage
                  src={item.logoUrl}
                  alt={item.name}
                  className="rounded-md bg-white/90 p-1"
                />
                <span className="effect-brand-slide-name">{item.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
