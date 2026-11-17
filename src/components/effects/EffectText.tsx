import React from 'react';
import { cn } from '../../utils/i18n.ts';

interface EffectTextProps {
  children: React.ReactNode;
  className?: string;
  inverse?: boolean;
}

export const EffectText: React.FC<EffectTextProps> = ({ children, className, inverse = false }) => (
  <span className={cn(inverse ? 'effect-brand-text-inverse' : 'effect-brand-text', className)}>
    {children}
  </span>
);
