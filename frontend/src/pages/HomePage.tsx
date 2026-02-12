import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { TerminalBlock } from "@/components/TerminalBlock";
import { ProjectCard } from "@/components/ProjectCard";
import { BlogCard } from "@/components/BlogCard";
import { RepoCard } from "@/components/RepoCard";
import { loadPosts, type Post } from "@/data/posts";
import { fetchProjectsPublic, getFeaturedProjects, type Project } from "@/data/projects";
import { getTopRepos, type Repo } from "@/data/repos";
import { useEffect, useState } from "react";
import { fetchSiteSettings, defaultSiteSettings } from "@/data/siteSettings";
import { setPageMeta } from "@/lib/seo";

export default function HomePage() {
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [reposError, setReposError] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteSettings(true)
      .then((data) => setSettings({ ...defaultSiteSettings, ...data }))
      .catch(() => setSettings(defaultSiteSettings))
      .finally(() => setSettingsLoaded(true));
  }, []);

  useEffect(() => {
    const titleBase = settings.siteTitle || "Minh Duc";
    const description = settings.heroIntro || settings.tagline || "Personal portfolio and blog.";
    setPageMeta({
      title: `${titleBase} | Developer Portfolio`,
      description,
    });
  }, [settings.heroIntro, settings.siteTitle, settings.tagline]);

  useEffect(() => {
    fetchProjectsPublic()
      .then((data) => {
        setProjects(data);
        setProjectsError(null);
      })
      .catch((err: Error) => setProjectsError(err?.message || "Failed to load projects"))
      .finally(() => setProjectsLoading(false));
  }, []);

  useEffect(() => {
    const schedule = (fn: () => void) => {
      if (typeof window === "undefined") return fn();
      if ("requestIdleCallback" in window) {
        (window as typeof window & { requestIdleCallback?: IdleRequestCallback }).requestIdleCallback(
          () => fn(),
          { timeout: 1200 }
        );
      } else {
        setTimeout(fn, 200);
      }
    };

    schedule(() => {
      loadPosts()
        .then((data) => {
          setPosts(data);
          setPostsError(null);
        })
        .catch((err: Error) => setPostsError(err?.message || "Failed to load posts"))
        .finally(() => setPostsLoading(false));
    });
  }, []);

  useEffect(() => {
    const schedule = (fn: () => void) => {
      if (typeof window === "undefined") return fn();
      if ("requestIdleCallback" in window) {
        (window as typeof window & { requestIdleCallback?: IdleRequestCallback }).requestIdleCallback(
          () => fn(),
          { timeout: 1600 }
        );
      } else {
        setTimeout(fn, 250);
      }
    };

    schedule(() => {
      getTopRepos(4)
        .then((data) => {
          setRepos(data);
          setReposError(null);
        })
        .catch((err: Error) => setReposError(err?.message || "Failed to load repositories"))
        .finally(() => setReposLoading(false));
    });
  }, []);

  const featuredProjects = getFeaturedProjects(projects).slice(0, 3);
  const latestPosts = posts.slice(0, 3);
  const projectPlaceholders = Array.from({ length: 3 }, (_, i) => (
    <div key={`project-skeleton-${i}`} className="h-64 rounded-xl border bg-muted animate-pulse" />
  ));
  const postPlaceholders = Array.from({ length: 3 }, (_, i) => (
    <div key={`post-skeleton-${i}`} className="h-72 rounded-xl border bg-muted animate-pulse" />
  ));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-pattern">
        <div className="container mx-auto max-w-4xl text-center animate-fade-in-up">
          <div className="flex flex-col items-center gap-4 mb-4">
            {/* {settingsLoaded ? (
              <img
                src={settings.avatarUrl}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover border shadow-sm"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-muted animate-pulse border" />
            )} */}
            <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight">
              Minh Duc
              {/* {settings.siteTitle || "Portfolio"} */}
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Backend Developer & Automation
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            I build beautiful, scalable web applications with modern technologies.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="hero"
              size="lg"
              asChild
              className="liquid-glass-hover hover:text-foreground dark:hover:text-white"
            >
              <Link to="/projects">View Projects</Link>
            </Button>
            <Button
              variant="hero-outline"
              size="lg"
              asChild
              className="liquid-glass-hover hover:text-foreground dark:hover:text-white"
            >
              <Link to="/blog">Read Blog</Link>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              asChild
              className="liquid-glass-hover hover:text-foreground dark:hover:text-white"
            >
              <Link to="/contact">Contact <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Terminal */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <TerminalBlock />
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-8">
            <SectionHeader title="Featured Projects" subtitle="Selected work I'm proud of" />
            <Button variant="ghost" asChild className="hidden md:flex">
              <Link to="/projects">View all <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsLoading && projectPlaceholders}
            {!projectsLoading && featuredProjects.length > 0 && featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {!projectsLoading && featuredProjects.length === 0 && (
              <p className="text-muted-foreground col-span-full">No projects published yet.</p>
            )}
          </div>
          {projectsError && !projectsLoading && (
            <p className="text-sm text-destructive mt-3">{projectsError}</p>
          )}
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-8">
            <SectionHeader title="Latest Writing" subtitle="Thoughts on code, design, and life" />
            <Button variant="ghost" asChild className="hidden md:flex">
              <Link to="/blog">Read all <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postsLoading && postPlaceholders}
            {!postsLoading && latestPosts.length > 0 && latestPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
            {!postsLoading && latestPosts.length === 0 && (
              <p className="text-muted-foreground col-span-full">No posts published yet.</p>
            )}
          </div>
          {postsError && !postsLoading && (
            <p className="text-sm text-destructive mt-3">{postsError}</p>
          )}
        </div>
      </section>

      {/* Open Source */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <SectionHeader title="Open Source" subtitle="Contributing to the community" />
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
              <p className="text-muted-foreground">No repositories yet.</p>
            )}
          </div>
          {reposError && !reposLoading && (
            <p className="text-sm text-destructive mt-3">{reposError}</p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
