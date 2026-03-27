import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { type SiteSettings } from "@/data/siteSettings";
import { type SkillsData } from "@/data/skills";
import { type AboutData } from "@/data/about";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BriefcaseBusiness, FileText, Github, GraduationCap, Linkedin, Mail, MapPin, Twitter } from "lucide-react";
import { setPageMeta } from "@/lib/seo";
import { apiFetch } from "@/lib/api";

type PublicSiteSettingsResponse = {
  siteTitle?: string | null;
  tagline?: string | null;
  heroIntro?: string | null;
  showOpenSource?: boolean | null;
  socialGithub?: string | null;
  socialLinkedin?: string | null;
  socialEmail?: string | null;
  socialTwitter?: string | null;
  seoMetaTitle?: string | null;
  seoMetaDesc?: string | null;
  resumeUrl?: string | null;
};

const emptySiteSettings: SiteSettings = {
  siteTitle: "",
  tagline: "",
  heroIntro: "",
  showOpenSource: true,
  socialLinks: {
    github: "",
    linkedin: "",
    email: "",
    twitter: "",
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
  },
  resumeUrl: "",
};

const emptySkillsData: SkillsData = {
  groups: [],
};

const emptyAboutData: AboutData = {
  avatarUrl: "",
  location: "",
  shortBio: "",
  longStory: "",
  education: [],
  experience: [],
};

const mapPublicSiteSettings = (data?: PublicSiteSettingsResponse | null): SiteSettings => ({
  siteTitle: data?.siteTitle?.trim() || "",
  tagline: data?.tagline?.trim() || "",
  heroIntro: data?.heroIntro?.trim() || "",
  showOpenSource: data?.showOpenSource ?? true,
  socialLinks: {
    github: data?.socialGithub?.trim() || "",
    linkedin: data?.socialLinkedin?.trim() || "",
    email: data?.socialEmail?.trim() || "",
    twitter: data?.socialTwitter?.trim() || "",
  },
  seo: {
    metaTitle: data?.seoMetaTitle?.trim() || "",
    metaDescription: data?.seoMetaDesc?.trim() || "",
  },
  resumeUrl: data?.resumeUrl?.trim() || "",
});

const normalizeAboutData = (data?: AboutData | null): AboutData => ({
  avatarUrl: data?.avatarUrl || "",
  location: data?.location || "",
  shortBio: data?.shortBio || "",
  longStory: data?.longStory || "",
  education: data?.education ?? [],
  experience: data?.experience ?? [],
});

