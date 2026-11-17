import React from 'react';
import { cn } from '../../utils/i18n.ts';
import './DecorativeCube.css';

interface DecorativeCubeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  frontSymbol?: React.ReactNode;
}

/**
 * Effect 028: 3D Morphing Cube
 * 3D extruded rounded-corner glossy cube spinning across X/Y/Z axes inside perspective: 600px.
 */
export const DecorativeCube: React.FC<DecorativeCubeProps> = ({
  className,
  size = 'md',
  frontSymbol = 'P',
}) => (
  <div
    className={cn('effect-morph-cube-scene', `effect-cube-${size}`, className)}
    aria-hidden="true"
  >
    <div className="effect-morph-cube">
      <span className="effect-morph-cube-face effect-cube-front">{frontSymbol}</span>
      <span className="effect-morph-cube-face effect-cube-back" />
      <span className="effect-morph-cube-face effect-cube-right" />
      <span className="effect-morph-cube-face effect-cube-left" />
      <span className="effect-morph-cube-face effect-cube-top" />
      <span className="effect-morph-cube-face effect-cube-bottom" />
    </div>
  </div>
);
