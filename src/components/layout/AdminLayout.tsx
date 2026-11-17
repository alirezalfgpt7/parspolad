import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore.ts';
import { AdminSidebar, adminNavItems } from './AdminSidebar.tsx';
import { AdminTopbar } from './AdminTopbar.tsx';
import { PageTransition } from '../effects/PageTransition.tsx';

export const AdminLayout: React.FC = () => {
  const { user, logout, language, setLanguage, colorMode, toggleColorMode } = useAppStore();
  const [mini, setMini] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dockOpposite, setDockOpposite] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ppa_admin_dock') === 'opposite';
    } catch {
      return false;
    }
  });
  const location = useLocation();
  const navigate = useNavigate();

  const currentItem = adminNavItems.find((item) => item.to === location.pathname) || adminNavItems[0];

  const handleToggleDock = () => {
    setDockOpposite((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ppa_admin_dock', next ? 'opposite' : 'default');
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div
      className="admin-shell flex h-dvh min-h-0 overflow-hidden"
      data-sidebar-dock={dockOpposite ? 'opposite' : 'default'}
      style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
    >
      {mobileOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="بستن منوی مدیریت"
        />
      )}
      <AdminSidebar
        user={user}
        language={language}
        colorMode={colorMode}
        mini={mini}
        mobileOpen={mobileOpen}
        dockOpposite={dockOpposite}
        onToggleMini={() => setMini((current) => !current)}
        onToggleDock={handleToggleDock}
        onToggleColorMode={toggleColorMode}
        onCloseMobile={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <AdminTopbar
          user={user}
          language={language}
          setLanguage={setLanguage}
          colorMode={colorMode}
          toggleColorMode={toggleColorMode}
          currentItem={currentItem}
          mobileSidebarOpen={mobileOpen}
          onToggleMobileSidebar={() => setMobileOpen((open) => !open)}
        />

        <main className="min-h-0 flex-1 p-4 sm:p-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};