export default function AboutPage() {
  const [settings, setSettings] = useState<SiteSettings>(emptySiteSettings);
  const [skills, setSkills] = useState<SkillsData>(emptySkillsData);
  const [about, setAbout] = useState<AboutData>(emptyAboutData);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [skillsLoaded, setSkillsLoaded] = useState(false);
  const [aboutLoaded, setAboutLoaded] = useState(false);

  useEffect(() => {
    apiFetch<PublicSiteSettingsResponse | null>("/public/settings")
      .then((res) => setSettings(mapPublicSiteSettings(res.data)))
      .catch(() => setSettings(emptySiteSettings))
      .finally(() => setSettingsLoaded(true));

    apiFetch<SkillsData>("/public/skills")
      .then((res) => setSkills(res.data ?? emptySkillsData))
      .catch(() => setSkills(emptySkillsData))
      .finally(() => setSkillsLoaded(true));

    apiFetch<AboutData | null>("/public/about")
      .then((res) => setAbout(normalizeAboutData(res.data)))
      .catch(() => setAbout(emptyAboutData))
      .finally(() => setAboutLoaded(true));
  }, []);

  useEffect(() => {
    const titleBase = settings.siteTitle || "Minh Duc";
    const description = about.shortBio || settings.tagline || "Learn more about Minh Duc.";
    setPageMeta({
      title: `About | ${titleBase}`,
      description,
      canonical: "https://www.hominhduc.cloud/about",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        name: `About ${titleBase}`,
        url: "https://www.hominhduc.cloud/about",
        mainEntity: {
          "@type": "Person",
          name: titleBase,
          jobTitle: "Backend Developer",
          url: "https://www.hominhduc.cloud/",
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.hominhduc.cloud/" },
            { "@type": "ListItem", position: 2, name: "About", item: "https://www.hominhduc.cloud/about" },
          ],
        },
      },
    });
  }, [about.shortBio, settings.siteTitle, settings.tagline]);

  const socialLinks = [
    { label: "GitHub", href: settings.socialLinks.github, icon: Github },
    { label: "LinkedIn", href: settings.socialLinks.linkedin, icon: Linkedin },
    { label: "Twitter", href: settings.socialLinks.twitter || "", icon: Twitter },
  ].filter((item) => item.href);

  const bioParagraphs = [about.shortBio, ...about.longStory.split("\n")]
    .map((item) => item.trim())
    .filter(Boolean);
  const profileName = settings.siteTitle.trim();
  const profileSubtitle = settings.tagline.trim();
  const profileLoaded = settingsLoaded && aboutLoaded;

  const getTimelineKey = (item: { id?: string | null; title: string; organization: string; period: string }, index: number) =>
    item.id?.trim() || `${item.title}-${item.organization}-${item.period}-${index}`;

  const getGroupKey = (group: SkillsData["groups"][number], index: number) =>
    group.id?.trim() || `${group.name}-${index}`;

  const getSkillKey = (skill: SkillsData["groups"][number]["skills"][number], index: number) =>
    skill.id?.trim() || `${skill.name}-${skill.level ?? "unknown"}-${index}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-4 pb-20 pt-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
            <aside className="space-y-6 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border/70 bg-card px-5 py-6 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.24)]">
                <div className="flex flex-col items-center text-center">
                  {profileLoaded ? (
                    about.avatarUrl ? (
                      <div className="rounded-2xl border border-white/70 p-1 shadow-[0_0_0_4px_hsl(var(--accent)/0.18)]">
                        <img
                          src={about.avatarUrl}
                          srcSet={`${about.avatarUrl} 2x`}
                          sizes="160px"
                          alt={settings.siteTitle || "Avatar"}
                          width={132}
                          height={160}
                          className="h-40 w-32 rounded-xl object-cover"
                          loading="eager"
                          decoding="async"
                          fetchPriority="high"
                        />
                      </div>
                    ) : (
                      <div className="h-40 w-32 rounded-xl bg-muted shadow-[0_0_0_4px_hsl(var(--accent)/0.18)]" />
                    )
                  ) : (
                    <div className="h-40 w-32 animate-pulse rounded-xl bg-muted shadow-[0_0_0_4px_hsl(var(--accent)/0.18)]" />
                  )}

                  {settingsLoaded ? (
                    profileName ? (
                      <h1 className="mt-5 font-serif text-[2rem] leading-none text-foreground">{profileName}</h1>
                    ) : null
                  ) : (
                    <div className="mt-5 h-8 w-40 animate-pulse rounded bg-muted" />
                  )}

                  {settingsLoaded ? (
                    profileSubtitle ? <p className="mt-2 text-base text-accent">{profileSubtitle}</p> : null
                  ) : (
                    <div className="mt-2 h-5 w-48 animate-pulse rounded bg-muted" />
                  )}
                </div>

                <div className="mt-8 space-y-4 text-sm text-muted-foreground">
                  {profileLoaded ? (
                    <>
                      {about.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-accent" />
                          <span>{about.location}</span>
                        </div>
                      )}
                      {settings.socialLinks.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-accent" />
                          <a href={`mailto:${settings.socialLinks.email}`} className="transition-colors hover:text-accent">
                            {settings.socialLinks.email}
                          </a>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
                        <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
                        <div className="h-4 w-44 animate-pulse rounded bg-muted" />
                      </div>
                    </>
                  )}
                </div>

                {profileLoaded && socialLinks.length > 0 && (
                  <>
                    <Separator className="my-5" />
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      {socialLinks.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
                        >
                          <item.icon className="h-3.5 w-3.5" />
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                {settingsLoaded ? (
                  <>
                    <Button
                      asChild
                      size="lg"
                      className="w-full rounded-xl bg-accent text-accent-foreground shadow-lg shadow-accent/20 hover:bg-accent/90"
                    >
                      <Link to={settings.resumeUrl || "/resume"}>{settings.resumeUrl ? "View Resume" : "Resume"}</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="w-full rounded-xl">
                      <Link to="/contact">Get in Touch</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
                    <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-border/70 bg-card px-5 py-6 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.18)]">
                <div className="mb-5 flex items-center gap-2">
                  <span className="text-accent">{`</>`}</span>
                  <h2 className="font-serif text-2xl text-foreground">Skills</h2>
                </div>
                {skillsLoaded ? (
                  skills.groups.length > 0 ? (
                    <div className="space-y-5">
                      {skills.groups.map((group, groupIndex) => (
                        <div key={getGroupKey(group, groupIndex)}>
                          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {group.name}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {group.skills.map((skill, skillIndex) => (
                              <Badge
                                key={getSkillKey(skill, skillIndex)}
                                variant="secondary"
                                className="rounded-full px-3 py-1 text-[0.78rem]"
                              >
                                {skill.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills added yet.</p>
                  )
                ) : (
                  <div className="space-y-5">
                    {Array.from({ length: 3 }, (_, index) => (
                      <div key={`skills-skeleton-${index}`}>
                        <div className="mb-3 h-3 w-24 animate-pulse rounded bg-muted" />
                        <div className="flex flex-wrap gap-2">
                          {Array.from({ length: 4 }, (_, badgeIndex) => (
                            <div
                              key={`skills-skeleton-pill-${index}-${badgeIndex}`}
                              className="h-8 w-20 animate-pulse rounded-full bg-muted"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            <div className="min-w-0">
              <section className="pb-12">
                <SectionHeader title="About Me" className="mb-6" />
                {aboutLoaded ? (
                  bioParagraphs.length > 0 ? (
                    <div className="space-y-5 text-[1.05rem] leading-8 text-muted-foreground">
                      {bioParagraphs.map((paragraph, index) => (
                        <p key={`${paragraph}-${index}`}>{paragraph}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No about content published yet.</p>
                  )
                ) : (
                  <div className="space-y-3">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                  </div>
                )}
              </section>

              <Separator className="mb-12" />

              <section className="pb-12">
                <SectionHeader title="Experience" className="mb-6" />
                <div className="space-y-6">
                  {aboutLoaded ? (
                    about.experience.length > 0 ? (
                      about.experience.map((exp, index) => (
                        <div
                          key={getTimelineKey(exp, index)}
                          className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card px-5 py-5 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_-30px_rgba(15,23,42,0.28)] sm:flex-row sm:items-start sm:justify-between"
                        >
                          <div className="flex gap-4">
                            <div className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
                              <BriefcaseBusiness className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-serif text-2xl leading-tight text-foreground">{exp.title}</h3>
                              <p className="mt-1 text-lg text-accent">{exp.organization}</p>
                              <p className="mt-3 text-base leading-7 text-muted-foreground">{exp.description}</p>
                            </div>
                          </div>
                          <Badge variant="accent" className="shrink-0 self-start rounded-full px-4 py-1.5 text-sm font-semibold">
                            {exp.period}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No experience entries published yet.</p>
                    )
                  ) : (
                    <div className="space-y-4">
                      <div className="h-28 animate-pulse rounded-2xl bg-muted" />
                      <div className="h-28 animate-pulse rounded-2xl bg-muted" />
                    </div>
                  )}
                </div>
              </section>

              <Separator className="mb-12" />

              <section className="pb-12">
                <SectionHeader title="Education" className="mb-6" />
                <div className="space-y-4">
                  {aboutLoaded ? (
                    about.education.length > 0 ? (
                      about.education.map((edu, index) => (
                        <div
                          key={getTimelineKey(edu, index)}
                          className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card px-5 py-5 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.16)] sm:flex-row sm:items-start sm:justify-between"
                        >
                          <div className="flex gap-4">
                            <div className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
                              <GraduationCap className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-serif text-2xl leading-tight text-foreground">{edu.title}</h3>
                              <p className="mt-1 text-lg text-accent">{edu.organization}</p>
                              {edu.description && (
                                <p className="mt-3 text-base leading-7 text-muted-foreground">{edu.description}</p>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary" className="shrink-0 self-start rounded-full px-4 py-1.5 text-sm font-medium">
                            {edu.period}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No education entries published yet.</p>
                    )
                  ) : (
                    <div className="space-y-4">
                      <div className="h-24 animate-pulse rounded-2xl bg-muted" />
                      <div className="h-24 animate-pulse rounded-2xl bg-muted" />
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          <section className="mx-auto mt-14 max-w-3xl rounded-[28px] border border-accent/20 bg-[linear-gradient(180deg,hsl(var(--accent))/0.08,transparent)] px-6 py-10 text-center shadow-[0_22px_55px_-40px_rgba(15,23,42,0.28)]">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/12 text-accent">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="font-serif text-4xl text-foreground">Interested in my background?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              Download my full resume to see my experience, skills, and certifications in detail.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-xl bg-accent px-8 text-accent-foreground shadow-lg shadow-accent/20 hover:bg-accent/90"
              >
                <Link to={settings.resumeUrl || "/resume"}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Resume
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl px-8">
                <Link to="/contact">Get in Touch</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
