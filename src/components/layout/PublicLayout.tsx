import React, { lazy, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore.ts';
import { PublicFooter } from './PublicFooter.tsx';
import { PublicInfoBar } from './PublicInfoBar.tsx';
import { PublicNavbar } from './PublicNavbar.tsx';
import { PageTransition } from '../effects/PageTransition.tsx';
import { ScrollToTopButton } from '../effects/ScrollToTopButton.tsx';
import { LiveChatWidget } from '../common/LiveChatWidget.tsx';
import { HomeQuickNav } from '../public/HomeQuickNav.tsx';

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
      <div className={`public-header-shell${pathname === '/' ? ' public-header-shell--landing' : ''}`}>
        {pathname === '/' && <PublicInfoBar />}
        <PublicNavbar />
      </div>
      {pathname === '/' ? (
        <div id="home-slider" className="home-page-snap-section">
          {pageSlider && (
            <Suspense fallback={null}>
              <HeroSlider slides={pageSlider.slides} />
            </Suspense>
          )}
        </div>
      ) : pageSlider ? (
        <div>
          <Suspense fallback={null}>
            <HeroSlider slides={pageSlider.slides} />
          </Suspense>
        </div>
      ) : null}
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      {pathname === '/' ? (
        <div className="home-page-snap-section">
          <PublicFooter />
        </div>
      ) : (
        <PublicFooter />
      )}
      {pathname === '/' && <HomeQuickNav />}
      <ScrollToTopButton />
      <LiveChatWidget />
    </div>
  );
};
