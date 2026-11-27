import React from 'react';
import { cn } from '../../utils/i18n.ts';
import './Spinners.css';

interface QuartetSpinnerEffectProps {
  className?: string;
  size?: number;
}

/**
 * Effect 025: CSS Spinner Animation (Quartet Orbit)
 */
export const QuartetSpinnerEffect: React.FC<QuartetSpinnerEffectProps> = ({ className, size }) => (
  <div
    className={cn('effect-spinner-quartet', className)}
    style={size === undefined ? undefined : { width: size, height: size }}
    aria-hidden="true"
  >
    <span />
    <span />
    <span />
    <span />
  </div>
);

interface Win11BootSpinnerEffectProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const win11Sizes = {
  sm: 'text-[16px]',
  md: 'text-[28px]',
  lg: 'text-[52px]',
};

/**
 * Effect 057: Windows 11 Boot Spinner
 */
export const Win11BootSpinnerEffect: React.FC<Win11BootSpinnerEffectProps> = ({
  size = 'sm',
  className,
}) => (
  <span className={cn('effect-win11-spinner', win11Sizes[size], className)} aria-hidden="true">
    <span className="effect-win11-dot" />
    <span className="effect-win11-dot" />
    <span className="effect-win11-dot" />
    <span className="effect-win11-dot" />
    <span className="effect-win11-dot" />
  </span>
);
