import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore.ts';
import { normalizePreloaderSettings } from '../../utils/brandingDefaults.ts';
import { PagePreloader } from './PagePreloader.tsx';

export const HomeNavigationPreloader: React.FC = () => {
  const { pathname } = useLocation();
  const cachedPreloader = useAppStore((state) => state.cachedPreloader);
  const duration = normalizePreloaderSettings(cachedPreloader).initial_display_duration_ms;
  const [visible, setVisible] = useState(false);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    if (pathname !== '/' && pathname !== '/admin') {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), duration);
    return () => window.clearTimeout(timeout);
  }, [duration, pathname]);

  return visible ? <PagePreloader fullScreen label="در حال آماده‌سازی پرتال..." /> : null;
};
