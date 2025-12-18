import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/HomePage";
import ProjectsPage from "@/pages/ProjectsPage";
import BlogPage from "@/pages/BlogPage";
import BlogDetailPage from "@/pages/BlogDetailPage";
import AboutPage from "@/pages/AboutPage";
import ResumePage from "@/pages/ResumePage";
import ContactPage from "@/pages/ContactPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import AdminAboutPage from "@/pages/admin/AdminAboutPage";
import AdminSkillsPage from "@/pages/admin/AdminSkillsPage";
import AdminProjectsPage from "@/pages/admin/AdminProjectsPage";
import AdminProjectEditorPage from "@/pages/admin/AdminProjectEditorPage";
import AdminBlogPage from "@/pages/admin/AdminBlogPage";
import AdminBlogEditorPage from "@/pages/admin/AdminBlogEditorPage";
import AdminReposPage from "@/pages/admin/AdminReposPage";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/resume" element={<ResumePage />} />
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
          <Route path="blog" element={<AdminBlogPage />} />
          <Route path="blog/new" element={<AdminBlogEditorPage />} />
          <Route path="blog/:id/edit" element={<AdminBlogEditorPage />} />
        </Route>
        <Route path="*" element={<div>404 - Page not found</div>} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
