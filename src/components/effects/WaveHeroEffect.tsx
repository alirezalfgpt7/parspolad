import React, { useId } from 'react';
import { cn } from '../../utils/i18n.ts';
import './WaveHeroEffect.css';

interface WaveHeroEffectProps {
  className?: string;
  heightClassName?: string;
  bottomFill?: string;
  tintRgb?: string;
  tintColor?: string;
  waveColors?: readonly [string, string, string];
  flipVertical?: boolean;
}

/**
 * Effect 002: Simple CSS Waves Hero
 * Renders 4 layered sinusoidal wave paths moving smoothly horizontally via GPU translate3d.
 */
export const WaveHeroEffect: React.FC<WaveHeroEffectProps> = ({
  className,
  heightClassName,
  bottomFill = 'var(--theme-bg)',
  tintRgb = '255 255 255',
  tintColor,
  waveColors,
  flipVertical = false,
}) => {
  const pathId = useId();
  const tintFill = (opacity: number) => tintColor
    ? `color-mix(in srgb, ${tintColor} ${Math.round(opacity * 100)}%, transparent)`
    : `rgb(${tintRgb} / ${opacity})`;
  const layerFill = (index: 0 | 1 | 2, opacity: number) => waveColors
    ? `color-mix(in srgb, ${waveColors[index]} ${Math.round(opacity * 100)}%, transparent)`
    : tintFill(opacity);

  return (
    <div
      className={cn(
        'effect-waves-wrapper',
        flipVertical && 'rotate-180',
        className
      )}
      aria-hidden="true"
    >
      <svg
        className={cn('effect-waves-svg', heightClassName)}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
        shapeRendering="auto"
      >
        <defs>
          <path
            id={pathId}
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
          />
        </defs>
        <g className="effect-waves-parallax">
          <use xlinkHref={`#${pathId}`} href={`#${pathId}`} x="48" y="0" fill={layerFill(0, 0.28)} />
          <use xlinkHref={`#${pathId}`} href={`#${pathId}`} x="48" y="3" fill={layerFill(1, 0.20)} />
          <use xlinkHref={`#${pathId}`} href={`#${pathId}`} x="48" y="5" fill={layerFill(2, 0.14)} />
          <use xlinkHref={`#${pathId}`} href={`#${pathId}`} x="48" y="7" fill={bottomFill} />
        </g>
      </svg>
    </div>
  );
};
