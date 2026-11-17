import React from 'react';
import { cn } from '../../utils/i18n.ts';
import './AnimatedHamburger.css';

interface AnimatedHamburgerProps {
  open: boolean;
  className?: string;
}

export const AnimatedHamburger: React.FC<AnimatedHamburgerProps> = ({ open, className }) => (
  <span className={cn('effect-hamburger', className)} data-open={open} aria-hidden="true">
    <span />
    <span />
    <span />
  </span>
);

export type HamburgerCornerPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface FloatingHamburgerButtonProps {
  open: boolean;
  onClick: () => void;
  position?: HamburgerCornerPosition;
  ariaLabel?: string;
  className?: string;
}

const cornerClasses: Record<HamburgerCornerPosition, string> = {
  'top-right': 'fixed top-5 right-5 z-45',
  'top-left': 'fixed top-5 left-5 z-45',
  'bottom-right': 'fixed bottom-5 right-5 z-45',
  'bottom-left': 'fixed bottom-5 left-5 z-45',
};

/**
 * Effect 023: Positioned Floating Hamburger Menu Button
 */
export const FloatingHamburgerButton: React.FC<FloatingHamburgerButtonProps> = ({
  open,
  onClick,
  position = 'bottom-left',
  ariaLabel = 'منو',
  className,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    aria-expanded={open}
    className={cn(
      'effect-floating-hamburger-btn lg:hidden',
      cornerClasses[position],
      className
    )}
  >
    <AnimatedHamburger open={open} />
  </button>
);
