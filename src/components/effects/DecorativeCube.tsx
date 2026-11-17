import React from 'react';
import { cn } from '../../utils/i18n.ts';

interface DecorativeCubeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DecorativeCube: React.FC<DecorativeCubeProps> = ({ className, size = 'md' }) => (
  <div className={cn('effect-decorative-cube-scene', `effect-cube-${size}`, className)} aria-hidden="true">
    <div className="effect-decorative-cube">
      <span className="effect-decorative-cube-front">P</span>
      <span className="effect-decorative-cube-back" />
      <span className="effect-decorative-cube-right" />
      <span className="effect-decorative-cube-left" />
      <span className="effect-decorative-cube-top" />
      <span className="effect-decorative-cube-bottom" />
    </div>
  </div>
);
