import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { ProjectCard } from "@/components/ProjectCard";
import { RepoCard } from "@/components/RepoCard";
import { SearchBar } from "@/components/SearchBar";
import { TagFilterChips } from "@/components/TagFilterChips";
import { PaginationBar } from "@/components/PaginationBar";
import { EmptyState } from "@/components/EmptyState";
import { CallToActionSection } from "@/components/CallToActionSection";
import { fetchProjectsPublic, getAllTags, type Project } from "@/data/projects";
import { fetchReposPublic, type Repo } from "@/data/repos";
import { recruiterCtaPreset } from "@/data/recruiterCta";
import { setPageMeta } from "@/lib/seo";
import { defaultSiteSettings, fetchSiteSettings } from "@/data/siteSettings";

const ITEMS_PER_PAGE = 6;

export default function ProjectsPage() {
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [reposError, setReposError] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteSettings(true)
      .then((data) => setSettings({ ...defaultSiteSettings, ...data }))
      .catch(() => setSettings(defaultSiteSettings))
      .finally(() => setSettingsLoading(false));
  }, []);

  useEffect(() => {
    fetchProjectsPublic()
      .then((data) => {
        setProjects(data);
        setError(null);
      })
      .catch((err: any) => setError(err?.message || "Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (settingsLoading) return;
    if (!settings.showOpenSource) {
      setRepos([]);
      setReposError(null);
      setReposLoading(false);
      return;
    }

    setReposLoading(true);

    fetchReposPublic()
      .then((data) => {
        setRepos(data);
        setReposError(null);
      })
      .catch((err: any) => setReposError(err?.message || "Failed to load repositories"))
      .finally(() => setReposLoading(false));
  }, [settings.showOpenSource, settingsLoading]);

  useEffect(() => {
    setPageMeta({
      title: "Projects | Minh Duc",
      description: "A collection of projects and open source contributions.",
      canonical: "https://www.hominhduc.cloud/projects",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Projects",
        url: "https://www.hominhduc.cloud/projects",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.hominhduc.cloud/" },
            { "@type": "ListItem", position: 2, name: "Projects", item: "https://www.hominhduc.cloud/projects" },
          ],
        },
      },
    });
  }, []);

  const allTags = useMemo(() => getAllTags(projects), [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.description.toLowerCase().includes(search.toLowerCase());
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some((tag) => project.tags.includes(tag));
      return matchesSearch && matchesTags;
    });
  }, [projects, search, selectedTags]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const skeletonCards = Array.from({ length: ITEMS_PER_PAGE }, (_, i) => (
    <div key={`project-skeleton-${i}`} className="h-64 rounded-xl border bg-muted animate-pulse" />
  ));

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <SectionHeader title="Projects" subtitle="A collection of things I've built" className="mb-8" />
          
          <div className="space-y-6 mb-8">
            <SearchBar placeholder="Search projects..." onSearch={(q) => { setSearch(q); setPage(1); }} className="max-w-md" />
            <TagFilterChips tags={allTags} selectedTags={selectedTags} onTagToggle={toggleTag} />
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {skeletonCards}
            </div>
          ) : paginatedProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <EmptyState title="No projects found" description="Try adjusting your search or filters." />
          )}

          {error && !loading && (
            <p className="text-sm text-destructive mb-6">{error}</p>
          )}

          <PaginationBar currentPage={page} totalPages={totalPages} onPageChange={setPage} />

          {settings.showOpenSource && (
            <div className="mt-16">
              <SectionHeader title="Open Source" subtitle="Contributions to the community" />
              <div className="grid md:grid-cols-2 gap-4">
                {reposLoading && (
                  <>
                    <div className="h-32 rounded-xl border bg-muted animate-pulse" />
                    <div className="h-32 rounded-xl border bg-muted animate-pulse" />
                  </>
                )}
                {!reposLoading && repos.map((repo) => (
                  <RepoCard key={repo.id} repo={repo} />
                ))}
                {!reposLoading && repos.length === 0 && !reposError && (
                  <p className="text-muted-foreground col-span-full">No repositories yet.</p>
                )}
              </div>
              {reposError && !reposLoading && (
                <p className="text-sm text-destructive mt-3">{reposError}</p>
              )}
            </div>
          )}

          <CallToActionSection {...recruiterCtaPreset} className="mt-16 px-0" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
