import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore.ts';
import { MaintenancePage } from '../../pages/public/MiscPages.tsx';
import { PublicFooter } from './PublicFooter.tsx';
import { PublicNavbar } from './PublicNavbar.tsx';

export const PublicLayout: React.FC = () => {
  const { bootstrap, user } = useAppStore();
  const isMaintenance = bootstrap?.site?.maintenance_mode && !user;

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};
