import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AOS from 'aos';
import { useAppStore } from './store/useAppStore.ts';
import { GlobalSearchModal } from './components/common/GlobalSearchModal.tsx';
import { OfflineIndicator } from './components/common/OfflineIndicator.tsx';
import { ThemeProvider } from './components/common/ThemeProvider.tsx';
import { AdminLayout } from './components/layout/AdminLayout.tsx';
import { PublicLayout } from './components/layout/PublicLayout.tsx';
import { ToastContainer } from './components/ui/ToastContainer.tsx';
import { AboutPage } from './pages/public/AboutPage.tsx';
import { ContactPage } from './pages/public/ContactPage.tsx';
import { ContractsLicensesPage } from './pages/public/ContractsLicensesPage.tsx';
import { HomePage } from './pages/public/HomePage.tsx';
import { ErrorPage, FaqPage, LegalPage, SitemapPage } from './pages/public/MiscPages.tsx';
import { FaqAdminPage } from './pages/admin/FaqAdminPage.tsx';
import { ContentRecordsAdminPage } from './pages/admin/ContentRecordsAdminPage.tsx';
import { NewsPage } from './pages/public/NewsPage.tsx';
import { OrgChartPage } from './pages/public/OrgChartPage.tsx';
import { ProductsPage } from './pages/public/ProductsPage.tsx';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage.tsx';
import { ProjectsPage } from './pages/public/ProjectsPage.tsx';
import { RfqPage } from './pages/public/RfqPage.tsx';
import { ServicesPage } from './pages/public/ServicesPage.tsx';
import { LoginPage, RegisterPage } from './pages/auth/AuthPages.tsx';
import { ContentCmsAdminPage } from './pages/admin/ContentCmsAdminPage.tsx';
import { ArticleCommentsAdminPage } from './pages/admin/ArticleCommentsAdminPage.tsx';
import { ContractsLicensesAdminPage } from './pages/admin/ContractsLicensesAdminPage.tsx';
import { DashboardPage } from './pages/admin/DashboardPage.tsx';
import { MediaLibraryPage } from './pages/admin/MediaLibraryPage.tsx';
import { MegaMenuAdminPage } from './pages/admin/MegaMenuAdminPage.tsx';
import { MessagesRfqAdminPage } from './pages/admin/MessagesRfqAdminPage.tsx';
import { OrganizationAdminPage } from './pages/admin/OrganizationAdminPage.tsx';
import { NotificationsPage, ProfilePage } from './pages/admin/ProfileNotificationsPage.tsx';
import { ProjectsAdminPage } from './pages/admin/ProjectsAdminPage.tsx';
import { ReportsLogsAdminPage } from './pages/admin/ReportsLogsAdminPage.tsx';
import { SettingsAdminPage } from './pages/admin/SettingsAdminPage.tsx';
import { SliderAdminPage } from './pages/admin/SliderAdminPage.tsx';
import { ThemeAdminPage } from './pages/admin/ThemeAdminPage.tsx';
import { UsersRolesAdminPage } from './pages/admin/UsersRolesAdminPage.tsx';
import { apiRequest } from './services/api.ts';

const ProtectedAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAppStore();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PageViewTracker: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register') return;

    apiRequest<{ ok: boolean }>('/page-views', {
      method: 'POST',
      body: JSON.stringify({ path: pathname }),
    }).catch((error: unknown) => {
      console.error('Failed to record public page view.', error);
    });
  }, [pathname]);

  return null;
};

export default function App() {
  const { fetchBootstrap, fetchMe, language, colorMode } = useAppStore();

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    if (colorMode === 'dark') document.documentElement.classList.add('dark');
    AOS.init({ duration: 550, once: true });
    fetchBootstrap();
    fetchMe();
  }, []);

  return (
    <BrowserRouter>
      <PageViewTracker />
      <ThemeProvider>
        <Suspense fallback={<div className="py-20 text-center text-sm">در حال بارگذاری...</div>}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />
              <Route path="/contracts-licenses" element={<ContractsLicensesPage />} />
              <Route path="/org-chart" element={<OrgChartPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:slug" element={<NewsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/rfq" element={<RfqPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/sitemap" element={<SitemapPage />} />
              <Route path="/403" element={<ErrorPage code={403} />} />
              <Route path="/500" element={<ErrorPage code={500} />} />
              <Route path="*" element={<ErrorPage code={404} />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/admin"
              element={
                <ProtectedAdmin>
                  <AdminLayout />
                </ProtectedAdmin>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsAdminPage />} />
              <Route path="contracts-licenses" element={<ContractsLicensesAdminPage />} />
              <Route path="slider" element={<SliderAdminPage />} />
              <Route path="themes" element={<ThemeAdminPage />} />
              <Route path="menus" element={<MegaMenuAdminPage />} />
              <Route path="content" element={<ContentCmsAdminPage />} />
              <Route path="faqs" element={<FaqAdminPage />} />
              <Route path="content-records" element={<ContentRecordsAdminPage />} />
              <Route path="comments" element={<ArticleCommentsAdminPage />} />
              <Route path="organization" element={<OrganizationAdminPage />} />
              <Route path="media" element={<MediaLibraryPage />} />
              <Route path="messages" element={<MessagesRfqAdminPage />} />
              <Route path="users" element={<UsersRolesAdminPage />} />
              <Route path="reports" element={<ReportsLogsAdminPage />} />
              <Route path="settings" element={<SettingsAdminPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
          </Routes>
        </Suspense>
        <GlobalSearchModal />
        <OfflineIndicator />
        <ToastContainer />
      </ThemeProvider>
    </BrowserRouter>
  );
}
