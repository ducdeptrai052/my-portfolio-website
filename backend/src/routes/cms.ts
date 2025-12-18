import express from "express";
import prisma from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { sendError, sendOk } from "../utils/response";

const router = express.Router();

// Default seeds for singletons
const defaultSiteSettings = {
  siteTitle: "minhduc.dev",
  tagline: "Full-Stack Developer & Designer",
  heroIntro: "I build beautiful, scalable web applications with modern technologies.",
  socialGithub: "https://github.com/minhduc",
  socialLinkedin: "https://linkedin.com/in/minhduc",
  socialEmail: "hello@minhduc.dev",
  socialTwitter: "https://twitter.com/minhduc",
  seoMetaTitle: "Minh Duc - Full-Stack Developer",
  seoMetaDesc:
    "Personal portfolio of Minh Duc, a full-stack developer specializing in React, TypeScript, and Node.js.",
  avatarUrl:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  resumeUrl: null as string | null,
};

const defaultAbout = {
  shortBio: "Full-Stack Developer with 10+ years of experience building web applications.",
  longStory: `I'm a passionate developer who loves creating elegant solutions to complex problems. My journey in tech started when I built my first website at 15, and I've been hooked ever since.

Over the years, I've worked with startups and enterprises, leading teams and shipping products used by millions. I believe in clean code, thoughtful design, and continuous learning.

When I'm not coding, you can find me reading, hiking, or experimenting with new technologies.`,
  education: [
    {
      title: "M.S. Computer Science",
      organization: "Stanford University",
      period: "2012 - 2014",
      description: "Focused on distributed systems and machine learning.",
    },
    {
      title: "B.S. Computer Science",
      organization: "UC Berkeley",
      period: "2008 - 2012",
      description: "Graduated with honors. Minor in Mathematics.",
    },
  ],
  experience: [
    {
      title: "Senior Software Engineer",
      organization: "Tech Company",
      period: "2020 - Present",
      description: "Leading frontend architecture and mentoring junior developers.",
    },
    {
      title: "Software Engineer",
      organization: "Startup Inc.",
      period: "2016 - 2020",
      description: "Built core features and scaled the platform to 1M+ users.",
    },
    {
      title: "Junior Developer",
      organization: "Agency Co.",
      period: "2014 - 2016",
      description: "Developed client websites and internal tools.",
    },
  ],
};

router.use(requireAuth);

// Settings
router.get("/settings", async (_req, res) => {
  let settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.siteSetting.create({ data: defaultSiteSettings });
  }
  return sendOk(res, settings);
});

router.put("/settings", async (req, res) => {
  const data = req.body || {};
  const payload = {
    siteTitle: data.siteTitle,
    tagline: data.tagline,
    heroIntro: data.heroIntro,
    socialGithub: data.socialGithub,
    socialLinkedin: data.socialLinkedin,
    socialEmail: data.socialEmail,
    socialTwitter: data.socialTwitter ?? null,
    seoMetaTitle: data.seoMetaTitle,
    seoMetaDesc: data.seoMetaDesc,
    avatarUrl: data.avatarUrl ?? null,
    resumeUrl: data.resumeUrl ?? null,
  };
  try {
    const updated = await prisma.siteSetting.upsert({
      where: { id: 1 },
      update: payload,
      create: { ...defaultSiteSettings, ...payload },
    });
    return sendOk(res, updated, "Settings updated");
  } catch (error: any) {
    return sendError(res, error?.message || "Failed to update settings", 400);
  }
});

// About + timelines
router.get("/about", async (_req, res) => {
  let about = await prisma.about.findUnique({
    where: { id: 1 },
    include: { timelines: true },
  });
  if (!about) {
    about = await prisma.about.create({
      data: {
        shortBio: defaultAbout.shortBio,
        longStory: defaultAbout.longStory,
        timelines: {
          create: [
            ...defaultAbout.education.map((item) => ({
              ...item,
              type: "education" as const,
            })),
            ...defaultAbout.experience.map((item) => ({
              ...item,
              type: "experience" as const,
            })),
          ],
        },
      },
      include: { timelines: true },
    });
  }
  const payload = {
    shortBio: about.shortBio,
    longStory: about.longStory,
    education: about.timelines.filter((t) => t.type === "education"),
    experience: about.timelines.filter((t) => t.type === "experience"),
  };
  return sendOk(res, payload);
});

