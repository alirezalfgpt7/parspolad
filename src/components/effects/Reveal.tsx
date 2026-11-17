import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/i18n.ts';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.ts';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const Reveal: React.FC<RevealProps> = ({ children, className, delay = 0 }) => {
  const shouldReduceMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(shouldReduceMotion);

  useEffect(() => {
    const element = ref.current;
    if (!element || shouldReduceMotion || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });

    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldReduceMotion]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shouldReduceMotion ? '0ms' : `${delay}s` }}
      className={cn('effect-reveal', visible && 'is-visible', className)}
    >
      {children}
    </div>
  );
};
