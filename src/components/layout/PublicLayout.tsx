import React, { lazy, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore.ts';
import { PublicFooter } from './PublicFooter.tsx';
import { PublicInfoBar } from './PublicInfoBar.tsx';
import { PublicNavbar } from './PublicNavbar.tsx';
import { PageTransition } from '../effects/PageTransition.tsx';
import { ScrollToTopButton } from '../effects/ScrollToTopButton.tsx';
import { LiveChatWidget } from '../common/LiveChatWidget.tsx';

const MaintenancePage = lazy(() => import('../../pages/public/MiscPages.tsx').then((module) => ({ default: module.MaintenancePage })));
const HeroSlider = lazy(() => import('../slider/HeroSlider.tsx').then((module) => ({ default: module.HeroSlider })));

export const PublicLayout: React.FC = () => {
  const { bootstrap, user } = useAppStore();
  const { pathname } = useLocation();
  const canAccessMaintenance = Boolean(
    user?.permissions.includes('settings.manage') || ['super-admin', 'admin'].includes(user?.role ?? ''),
  );
  const isMaintenance = bootstrap?.site?.maintenance_mode && !canAccessMaintenance;
  const pageSlug = pathname === '/' ? 'home' : pathname.split('/').filter(Boolean)[0];
  const pageSlider = bootstrap?.sliders?.find((slider) => slider.page_slug === pageSlug);

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {pathname === '/' && <PublicInfoBar />}
      <PublicNavbar />
      {pageSlider && (
        <Suspense fallback={null}>
          <HeroSlider slides={pageSlider.slides} />
        </Suspense>
      )}
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <PublicFooter />
      <ScrollToTopButton />
      <LiveChatWidget />
    </div>
  );
};
