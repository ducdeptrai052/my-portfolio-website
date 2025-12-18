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
import { posts } from "@/data/posts";
import { getFeaturedProjects } from "@/data/projects";
import { getTopRepos } from "@/data/repos";

export default function HomePage() {
  const featuredProjects = getFeaturedProjects().slice(0, 3);
  const latestPosts = posts.slice(0, 3);
  const topRepos = getTopRepos(4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-pattern">
        <div className="container mx-auto max-w-4xl text-center animate-fade-in-up">
          <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight mb-6">
            Minh Duc
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Full-Stack Developer & Designer
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            I build thoughtful digital experiences with clean code and elegant design.
            Currently crafting products that matter.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="lg" asChild>
              <Link to="/projects">View Projects</Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/blog">Read Blog</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
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
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
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
            {latestPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Open Source */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <SectionHeader title="Open Source" subtitle="Contributing to the community" />
          <div className="grid md:grid-cols-2 gap-4">
            {topRepos.map((repo) => (
              <RepoCard key={repo.name} repo={repo} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
