import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchSiteSettings, defaultSiteSettings } from "@/data/siteSettings";
import { fetchSkillsData, defaultSkillsData, SkillsData } from "@/data/skills";
import { fetchAboutData, defaultAboutData, AboutData } from "@/data/about";
import { useEffect, useState } from "react";

export default function AboutPage() {
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [skills, setSkills] = useState<SkillsData>(defaultSkillsData);
  const [about, setAbout] = useState<AboutData>(defaultAboutData);
  const [aboutLoaded, setAboutLoaded] = useState(false);

  useEffect(() => {
    fetchSiteSettings(true)
      .then((data) => setSettings({ ...defaultSiteSettings, ...data }))
      .catch(() => setSettings(defaultSiteSettings))
      .finally(() => setSettingsLoaded(true));

    fetchSkillsData(true)
      .then(setSkills)
      .catch(() => setSkills(defaultSkillsData));

    fetchAboutData(true)
      .then((data) => setAbout({ ...defaultAboutData, ...data }))
      .catch(() => setAbout(defaultAboutData))
      .finally(() => setAboutLoaded(true));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row gap-8 mb-16">
            {settingsLoaded ? (
              <img
                src={settings.avatarUrl}
                alt={settings.siteTitle}
                className="w-32 h-32 rounded-full object-cover border"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-muted animate-pulse border" />
            )}
            <div>
              <h1 className="font-serif text-4xl font-medium mb-2">{settings.siteTitle}</h1>
              <p className="text-xl text-muted-foreground mb-4">{settings.tagline}</p>
              <p className="text-muted-foreground">San Francisco, CA</p>
            </div>
          </div>

          <section className="mb-16">
            <SectionHeader title="About Me" />
            {aboutLoaded ? (
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>{about.shortBio}</p>
                {about.longStory.split("\n").map((para, idx) =>
                  para.trim() ? (
                    <p key={idx}>{para}</p>
                  ) : null
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                <div className="h-4 bg-muted rounded w-full animate-pulse" />
                <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
              </div>
            )}
          </section>

          <Separator className="my-12" />

          <section className="mb-16">
            <SectionHeader title="Experience" />
            <div className="space-y-8">
              {aboutLoaded ? (
                about.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-8 border-l-2 border-border">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-accent" />
                    <h3 className="font-serif text-xl font-medium">{exp.title}</h3>
                    <p className="text-accent font-medium">{exp.organization}</p>
                    <p className="text-sm text-muted-foreground mb-2">{exp.period}</p>
                    <p className="text-muted-foreground whitespace-pre-line">{exp.description}</p>
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  <div className="h-5 bg-muted rounded w-1/2 animate-pulse" />
                  <div className="h-5 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
                </div>
              )}
            </div>
          </section>

          <section className="mb-16">
            <SectionHeader title="Education" />
            <div className="space-y-6">
              {aboutLoaded ? (
                about.education.map((edu) => (
                  <div key={edu.id} className="relative pl-8 border-l-2 border-border">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary" />
                    <h3 className="font-serif text-xl font-medium">{edu.title}</h3>
                    <p className="text-muted-foreground">{edu.organization}</p>
                    <p className="text-sm text-muted-foreground">{edu.period}</p>
                    <p className="text-muted-foreground whitespace-pre-line">{edu.description}</p>
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  <div className="h-5 bg-muted rounded w-1/2 animate-pulse" />
                  <div className="h-5 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
                </div>
              )}
            </div>
          </section>

          <section>
            <SectionHeader title="Skills" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.groups.map((group) => (
                <div key={group.id}>
                  <h4 className="font-medium mb-3">{group.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