router.put("/about", async (req, res) => {
  const { shortBio, longStory, education = [], experience = [] } = req.body || {};
  try {
    const result = await prisma.$transaction(async (tx) => {
      const about = await tx.about.upsert({
        where: { id: 1 },
        update: { shortBio, longStory },
        create: { shortBio, longStory },
      });
      await tx.timelineEntry.deleteMany({ where: { aboutId: about.id } });
      await tx.timelineEntry.createMany({
        data: [
          ...education.map((item: any) => ({
            aboutId: about.id,
            type: "education" as const,
            title: item.title ?? "",
            organization: item.organization ?? "",
            period: item.period ?? "",
            description: item.description ?? "",
          })),
          ...experience.map((item: any) => ({
            aboutId: about.id,
            type: "experience" as const,
            title: item.title ?? "",
            organization: item.organization ?? "",
            period: item.period ?? "",
            description: item.description ?? "",
          })),
        ],
      });
      return about.id;
    });
    const about = await prisma.about.findUniqueOrThrow({
      where: { id: result },
      include: { timelines: true },
    });
    const payload = {
      shortBio: about?.shortBio ?? "",
      longStory: about?.longStory ?? "",
      education: about?.timelines.filter((t) => t.type === "education") ?? [],
      experience: about?.timelines.filter((t) => t.type === "experience") ?? [],
    };
    return sendOk(res, payload, "About updated");
  } catch (error: any) {
    return sendError(res, error?.message || "Failed to update About", 400);
  }
});

// Skills
router.get("/skills", async (_req, res) => {
  const groups = await prisma.skillGroup.findMany({
    include: { skills: true },
    orderBy: { name: "asc" },
  });
  return sendOk(res, { groups });
});

router.put("/skills", async (req, res) => {
  const { groups = [] } = req.body || {};
  try {
    await prisma.$transaction(async (tx) => {
      await tx.skill.deleteMany();
      await tx.skillGroup.deleteMany();
      for (const group of groups) {
        await tx.skillGroup.create({
          data: {
            name: group.name ?? "Group",
            skills: {
              create: (group.skills || []).map((s: any) => ({
                name: s.name ?? "",
                level: s.level ?? null,
              })),
            },
          },
        });
      }
    });
    const fresh = await prisma.skillGroup.findMany({ include: { skills: true } });
    return sendOk(res, { groups: fresh }, "Skills updated");
  } catch (error: any) {
    return sendError(res, error?.message || "Failed to update skills", 400);
  }
});

// Projects
router.get("/projects", async (_req, res) => {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return sendOk(res, projects);
});

router.get("/projects/:id", async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return sendError(res, "Not found", 404);
  return sendOk(res, project);
});

router.post("/projects", async (req, res) => {
  const data = req.body;
  try {
    const created = await prisma.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription ?? "",
        fullDescription: data.fullDescription ?? "",
        tags: data.tags ?? [],
        thumbnailUrl: data.thumbnailUrl ?? null,
        githubUrl: data.links?.github ?? data.githubUrl ?? null,
        demoUrl: data.links?.demo ?? data.demoUrl ?? null,
        featured: data.featured ?? false,
        status: data.status ?? "draft",
      },
    });
    return sendOk(res, created, "Project created");
  } catch (error: any) {
    if (error.code === "P2002") {
      return sendError(res, "Slug must be unique", 400);
    }
    return sendError(res, error?.message || "Failed to create project", 400);
  }
});

