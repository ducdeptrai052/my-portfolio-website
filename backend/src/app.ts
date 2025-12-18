import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import cmsRouter from "./routes/cms";
import uploadRouter from "./routes/upload";
import publicRouter from "./routes/public";
import { sendOk } from "./utils/response";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:8080";

// Disable default ETag/304 handling to avoid cached API responses in admin
app.set("etag", false);

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// Prevent browser caching for API responses
app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use(
  morgan((tokens, req, res) => {
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const status = tokens.status(req, res);
    const time = tokens["response-time"](req, res);
    const length = tokens.res(req, res, "content-length") || "-";
    return `${method} ${url} ${status} ${time} ms ${length}`;
  })
);

app.get("/health", (_req, res) => {
  return sendOk(res, { status: "ok" });
});

app.use("/auth", authRouter);
app.use("/api", cmsRouter);
app.use("/upload", uploadRouter);
app.use("/public", publicRouter);

export default app;
