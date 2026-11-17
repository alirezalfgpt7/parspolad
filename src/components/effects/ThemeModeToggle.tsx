import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../../utils/i18n.ts';
import './ThemeModeToggle.css';

interface ThemeModeToggleProps {
  dark: boolean;
  onToggle: () => void;
  label?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Effect 032: Light / Dark Mode Toggle
 * Morphs 8-ray glowing sun directly into a crescent moon pill indicator.
 */
export const ThemeModeToggle: React.FC<ThemeModeToggleProps> = ({
  dark,
  onToggle,
  label,
  compact = false,
  className,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={dark}
    aria-label={label || (dark ? 'حالت روشن' : 'حالت تیره')}
    data-dark={dark}
    onClick={onToggle}
    className={cn('effect-theme-switch', className)}
  >
    <span className="effect-theme-pill" aria-hidden="true">
      <span className="effect-theme-knob">
        {dark
          ? <Moon className="effect-theme-icon effect-theme-icon-moon" />
          : <Sun className="effect-theme-icon effect-theme-icon-sun" />}
      </span>
    </span>
    {!compact && label && (
      <span className="text-xs font-medium">{label}</span>
    )}
  </button>
);