router.put("/projects/:id", async (req, res) => {
  const data = req.body;
  try {
    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription ?? "",
        fullDescription: data.fullDescription ?? "",
        tags: data.tags ?? [],
        thumbnailUrl: data.thumbnailUrl ?? null,
        githubUrl: data.links?.github ?? data.githubUrl ?? null,
        demoUrl: data.links?.demo ?? data.demoUrl ?? null,
        featured: data.featured ?? false,
        status: data.status ?? "draft",
        updatedAt: new Date(),
      },
    });
    return sendOk(res, updated, "Project updated");
  } catch (error: any) {
    if (error.code === "P2002") {
      return sendError(res, "Slug must be unique", 400);
    }
    return sendError(res, error?.message || "Failed to update project", 400);
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    return sendOk(res, null, "Project deleted");
  } catch (error: any) {
    return sendError(res, error?.message || "Failed to delete project", 400);
  }
});

// Posts
router.get("/posts", async (_req, res) => {
  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });
  return sendOk(res, posts);
});

router.get("/posts/:id", async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) return sendError(res, "Not found", 404);
  return sendOk(res, post);
});

router.post("/posts", async (req, res) => {
  const data = req.body;
  try {
    const created = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt ?? "",
        content: data.content ?? "",
        category: data.category ?? "tech",
        coverImageUrl: data.coverImageUrl ?? null,
        status: data.status ?? "draft",
      },
    });
    return sendOk(res, created, "Post created");
  } catch (error: any) {
    if (error.code === "P2002") {
      return sendError(res, "Slug must be unique", 400);
    }
    return sendError(res, error?.message || "Failed to create post", 400);
  }
});

router.put("/posts/:id", async (req, res) => {
  const data = req.body;
  try {
    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt ?? "",
        content: data.content ?? "",
        category: data.category ?? "tech",
        coverImageUrl: data.coverImageUrl ?? null,
        status: data.status ?? "draft",
        updatedAt: new Date(),
      },
    });
    return sendOk(res, updated, "Post updated");
  } catch (error: any) {
    if (error.code === "P2002") {
      return sendError(res, "Slug must be unique", 400);
    }
    return sendError(res, error?.message || "Failed to update post", 400);
  }
});

router.delete("/posts/:id", async (req, res) => {
  try {
    await prisma.post.delete({ where: { id: req.params.id } });
    return sendOk(res, null, "Post deleted");
  } catch (error: any) {
    return sendError(res, error?.message || "Failed to delete post", 400);
  }
});

// Repos
router.get("/repos", async (_req, res) => {
  const repos = await prisma.repo.findMany({ orderBy: { stars: "desc" } });
  return sendOk(res, repos);
});

router.get("/repos/:id", async (req, res) => {
  const repo = await prisma.repo.findUnique({ where: { id: req.params.id } });
  if (!repo) return sendError(res, "Not found", 404);
  return sendOk(res, repo);
});

router.post("/repos", async (req, res) => {
  const data = req.body;
  try {
    const created = await prisma.repo.create({
      data: {
        name: data.name,
        description: data.description ?? "",
        url: data.url,
        language: data.language ?? "",
        stars: data.stars ?? 0,
        forks: data.forks ?? 0,
      },
    });
    return sendOk(res, created, "Repo created");
  } catch (error: any) {
    if (error.code === "P2002") {
      return sendError(res, "Repo name must be unique", 400);
    }
    return sendError(res, error?.message || "Failed to create repo", 400);
  }
});

router.put("/repos/:id", async (req, res) => {
  const data = req.body;
  try {
    const updated = await prisma.repo.update({
      where: { id: req.params.id },
      data: {
        name: data.name,
        description: data.description ?? "",
        url: data.url,
        language: data.language ?? "",
        stars: data.stars ?? 0,
        forks: data.forks ?? 0,
        updatedAt: new Date(),
      },
    });
    return sendOk(res, updated, "Repo updated");
  } catch (error: any) {
    if (error.code === "P2002") {
      return sendError(res, "Repo name must be unique", 400);
    }
    return sendError(res, error?.message || "Failed to update repo", 400);
  }
});

router.delete("/repos/:id", async (req, res) => {
  try {
    await prisma.repo.delete({ where: { id: req.params.id } });
    return sendOk(res, null, "Repo deleted");
  } catch (error: any) {
    return sendError(res, error?.message || "Failed to delete repo", 400);
  }
});

export default router;
