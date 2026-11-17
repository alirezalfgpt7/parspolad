import React from 'react';
import { cn } from '../../utils/i18n.ts';

interface GlassPanelEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: 'subtle' | 'strong';
}

/**
 * Effect 035: Glass Effect
 * Frosted glass surface with specular upper rim highlight and backdrop blur.
 */
export const GlassPanelEffect: React.FC<GlassPanelEffectProps> = ({
  intensity = 'strong',
  className,
  ...props
}) => (
  <div
    {...props}
    className={cn(
      'effect-auth-card effect-glass',
      intensity === 'subtle' ? 'backdrop-blur-md' : 'backdrop-blur-xl',
      className
    )}
  />
);
