import { Suspense, useEffect, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Analytics } from "@vercel/analytics/react";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { SiteSettingsProvider } from "@/lib/SiteSettingsContext";

const HomePage = lazy(() => import("@/pages/HomePage"));
const ProjectsPage = lazy(() => import("@/pages/ProjectsPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogDetailPage = lazy(() => import("@/pages/BlogDetailPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ResumePage = lazy(() => import("@/pages/ResumePage"));
const CertificationsPage = lazy(() => import("@/pages/CertificationsPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/AdminSettingsPage"));
const AdminAboutPage = lazy(() => import("@/pages/admin/AdminAboutPage"));
const AdminSkillsPage = lazy(() => import("@/pages/admin/AdminSkillsPage"));
const AdminProjectsPage = lazy(() => import("@/pages/admin/AdminProjectsPage"));
const AdminProjectEditorPage = lazy(() => import("@/pages/admin/AdminProjectEditorPage"));
const AdminBlogPage = lazy(() => import("@/pages/admin/AdminBlogPage"));
const AdminBlogEditorPage = lazy(() => import("@/pages/admin/AdminBlogEditorPage"));
const AdminReposPage = lazy(() => import("@/pages/admin/AdminReposPage"));
const AdminCertificatesPage = lazy(() => import("@/pages/admin/AdminCertificatesPage"));
const AdminMessagesPage = lazy(() => import("@/pages/admin/AdminMessagesPage"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Loading...
    </div>
  );
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <SiteSettingsProvider>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/certifications" element={<CertificationsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <AuthGuard>
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="about" element={<AdminAboutPage />} />
            <Route path="skills" element={<AdminSkillsPage />} />
            <Route path="projects" element={<AdminProjectsPage />} />
            <Route path="projects/new" element={<AdminProjectEditorPage />} />
            <Route path="projects/:id/edit" element={<AdminProjectEditorPage />} />
            <Route path="repos" element={<AdminReposPage />} />
            <Route path="certificates" element={<AdminCertificatesPage />} />
            <Route path="blog" element={<AdminBlogPage />} />
            <Route path="blog/new" element={<AdminBlogEditorPage />} />
            <Route path="blog/:id/edit" element={<AdminBlogEditorPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />
          </Route>
          <Route path="*" element={<div>404 - Page not found</div>} />
        </Routes>
      </Suspense>
      <ScrollToTopButton />
      <Toaster />
      <Analytics />
      </SiteSettingsProvider>
    </BrowserRouter>
  );
}

export default App;
