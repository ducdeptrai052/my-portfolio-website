import express from "express";
import prisma from "../lib/prisma";
import { sendOk, sendError } from "../utils/response";

const router = express.Router();

router.get("/skills", async (_req, res) => {
  try {
    const groups = await prisma.skillGroup.findMany({
      include: { skills: true },
      orderBy: { name: "asc" },
    });
    return sendOk(res, { groups });
  } catch (error: any) {
    return sendError(res, error?.message || "Failed to fetch skills", 500);
  }
});

router.get("/settings", async (_req, res) => {
  try {
    const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
    if (!settings) return sendOk(res, null);
    return sendOk(res, settings);
  } catch (error: any) {
    return sendError(res, error?.message || "Failed to fetch settings", 500);
  }
});

router.get("/about", async (_req, res) => {
  try {
    const about = await prisma.about.findUnique({
      where: { id: 1 },
      include: { timelines: true },
    });
    if (!about) return sendOk(res, null);
    const payload = {
      shortBio: about.shortBio,
      longStory: about.longStory,
      education: about.timelines.filter((t) => t.type === "education"),
      experience: about.timelines.filter((t) => t.type === "experience"),
    };
    return sendOk(res, payload);
  } catch (error: any) {
    return sendError(res, error?.message || "Failed to fetch about", 500);
  }
});

router.get("/projects", async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "published" },
      orderBy: { updatedAt: "desc" },
    });
    return sendOk(res, projects);
  } catch (error: any) {
    return sendError(res, error?.message || "Failed to fetch projects", 500);
  }
});

router.get("/posts", async (_req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "published" },
      orderBy: { updatedAt: "desc" },
    });
    return sendOk(res, posts);
  } catch (error: any) {
    return sendError(res, error?.message || "Failed to fetch posts", 500);
  }
});

router.get("/repos", async (_req, res) => {
  try {
    const repos = await prisma.repo.findMany({
      orderBy: { stars: "desc" },
    });
    return sendOk(res, repos);
  } catch (error: any) {
    return sendError(res, error?.message || "Failed to fetch repos", 500);
  }
});

export default router;
