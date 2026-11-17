import React from 'react';
import { cn } from '../../utils/i18n.ts';
import './FlipAuthCardEffect.css';

interface FlipAuthCardEffectProps {
  flipped: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
}

/**
 * Effect 083: 3D Flip Login & Signup
 * CSS Grid overlay + rotateY(180deg) preserve-3d transition keeps natural card height cleanly
 * without clipping tall forms or needing brittle fixed heights.
 */
export const FlipAuthCardEffect: React.FC<FlipAuthCardEffectProps> = ({
  flipped,
  front,
  back,
  className,
}) => (
  <div
    className={cn('effect-flip-container', className)}
    data-flipped={flipped ? 'true' : 'false'}
  >
    <div className="effect-flipper">
      <div className="effect-flip-face effect-flip-face--front" aria-hidden={flipped}>
        {front}
      </div>
      <div className="effect-flip-face effect-flip-face--back" aria-hidden={!flipped}>
        {back}
      </div>
    </div>
  </div>
);
