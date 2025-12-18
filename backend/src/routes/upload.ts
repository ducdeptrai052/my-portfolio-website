import express from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { requireAuth } from "../middleware/auth";
import { supabase, supabaseBucket } from "../lib/supabase";
import { sendError, sendOk } from "../utils/response";
import type { Request } from "express";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(requireAuth);

router.post("/avatar", upload.single("file"), async (req: Request, res) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    return sendError(res, "No file uploaded", 400);
  }

  try {
    const ext = file.originalname.split(".").pop() || "jpg";
    const path = `avatars/${randomUUID()}.${ext}`;
    const oldUrl = (req.query.oldUrl as string | undefined) || undefined;

    const { error } = await supabase.storage
      .from(supabaseBucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      return sendError(res, error.message, 500);
    }

    // Delete previous file if provided
    if (oldUrl && oldUrl.includes(supabaseBucket)) {
      try {
        const url = new URL(oldUrl);
        const parts = url.pathname.split("/");
        const idx = parts.indexOf(supabaseBucket);
        const relativePath = idx >= 0 ? parts.slice(idx + 1).join("/") : null;
        if (relativePath) {
          await supabase.storage.from(supabaseBucket).remove([relativePath]);
        }
      } catch {
        // ignore cleanup errors
      }
    }

    const { data } = supabase.storage.from(supabaseBucket).getPublicUrl(path);
    const url = data.publicUrl;

    return sendOk(res, { url }, "Uploaded");
  } catch (err: any) {
    return sendError(res, err?.message || "Upload failed", 500);
  }
});

router.post("/resume", upload.single("file"), async (req: Request, res) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    return sendError(res, "No file uploaded", 400);
  }

  try {
    const ext = file.originalname.split(".").pop() || "pdf";
    const path = `resumes/${randomUUID()}.${ext}`;
    const oldUrl = (req.query.oldUrl as string | undefined) || undefined;

    const { error } = await supabase.storage
      .from(supabaseBucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      return sendError(res, error.message, 500);
    }

    if (oldUrl && oldUrl.includes(supabaseBucket)) {
      try {
        const url = new URL(oldUrl);
        const parts = url.pathname.split("/");
        const idx = parts.indexOf(supabaseBucket);
        const relativePath = idx >= 0 ? parts.slice(idx + 1).join("/") : null;
        if (relativePath) {
          await supabase.storage.from(supabaseBucket).remove([relativePath]);
        }
      } catch {
        // ignore cleanup errors
      }
    }

    const { data } = supabase.storage.from(supabaseBucket).getPublicUrl(path);
    const url = data.publicUrl;

    return sendOk(res, { url }, "Uploaded");
  } catch (err: any) {
    return sendError(res, err?.message || "Upload failed", 500);
  }
});

router.post("/media", upload.single("file"), async (req: Request, res) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    return sendError(res, "No file uploaded", 400);
  }

  try {
    const ext = file.originalname.split(".").pop() || "bin";
    const path = `media/${randomUUID()}.${ext}`;
    const oldUrl = (req.query.oldUrl as string | undefined) || undefined;

    const { error } = await supabase.storage
      .from(supabaseBucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      return sendError(res, error.message, 500);
    }

    if (oldUrl && oldUrl.includes(supabaseBucket)) {
      try {
        const url = new URL(oldUrl);
        const parts = url.pathname.split("/");
        const idx = parts.indexOf(supabaseBucket);
        const relativePath = idx >= 0 ? parts.slice(idx + 1).join("/") : null;
        if (relativePath) {
          await supabase.storage.from(supabaseBucket).remove([relativePath]);
        }
      } catch {
        // ignore cleanup errors
      }
    }

    const { data } = supabase.storage.from(supabaseBucket).getPublicUrl(path);
    const url = data.publicUrl;

    return sendOk(res, { url }, "Uploaded");
  } catch (err: any) {
    return sendError(res, err?.message || "Upload failed", 500);
  }
});

export default router;
