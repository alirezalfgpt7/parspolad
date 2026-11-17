import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/i18n.ts';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.ts';
import './RotatingText.css';

export type RotationAxisMode = 'combined' | 'rotate-x' | 'rotate-y' | 'rotate-z' | 'wobble';

interface RotatingTextProps {
  items: string[];
  className?: string;
  intervalMs?: number;
  initialMode?: RotationAxisMode;
  showController?: boolean;
}

const MODE_LABELS: Record<RotationAxisMode, string> = {
  combined: '3D',
  'rotate-x': 'X',
  'rotate-y': 'Y',
  'rotate-z': 'Z',
  wobble: 'Wobble',
};

/**
 * Effect 063: 3D Rotating Text Controller
 */
export const RotatingText: React.FC<RotatingTextProps> = ({
  items,
  className,
  intervalMs = 3200,
  initialMode = 'combined',
  showController = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState<RotationAxisMode>(initialMode);
  const reduceMotion = usePrefersReducedMotion();
  const visibleItems = items.map((item) => item.trim()).filter(Boolean);

  useEffect(() => {
    if (reduceMotion || visibleItems.length < 2) {
      setActiveIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % visibleItems.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, reduceMotion, visibleItems.length]);

  if (visibleItems.length === 0) return null;

  const index = activeIndex < visibleItems.length ? activeIndex : 0;

  return (
    <span className="effect-3d-text-stage">
      <span className={cn('effect-3d-text-scene', className)} aria-hidden={!showController}>
        <span
          key={`${index}-${mode}`}
          data-mode={mode}
          className="effect-rotating-text-3d"
        >
          {visibleItems[index]}
        </span>
      </span>
      {showController && (
        <span className="effect-3d-controller-bar">
          {(Object.keys(MODE_LABELS) as RotationAxisMode[]).map((m) => (
            <button
              key={m}
              type="button"
              data-active={mode === m}
              onClick={() => setMode(m)}
              className="effect-3d-controller-btn"
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </span>
      )}
    </span>
  );
};
