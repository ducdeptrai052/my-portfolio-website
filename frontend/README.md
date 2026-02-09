# Frontend (Portfolio UI)

React + Vite frontend for a personal portfolio and admin dashboard.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router
- TanStack Query
- TipTap editor
- Vercel Analytics

## Site Theme

A clean, editorial-inspired portfolio for a backend developer:

- Serif + sans typography
- Light and dark modes
- Glassy navigation and modern UI accents
- Focus on case studies, writing, and work showcase

## Development

```powershell
cd G:\my-portfolio-website\frontend
npm install
npm run dev
```

## Environment Variables

```bash
VITE_API_URL=http://localhost:4000
SITE_URL=http://localhost:8080
```

## Build & Prerender

```powershell
npm run build
```

This runs:

- `vite build`
- `scripts/prerender-blog.mjs` to generate SEO pages, OG images, sitemap, and robots.txt.
