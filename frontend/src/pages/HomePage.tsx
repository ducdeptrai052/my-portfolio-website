import { Link } from "react-router-dom";
import { ArrowRight, Award, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { TerminalBlock } from "@/components/TerminalBlock";
import { ProjectCard } from "@/components/ProjectCard";
import { BlogCard } from "@/components/BlogCard";
import { RepoCard } from "@/components/RepoCard";
import { CallToActionSection } from "@/components/CallToActionSection";
import { loadPosts, type Post } from "@/data/posts";
import { fetchProjectsPublic, getFeaturedProjects, type Project } from "@/data/projects";
import { getTopRepos, type Repo } from "@/data/repos";
import { fetchCertificatesPublic, type Certificate } from "@/data/certificates";
import { recruiterCtaPreset } from "@/data/recruiterCta";
import { useEffect, useState } from "react";
import { useSiteSettings } from "@/lib/SiteSettingsContext";
import { setPageMeta } from "@/lib/seo";
import { getPlatformLogoClass, getPlatformMonogram } from "@/lib/certificateBrand";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const trustPlatforms = [
  {
    name: "Coursera",
    href: "https://www.coursera.org",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Coursera_logo_%282020%29.svg",
  },
  {
    name: "Google",
    href: "https://about.google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  },
  {
    name: "IBM",
    href: "https://www.ibm.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
  },
  {
    name: "AWS",
    href: "https://aws.amazon.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
  },
] as const;

function CertificationCard({ cert }: { cert: Certificate }) {
  return (
    <Card className="group flex h-full flex-col rounded-xl border border-accent/30 bg-card p-6 shadow-lg shadow-accent/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/20">
      <CardHeader className="p-0">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            {cert.logoUrl ? (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted p-2">
                <img
                  src={cert.logoUrl}
                  alt={`${cert.platform} logo`}
                  className="h-6 w-6 object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </span>
            ) : (
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold tracking-wide ${getPlatformLogoClass(
                  cert.platform
                )}`}
              >
                {getPlatformMonogram(cert.platform)}
              </span>
            )}
          </div>
          <h3 className="font-serif text-lg font-medium leading-snug [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
            {cert.title}
          </h3>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-2 py-0.5">
            {cert.platform}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {cert.issuer} · {cert.year}
          </span>
        </div>
      </CardContent>
      <div className="flex-1" />
      <CardFooter className="p-0 pt-6">
        <Button
          variant="outline"
          asChild
          className="h-10 w-full justify-between border-border/70 hover:border-accent/60 hover:bg-accent/10 hover:text-accent"
        >
          <a href={cert.verifyUrl} target="_blank" rel="noopener noreferrer">
            <span className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Verify Certificate
            </span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function HomePage() {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [reposError, setReposError] = useState<string | null>(null);
  const [certifications, setCertifications] = useState<Certificate[]>([]);
  const [certificationsLoading, setCertificationsLoading] = useState(true);
  const [certificationsError, setCertificationsError] = useState<string | null>(null);

  const scrollToCertifications = () => {
    if (typeof document === "undefined") return;
    document.getElementById("certifications")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const titleBase = settings.siteTitle || "Minh Duc";
    const description = settings.heroIntro || settings.tagline || "Personal portfolio and blog.";
    setPageMeta({
      title: `${titleBase} | Developer Portfolio`,
      description,
      canonical: "https://www.hominhduc.cloud/",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Person",
        name: titleBase,
        url: "https://www.hominhduc.cloud/",
        jobTitle: "Backend Developer",
        sameAs: [
          "https://github.com/ducdeptrai052",
          "https://www.linkedin.com/in/duc-ho-073aa8153/",
        ],
      },
    });
  }, [settings.heroIntro, settings.siteTitle, settings.tagline]);

  useEffect(() => {
    fetchProjectsPublic()
      .then((data) => { setProjects(data); setProjectsError(null); })
      .catch((err: Error) => setProjectsError(err?.message || "Failed to load projects"))
      .finally(() => setProjectsLoading(false));

    loadPosts()
      .then((data) => { setPosts(data); setPostsError(null); })
      .catch((err: Error) => setPostsError(err?.message || "Failed to load posts"))
      .finally(() => setPostsLoading(false));

    fetchCertificatesPublic()
      .then((data) => { setCertifications(data); setCertificationsError(null); })
      .catch((err: Error) => setCertificationsError(err?.message || "Failed to load certifications"))
      .finally(() => setCertificationsLoading(false));
  }, []);

  useEffect(() => {
    if (settingsLoading) return;
    if (!settings.showOpenSource) {
      setRepos([]);
      setReposLoading(false);
      return;
    }

    setReposLoading(true);
    getTopRepos(4)
      .then((data) => { setRepos(data); setReposError(null); })
      .catch((err: Error) => setReposError(err?.message || "Failed to load repositories"))
      .finally(() => setReposLoading(false));
  }, [settings.showOpenSource, settingsLoading]);

  const featuredProjects = getFeaturedProjects(projects).slice(0, 3);
  const latestPosts = posts.slice(0, 3);
  const featuredCertifications = certifications.filter((cert) => cert.featured).slice(0, 3);
  const certificateCount = certifications.length;
  const technicalProjectCount = projects.length ;
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
          <div className="mx-auto mb-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              {certificateCount} Verified Certifications
            </p>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              {technicalProjectCount} Technical Projects
            </p>
          </div>
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
              className="liquid-glass-hover hover:text-foreground dark:hover:text-white"
              onClick={scrollToCertifications}
            >
              View Certifications
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

          <div className="relative mx-auto mt-12 w-full max-w-[1050px] overflow-hidden rounded-2xl border border-border/80 bg-card/70 px-6 py-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.38)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_22px_60px_-36px_rgba(0,0,0,0.85)] md:px-8 md:py-6">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(2,6,23,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.04)_1px,transparent_1px)] [background-size:26px_26px] dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)]" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
              <div className="text-left">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-foreground/70 dark:text-white/65">
                  Certified By
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground dark:text-white/60">Verified credentials</p>
              </div>

              <div className="grid grid-cols-2 items-center gap-x-8 gap-y-5 md:flex md:justify-end md:gap-10">
                {trustPlatforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform.name}
                    className="group/logo flex items-center justify-center transition-transform duration-300"
                  >
                    <img
                      src={platform.logo}
                      alt={`${platform.name} logo`}
                      loading="lazy"
                      decoding="async"
                      className="h-7 w-auto max-w-[130px] object-contain opacity-[0.88] transition-all duration-300 group-hover/logo:scale-[1.06] group-hover/logo:opacity-100 group-hover/logo:drop-shadow-[0_6px_16px_rgba(15,23,42,0.18)] dark:opacity-[0.84] dark:group-hover/logo:drop-shadow-[0_6px_16px_rgba(255,255,255,0.14)] md:h-9"
                    />
                  </a>
                ))}
              </div>
            </div>
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

      {/* Certifications */}
      <section id="certifications" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeader
              title="Featured Certifications"
              subtitle={`${certificateCount} verified credentials from industry leaders`}
              className="mb-0"
            />
            <Button variant="ghost" asChild className="hidden md:flex">
              <Link to="/certifications">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {certificationsLoading && certifications.length === 0 && (
              <>
                <div className="h-64 rounded-xl border bg-muted animate-pulse" />
                <div className="h-64 rounded-xl border bg-muted animate-pulse" />
                <div className="h-64 rounded-xl border bg-muted animate-pulse" />
              </>
            )}
            {featuredCertifications.map((cert) => (
              <CertificationCard key={cert.id} cert={cert} />
            ))}
            {!certificationsLoading && featuredCertifications.length === 0 && (
              <p className="text-muted-foreground col-span-full">No featured certifications yet.</p>
            )}
          </div>
          <Button variant="outline" asChild className="mx-auto mt-8 flex md:hidden">
            <Link to="/certifications">
              View all certifications <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {certificationsError && !certificationsLoading && (
            <p className="text-sm text-destructive mt-3">{certificationsError}</p>
          )}
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-16 px-4 bg-muted/30">
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

      {settings.showOpenSource && (
        <section className="py-16 px-4">
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
      )}

      <CallToActionSection {...recruiterCtaPreset} className="mt-0 mb-16" />

      <Footer />
    </div>
  );
}
