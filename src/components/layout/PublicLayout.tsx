import React, { lazy, Suspense, useEffect } from 'react';
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

  useEffect(() => {
    if (pathname !== '/' || isMaintenance) return;

    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let wheelLocked = false;
    let unlockTimer: number | null = null;
    root.dataset.homePageScrollSnap = 'true';

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      if (wheelLocked) {
        event.preventDefault();
        return;
      }

      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('.home-page-snap-section'),
      );
      if (!sections.length) return;

      const scrollY = window.scrollY;
      const headerHeight = document.querySelector<HTMLElement>('header.sticky')?.offsetHeight ?? 56;
      const snapLine = scrollY + headerHeight;
      let sectionIndex = sections.findIndex((section) => {
        const top = scrollY + section.getBoundingClientRect().top;
        return top <= snapLine && top + section.offsetHeight > snapLine;
      });

      if (sectionIndex < 0) {
        sectionIndex = sections.findIndex(
          (section) => section.getBoundingClientRect().top > headerHeight,
        );
        if (sectionIndex < 0) sectionIndex = sections.length - 1;
      }

      const currentSection = sections[sectionIndex];
      const sectionTop = scrollY + currentSection.getBoundingClientRect().top;
      const sectionBottom = sectionTop + currentSection.offsetHeight;
      const isTallSection = currentSection.offsetHeight > window.innerHeight - headerHeight;
      const canScrollWithinSection =
        (event.deltaY > 0 && sectionBottom > scrollY + window.innerHeight + 24) ||
        (event.deltaY < 0 && scrollY > sectionTop + 24);

      if (isTallSection && canScrollWithinSection) {
        root.dataset.homePageScrollFree = 'true';
        return;
      }

      delete root.dataset.homePageScrollFree;

      const nextIndex = sectionIndex + (event.deltaY > 0 ? 1 : -1);
      const nextSection = sections[nextIndex];
      if (!nextSection) return;

      event.preventDefault();
      wheelLocked = true;
      nextSection.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      unlockTimer = window.setTimeout(
        () => {
          wheelLocked = false;
          unlockTimer = null;
        },
        reducedMotion ? 100 : 650,
      );
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (unlockTimer !== null) window.clearTimeout(unlockTimer);
      delete root.dataset.homePageScrollFree;
      delete root.dataset.homePageScrollSnap;
    };
  }, [isMaintenance, pathname]);

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {pathname === '/' && <PublicInfoBar />}
      <PublicNavbar />
      {pageSlider && (
        <div className={pathname === '/' ? 'home-page-snap-section' : undefined}>
          <Suspense fallback={null}>
            <HeroSlider slides={pageSlider.slides} />
          </Suspense>
        </div>
      )}
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
      <ScrollToTopButton />
      <LiveChatWidget />
    </div>
  );
};
