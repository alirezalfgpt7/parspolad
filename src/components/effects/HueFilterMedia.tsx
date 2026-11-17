import React from 'react';
import { cn } from '../../utils/i18n.ts';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';
import './HueFilterMedia.css';

interface HueFilterMediaProps extends React.ComponentProps<typeof ZeroBrokenImage> {
  mode?: 'hue-circle' | 'grayscale-reveal';
}

/**
 * Effect 052: Animating CSS Filter
 * Supports either circular continuous 360-deg hue-rotate cycle on hover or subtle grayscale-to-color reveal.
 */
export const HueFilterMedia: React.FC<HueFilterMediaProps> = ({
  mode = 'hue-circle',
  className,
  ...props
}) => (
  <ZeroBrokenImage
    {...props}
    className={cn(
      mode === 'hue-circle' ? 'effect-hue-circle' : 'effect-filter-image',
      className
    )}
  />
);
