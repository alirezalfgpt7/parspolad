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
  const trackItems = items.length >= 2 ? [...items, ...items] : items;

  return (
    <div dir="ltr" className={cn('effect-brand-strip', className)}>
      <div className="effect-brand-track">
        {trackItems.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="effect-brand-slide">
            <ZeroBrokenImage
              src={item.logoUrl}
              alt={item.name}
              className="rounded-md bg-white/90 p-1"
            />
            <span className="effect-brand-slide-name">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
