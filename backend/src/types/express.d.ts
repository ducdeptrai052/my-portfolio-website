import type { User } from ".prisma/client";

declare global {
  namespace Express {
    // Minimal shape stored on req.user after JWT verification
    interface Request {
      user?: Pick<User, "id" | "email" | "name" | "role">;
    }
  }
}

export {};
