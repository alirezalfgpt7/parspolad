import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAppStore } from './store/useAppStore.ts';
import { GlobalSearchModal } from './components/common/GlobalSearchModal.tsx';
import { PagePreloader } from './components/common/PagePreloader.tsx';
import { OfflineIndicator } from './components/common/OfflineIndicator.tsx';
import { ThemeProvider } from './components/common/ThemeProvider.tsx';
import { AdminLayout } from './components/layout/AdminLayout.tsx';
import { PublicLayout } from './components/layout/PublicLayout.tsx';
import { ToastContainer } from './components/ui/ToastContainer.tsx';
import { CustomCursor } from './components/ui/CustomCursor.tsx';
import { ScrollingTitleEffect } from './components/effects/index.ts';
import { apiRequest } from './services/api.ts';

const AboutPage = lazy(() => import('./pages/public/AboutPage.tsx').then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./pages/public/ContactPage.tsx').then((module) => ({ default: module.ContactPage })));
const ContractsLicensesPage = lazy(() => import('./pages/public/ContractsLicensesPage.tsx').then((module) => ({ default: module.ContractsLicensesPage })));
const HomePage = lazy(() => import('./pages/public/HomePage.tsx').then((module) => ({ default: module.HomePage })));
const PhotoAlbumsPage = lazy(() => import('./pages/public/PhotoAlbumsPage.tsx').then((module) => ({ default: module.PhotoAlbumsPage })));
const ErrorPage = lazy(() => import('./pages/public/MiscPages.tsx').then((module) => ({ default: module.ErrorPage })));
const FaqPage = lazy(() => import('./pages/public/MiscPages.tsx').then((module) => ({ default: module.FaqPage })));
const LegalPage = lazy(() => import('./pages/public/MiscPages.tsx').then((module) => ({ default: module.LegalPage })));
const SitemapPage = lazy(() => import('./pages/public/MiscPages.tsx').then((module) => ({ default: module.SitemapPage })));
const FaqAdminPage = lazy(() => import('./pages/admin/FaqAdminPage.tsx').then((module) => ({ default: module.FaqAdminPage })));
const ContentRecordsAdminPage = lazy(() => import('./pages/admin/ContentRecordsAdminPage.tsx').then((module) => ({ default: module.ContentRecordsAdminPage })));
const ProductsAdminPage = lazy(() => import('./pages/admin/ProductsAdminPage.tsx').then((module) => ({ default: module.ProductsAdminPage })));
const ArticlesAdminPage = lazy(() => import('./pages/admin/ArticlesAdminPage.tsx').then((module) => ({ default: module.ArticlesAdminPage })));
const NewsPage = lazy(() => import('./pages/public/NewsPage.tsx').then((module) => ({ default: module.NewsPage })));
const OrgChartPage = lazy(() => import('./pages/public/OrgChartPage.tsx').then((module) => ({ default: module.OrgChartPage })));
const ProductsPage = lazy(() => import('./pages/public/ProductsPage.tsx').then((module) => ({ default: module.ProductsPage })));
const ProjectDetailPage = lazy(() => import('./pages/public/ProjectDetailPage.tsx').then((module) => ({ default: module.ProjectDetailPage })));
const ProjectsPage = lazy(() => import('./pages/public/ProjectsPage.tsx').then((module) => ({ default: module.ProjectsPage })));
const RfqPage = lazy(() => import('./pages/public/RfqPage.tsx').then((module) => ({ default: module.RfqPage })));
const ServicesPage = lazy(() => import('./pages/public/ServicesPage.tsx').then((module) => ({ default: module.ServicesPage })));
const LoginPage = lazy(() => import('./pages/auth/AuthPages.tsx').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/AuthPages.tsx').then((module) => ({ default: module.RegisterPage })));
const ContentCmsAdminPage = lazy(() => import('./pages/admin/ContentCmsAdminPage.tsx').then((module) => ({ default: module.ContentCmsAdminPage })));
const ArticleCommentsAdminPage = lazy(() => import('./pages/admin/ArticleCommentsAdminPage.tsx').then((module) => ({ default: module.ArticleCommentsAdminPage })));
const ContractsAdminPage = lazy(() => import('./pages/admin/ContractsAdminPage.tsx').then((module) => ({ default: module.ContractsAdminPage })));
const LicensesAdminPage = lazy(() => import('./pages/admin/LicensesAdminPage.tsx').then((module) => ({ default: module.LicensesAdminPage })));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage.tsx').then((module) => ({ default: module.DashboardPage })));
const MediaLibraryPage = lazy(() => import('./pages/admin/MediaLibraryPage.tsx').then((module) => ({ default: module.MediaLibraryPage })));
const PhotoAlbumsAdminPage = lazy(() => import('./pages/admin/PhotoAlbumsAdminPage.tsx').then((module) => ({ default: module.PhotoAlbumsAdminPage })));
const MegaMenuAdminPage = lazy(() => import('./pages/admin/MegaMenuAdminPage.tsx').then((module) => ({ default: module.MegaMenuAdminPage })));
const MessagesRfqAdminPage = lazy(() => import('./pages/admin/MessagesRfqAdminPage.tsx').then((module) => ({ default: module.MessagesRfqAdminPage })));
const OrganizationAdminPage = lazy(() => import('./pages/admin/OrganizationAdminPage.tsx').then((module) => ({ default: module.OrganizationAdminPage })));
const NotificationsPage = lazy(() => import('./pages/admin/ProfileNotificationsPage.tsx').then((module) => ({ default: module.NotificationsPage })));
const ProfilePage = lazy(() => import('./pages/admin/ProfileNotificationsPage.tsx').then((module) => ({ default: module.ProfilePage })));
const ProjectsAdminPage = lazy(() => import('./pages/admin/ProjectsAdminPage.tsx').then((module) => ({ default: module.ProjectsAdminPage })));
const ReportsLogsAdminPage = lazy(() => import('./pages/admin/ReportsLogsAdminPage.tsx').then((module) => ({ default: module.ReportsLogsAdminPage })));
const SettingsAdminPage = lazy(() => import('./pages/admin/SettingsAdminPage.tsx').then((module) => ({ default: module.SettingsAdminPage })));
const SliderAdminPage = lazy(() => import('./pages/admin/SliderAdminPage.tsx').then((module) => ({ default: module.SliderAdminPage })));
const ThemeAdminPage = lazy(() => import('./pages/admin/ThemeAdminPage.tsx').then((module) => ({ default: module.ThemeAdminPage })));
const LoginAppearanceAdminPage = lazy(() => import('./pages/admin/LoginAppearanceAdminPage.tsx').then((module) => ({ default: module.LoginAppearanceAdminPage })));
const LiveChatAdminPage = lazy(() => import('./pages/admin/LiveChatAdminPage.tsx').then((module) => ({ default: module.LiveChatAdminPage })));
const UsersRolesAdminPage = lazy(() => import('./pages/admin/UsersRolesAdminPage.tsx').then((module) => ({ default: module.UsersRolesAdminPage })));

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
  const { fetchBootstrap, fetchMe, language, colorMode, loading } = useAppStore();

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.dataset.colorMode = colorMode;
    if (colorMode === 'dark') document.documentElement.classList.add('dark');
    fetchBootstrap();
    fetchMe();
  }, []);

  return (
    <BrowserRouter>
      <ScrollingTitleEffect />
      <PageViewTracker />
      <ThemeProvider>
        <CustomCursor />
        {loading && <PagePreloader fullScreen label="در حال آماده‌سازی پرتال..." />}
        <Suspense fallback={<PagePreloader fullScreen label="در حال آماده‌سازی صفحه..." />}>
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
              <Route path="/albums" element={<PhotoAlbumsPage />} />
              <Route path="/albums/:slug" element={<PhotoAlbumsPage />} />
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
              <Route path="contracts" element={<ContractsAdminPage />} />
              <Route path="licenses" element={<LicensesAdminPage />} />
              <Route path="contracts-licenses" element={<Navigate to="/admin/contracts" replace />} />
              <Route path="slider" element={<SliderAdminPage />} />
              <Route path="themes" element={<ThemeAdminPage />} />
              <Route path="login-appearance" element={<LoginAppearanceAdminPage />} />
              <Route path="menus" element={<MegaMenuAdminPage />} />
              <Route path="content" element={<ContentCmsAdminPage />} />
              <Route path="faqs" element={<FaqAdminPage />} />
              <Route path="content-records" element={<ContentRecordsAdminPage />} />
              <Route path="products" element={<ProductsAdminPage />} />
              <Route path="articles" element={<ArticlesAdminPage />} />
              <Route path="comments" element={<ArticleCommentsAdminPage />} />
              <Route path="organization" element={<OrganizationAdminPage />} />
              <Route path="media" element={<MediaLibraryPage />} />
              <Route path="albums" element={<PhotoAlbumsAdminPage />} />
              <Route path="messages" element={<MessagesRfqAdminPage />} />
              <Route path="live-chat" element={<LiveChatAdminPage />} />
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
