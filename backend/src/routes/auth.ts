import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { sendError, sendOk } from "../utils/response";

const router = express.Router();

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_EXPIRES_DAYS || 14);
const REFRESH_COOKIE_NAME = "refresh_token";

function createAccessToken(payload: { sub: string; email: string; role?: string }) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

function setRefreshCookie(res: any, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/auth",
    maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res: any) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/auth" });
}

// Use a loose type here so TS doesn't flag model access on the generated client
const db: any = prisma;

async function cleanupRefreshTokens(userId: string) {
  // Remove expired tokens for this user to keep table small
  await db.refreshToken.deleteMany({ where: { userId, expiresAt: { lt: new Date() } } });
  // Revoke any other active tokens for this user (single-session policy)
  await db.refreshToken.updateMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    data: { revokedAt: new Date() },
  });
}

async function issueTokens(res: any, user: any, req: any) {
  const accessToken = createAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await db.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      userAgent: req.get("user-agent") || "",
      ip: req.ip,
      expiresAt,
    },
  });

  setRefreshCookie(res, refreshToken);
  return accessToken;
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    console.log("[auth/login] missing credentials");
    return sendError(res, "Email and password are required", 400);
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`[auth/login] invalid email ${email}`);
    return sendError(res, "Invalid credentials", 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    console.log(`[auth/login] invalid password for ${email}`);
    return sendError(res, "Invalid credentials", 401);
  }

  await cleanupRefreshTokens(user.id);
  const token = await issueTokens(res, user, req);
  console.log(`[auth/login] success ${email}`);
  return sendOk(res, {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

router.post("/refresh", async (req, res) => {
  const token = (req as any).cookies?.[REFRESH_COOKIE_NAME];
  if (!token) return sendError(res, "Unauthorized", 401);

  const tokenHash = hashToken(token);
  const record = await db.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
  if (!record || !record.user) {
    clearRefreshCookie(res);
    return sendError(res, "Unauthorized", 401);
  }

  await db.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  });

  const accessToken = await issueTokens(res, record.user, req);
  return sendOk(res, { token: accessToken });
});

router.post("/logout", async (req, res) => {
  const token = (req as any).cookies?.[REFRESH_COOKIE_NAME];
  if (token) {
    const tokenHash = hashToken(token);
    await db.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  clearRefreshCookie(res);
  return sendOk(res, null, "Logged out");
});

router.get("/me", requireAuth, (req, res) => {
  console.log(`[auth/me] user ${req.user?.email}`);
  return sendOk(res, { user: req.user });
});

export default router;
