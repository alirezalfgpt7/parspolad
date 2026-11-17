import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/i18n.ts';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.ts';

interface RotatingTextProps {
  items: string[];
  className?: string;
  intervalMs?: number;
}

export const RotatingText: React.FC<RotatingTextProps> = ({
  items,
  className,
  intervalMs = 3200,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
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
    <span className={cn('effect-rotating-text-scene', className)} aria-hidden="true">
      <span key={index} className="effect-rotating-text">
        {visibleItems[index]}
      </span>
    </span>
  );
};
