# AGENTS.md

## Purpose

This repository is a full-stack personal portfolio website with:

- a public-facing portfolio site
- an admin CMS/dashboard
- media uploads
- a contact form
- blog and project management

This file gives AI coding agents enough context to work safely without guessing the project structure.

## Repo Shape

This is not a single root app. The real apps live in two separate folders:

- `frontend/`: Vite + React + TypeScript app for the public site and `/admin` dashboard
- `backend/`: Express + TypeScript API with Prisma and PostgreSQL

Important:

- Install and run dependencies separately inside `frontend/` and `backend/`
- Do not treat the root folder as a workspace app
- Do not edit generated folders like `frontend/dist/` or dependency folders like `node_modules/`

## Core Stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query, TipTap
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Storage: Supabase Storage
- Auth: JWT access token + refresh token in httpOnly cookie
- Email: Nodemailer / SMTP

## Key Entry Points

- Backend server bootstrap: `backend/src/server.ts`
- Backend route mounting: `backend/src/app.ts`
- Backend database schema: `backend/prisma/schema.prisma`
- Frontend router: `frontend/src/App.tsx`
- Frontend API helper: `frontend/src/lib/api.ts`
- Frontend auth helper: `frontend/src/lib/auth.ts`
- Frontend prerender script: `frontend/scripts/prerender-blog.mjs`

## High-Level Architecture

### Backend

The backend mounts four main route groups:

- `/health`: health check
- `/auth`: login, refresh, logout, current user
- `/api`: protected CMS endpoints
- `/public`: public read endpoints and contact submission
- `/upload`: protected upload endpoints

Notes:

- Protected CMS routes use `requireAuth`
- API responses use a consistent JSON envelope:
  - success: `{ status: "ok", message, data }`
  - error: `{ status: "error", message }`
- CORS depends on `FRONTEND_URL` or `FRONTEND_URLS`
- API responses disable caching

### Frontend

The frontend is one React app with two surfaces:

- public pages:
  - `/`
  - `/projects`
  - `/blog`
  - `/blog/:slug`
  - `/about`
  - `/resume`
  - `/certifications`
  - `/contact`
- admin pages under `/admin`

Admin routes are protected by `AuthGuard` and rendered inside `AdminLayout`.

## Domain Models

Main Prisma models in `backend/prisma/schema.prisma`:

- `User`
- `SiteSetting`
- `About`
- `TimelineEntry`
- `SkillGroup`
- `Skill`
- `Project`
- `Post`
- `Repo`
- `Certificate`
- `RefreshToken`
- `ContactMessage`

Important domain rules from the current code:

- `SiteSetting` behaves like a singleton record with `id = 1`
- `About` behaves like a singleton record with `id = 1`
- `About` stores timeline items split into `education` and `experience`
- Public project and blog endpoints only expose records with `status = "published"`
- Public repos depend on both `Repo.visible` and `SiteSetting.showOpenSource`
- Contact messages are stored in the database and then email notification is attempted

## Backend Behavior Details

Files to inspect first when changing backend behavior:

- `backend/src/routes/auth.ts`
- `backend/src/routes/cms.ts`
- `backend/src/routes/public.ts`
- `backend/src/routes/upload.ts`

Current CMS coverage includes:

- site settings
- about content and timeline
- skills
- projects
- blog posts
- GitHub repos
- certificates
- contact messages

Notable behavior:

- Settings and About records are auto-created with defaults when missing
- GitHub repo sync infers the username from env vars or configured GitHub URL
- Project and post slugs must be unique
- Certificate input is validated manually in the route layer

## Frontend Behavior Details

Files to inspect first when changing frontend behavior:

- `frontend/src/App.tsx`
- `frontend/src/lib/api.ts`
- `frontend/src/lib/auth.ts`
- `frontend/src/pages/`
- `frontend/src/pages/admin/`
- `frontend/src/components/admin/`

Important behavior:

- `apiFetch()` sends `credentials: "include"` on every request
- On `401`, the frontend tries `POST /auth/refresh` once, then logs out if refresh fails
- Build uses `npm run build`, which also runs `scripts/prerender-blog.mjs`
- Blog SEO/static artifacts may depend on the prerender script, not only React components

## Local Development

Backend:

```powershell
cd G:\my-portfolio-website\backend
npm install
npm run dev
```

Frontend:

```powershell
cd G:\my-portfolio-website\frontend
npm install
npm run dev
```

Database setup:

```powershell
cd G:\my-portfolio-website\backend
npx prisma migrate deploy
npx prisma db seed
```

## Environment Notes

Backend expects `.env` values such as:

- `DATABASE_URL`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Frontend expects:

- `VITE_API_URL`
- `SITE_URL`

Important port note:

- frontend docs suggest `VITE_API_URL=http://localhost:4000`
- backend code falls back to port `3000` when `PORT` is not set

AI agents should align these values explicitly instead of assuming the ports already match.

## Safe Editing Rules For Agents

- Prefer editing files under `backend/src/`, `backend/prisma/`, and `frontend/src/`
- Do not edit `.env` files unless the task explicitly asks for environment changes
- Do not commit or reveal secrets from `.env`
- Do not edit `frontend/dist/`, log files, or `node_modules/`
- When changing Prisma models, also review:
  - migrations
  - seed data
  - backend route payloads
  - frontend forms and display components
- When changing auth or cookies, verify:
  - `credentials: "include"` is preserved
  - CORS still allows the frontend origin
  - refresh flow still works
- When changing blog generation or SEO output, inspect `frontend/scripts/prerender-blog.mjs`

## Suggested Starting Points By Task

- New API field or CMS content type:
  - start with `backend/prisma/schema.prisma`
  - then `backend/src/routes/cms.ts` and `backend/src/routes/public.ts`
  - then related admin/public pages in `frontend/src/pages/`

- Auth issue:
  - start with `backend/src/routes/auth.ts`
  - then `backend/src/middleware/auth.ts`
  - then `frontend/src/lib/auth.ts` and `frontend/src/lib/api.ts`

- Upload issue:
  - start with `backend/src/routes/upload.ts`
  - then frontend editor/forms that call upload endpoints

- Blog rendering or SEO issue:
  - start with `frontend/src/pages/BlogPage.tsx`
  - `frontend/src/pages/BlogDetailPage.tsx`
  - and `frontend/scripts/prerender-blog.mjs`

## Verification Notes

There is no obvious automated test setup at the root, and the package scripts currently focus on development/build tasks. When making changes, agents should verify with the most relevant combination of:

- backend dev server run
- frontend dev server run
- frontend build
- frontend lint
- targeted manual checks for auth, admin CMS, and public pages

## Extra References

Read these files for more context when needed:

- `README.md`
- `backend/README.md`
- `frontend/README.md`
