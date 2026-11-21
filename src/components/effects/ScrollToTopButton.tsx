import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.ts';

export const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const shouldReduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 360);

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  return visible ? (
    <button
      type="button"
      aria-label="بازگشت به بالای صفحه"
      title="بازگشت به بالا"
      onClick={() => window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' })}
      className="effect-scroll-top fixed bottom-6 left-5 z-40 grid h-12 w-12 place-items-center rounded-2xl border border-(--theme-border-strong) bg-(--theme-primary) text-(--theme-primary-foreground) shadow-lg shadow-slate-950/20 transition-colors hover:bg-(--theme-primary-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--theme-primary) focus-visible:ring-offset-2 focus-visible:ring-offset-(--theme-bg)"
    >
      <ArrowUp className="h-5 w-5" strokeWidth={2.2} />
    </button>
  ) : null;
};
