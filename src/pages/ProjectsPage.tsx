import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { ProjectCard } from "@/components/ProjectCard";
import { RepoCard } from "@/components/RepoCard";
import { SearchBar } from "@/components/SearchBar";
import { TagFilterChips } from "@/components/TagFilterChips";
import { PaginationBar } from "@/components/PaginationBar";
import { EmptyState } from "@/components/EmptyState";
import { projects, getAllTags } from "@/data/projects";
import { repos } from "@/data/repos";

const ITEMS_PER_PAGE = 6;

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const allTags = getAllTags();

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.description.toLowerCase().includes(search.toLowerCase());
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some((tag) => project.tags.includes(tag));
      return matchesSearch && matchesTags;
    });
  }, [search, selectedTags]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

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

          {paginatedProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <EmptyState title="No projects found" description="Try adjusting your search or filters." />
          )}

          <PaginationBar currentPage={page} totalPages={totalPages} onPageChange={setPage} />

          <div className="mt-16">
            <SectionHeader title="Open Source" subtitle="Contributions to the community" />
            <div className="grid md:grid-cols-2 gap-4">
              {repos.map((repo) => (
                <RepoCard key={repo.name} repo={repo} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
