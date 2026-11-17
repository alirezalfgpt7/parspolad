import { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore.ts';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.ts';

/**
 * Effect 050: Scrolling Title Effect
 * Gently scrolls the brand & page title in document.title when the browser tab becomes inactive,
 * restoring the clean SEO page title immediately upon focus.
 */
export const ScrollingTitleEffect: React.FC = () => {
  const { bootstrap, language } = useAppStore();
  const reducedMotion = usePrefersReducedMotion();
  const savedTitleRef = useRef<string>('');

  useEffect(() => {
    if (reducedMotion) return;

    const brand = (language === 'fa' ? bootstrap?.company?.name_fa : bootstrap?.company?.name_en)
      || (language === 'fa' ? 'پارس پولاد آقایی' : 'Pars Poolad Aghaee');
    const slogan = (language === 'fa' ? bootstrap?.company?.slogan_fa : bootstrap?.company?.slogan_en)
      || (language === 'fa' ? 'تجهیزات سرچاهی و درون‌چاهی صنعت نفت' : 'Wellhead & Downhole Engineering');

    let timerId: number | null = null;

    const stopScroll = () => {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
      if (savedTitleRef.current) {
        document.title = savedTitleRef.current;
      }
    };

    const startScroll = () => {
      stopScroll();
      savedTitleRef.current = document.title || brand;
      const ticker = `  ★ ${brand} — ${slogan}  |  `;
      const repeated = ticker.repeat(4);
      const winLen = 28;
      let cursor = 0;

      timerId = window.setInterval(() => {
        document.title = repeated.slice(cursor, cursor + winLen);
        cursor += 1;
        if (cursor > repeated.length - winLen) {
          cursor = 0;
        }
      }, 170);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        startScroll();
      } else {
        stopScroll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      stopScroll();
    };
  }, [bootstrap?.company?.name_en, bootstrap?.company?.name_fa, bootstrap?.company?.slogan_en, bootstrap?.company?.slogan_fa, language, reducedMotion]);

  return null;
};
