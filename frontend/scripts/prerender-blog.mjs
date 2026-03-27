import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const indexPath = path.join(distDir, "index.html");
const ogDir = path.join(distDir, "og");

const normalizeUrl = (value) => (value ? value.replace(/\/+$/, "") : "");
const siteUrl = normalizeUrl(
  process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8080")
);
const apiBase = normalizeUrl(process.env.VITE_API_URL || process.env.API_URL || "http://localhost:3000");
const defaultOgImage = `${siteUrl}/og-image.svg`;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4] },
    link: {
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
    },
    underline: {},
  }),
  TextStyle,
  Color,
  Image,
  Youtube.configure({ controls: true, nocookie: true, width: 640, height: 360 }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
];

const renderContent = (content) => {
  if (!content) return "";
  try {
    const parsed = JSON.parse(content);
    if (parsed && parsed.type === "doc") {
      return generateHTML(parsed, extensions);
    }
  } catch {
    // ignore JSON parse errors
  }
  return `<p>${escapeHtml(content)}</p>`;
};

const buildJsonLd = ({ title, description, url, image, date }) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: title,
  description,
  image: image || undefined,
  datePublished: date,
  dateModified: date,
  author: {
    "@type": "Person",
    name: "Minh Duc",
    url: siteUrl,
  },
  publisher: {
    "@type": "Person",
    name: "Minh Duc",
    url: siteUrl,
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": url,
  },
});

const injectHead = (html, meta) => {
  const cleaned = html
    .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(/<meta name="description" content=".*?"\s*\/?>/i, `<meta name="description" content="${escapeHtml(meta.description)}" />`)
    .replace(/<meta property="og:[^"]+" content=".*?"\s*\/?>/gi, "")
    .replace(/<meta name="twitter:[^"]+" content=".*?"\s*\/?>/gi, "")
    .replace(/<link rel="canonical" href=".*?"\s*\/?>/gi, "");

  const image = meta.image || defaultOgImage;
  const ogType = meta.ogType || "article";

  const ogTags = [
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.url)}" />`,
    `<meta property="og:site_name" content="Minh Duc" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
  ];

  const twitterTags = [
    `<meta name="twitter:card" content="${meta.image ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  ];

  const authorTag = `<meta name="author" content="Minh Duc" />`;
  const canonical = `<link rel="canonical" href="${escapeHtml(meta.url)}" />`;

  // Merge breadcrumb into JSON-LD if provided
  const jsonLdData = meta.breadcrumb
    ? { ...meta.jsonLd, breadcrumb: meta.breadcrumb }
    : meta.jsonLd;
  const jsonLd = `<script type="application/ld+json">${JSON.stringify(jsonLdData)}</script>`;

  return cleaned.replace(
    "</head>",
    `${authorTag}\n${canonical}\n${ogTags.join("\n")}\n${twitterTags.join("\n")}\n${jsonLd}\n</head>`
  );
};

const injectRoot = (html, body) => {
  return html.replace(/<div id="root"><\/div>/i, `<div id="root">${body}</div>`);
};

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const toSlug = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "post";

const buildOgSvg = ({
  title = "Blog",
  subtitle = "Minh Duc",
  description = "",
  accent = "#38bdf8",
}) => {
  const safeTitle = escapeHtml(title);
  const safeSubtitle = escapeHtml(subtitle);
  const safeDescription = escapeHtml(description);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0b1120"/>
      <stop offset="1" stop-color="#111827"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="70" y="70" width="1060" height="490" rx="32" fill="#0f172a" stroke="#1f2937" stroke-width="2"/>
  <rect x="70" y="70" width="16" height="490" rx="8" fill="${accent}"/>
  <text x="130" y="240" fill="#e2e8f0" font-family="Playfair Display, serif" font-size="56" font-weight="600">
    ${safeTitle}
  </text>
  <text x="130" y="320" fill="#94a3b8" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="500">
    ${safeSubtitle}
  </text>
  ${
    safeDescription
      ? `<text x="130" y="400" fill="#64748b" font-family="Inter, Arial, sans-serif" font-size="22">${safeDescription}</text>`
      : ""
  }
</svg>`;
};

const fetchPosts = async () => {
  try {
    const res = await fetch(`${apiBase}/public/posts`);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
};

const resolveImageUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${siteUrl}${value}`;
  return `${siteUrl}/${value}`;
};

const fetchPublic = async (path) => {
  try {
    const res = await fetch(`${apiBase}${path}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
};

const fetchSettings = () => fetchPublic("/public/settings");
const fetchAbout = () => fetchPublic("/public/about");
const fetchProjects = () => fetchPublic("/public/projects");

const writePage = async (route, meta, body, indexHtml) => {
  const html = injectRoot(injectHead(indexHtml, meta), body);
  const normalized = route.replace(/^\/+/, "");
  const outDir = normalized ? path.join(distDir, normalized) : distDir;
  await ensureDir(outDir);
  await fs.writeFile(path.join(outDir, "index.html"), html, "utf-8");
};

const run = async () => {
  const indexHtml = await fs.readFile(indexPath, "utf-8");
  await ensureDir(ogDir);
  const posts = await fetchPosts();
  const settings = (await fetchSettings()) || {};
  const about = (await fetchAbout()) || {};
  const projectsData = await fetchProjects();
  const projects = Array.isArray(projectsData) ? projectsData : [];

  const siteTitle = settings.siteTitle || "Minh Duc";
  const siteTagline = settings.tagline || "Backend Developer & Automation";
  const heroIntro = settings.heroIntro || "";

  const blogListHtml = `
    <main class="prerender">
      <article>
        <h1>Blog</h1>
        <p>Latest posts from Minh Duc.</p>
        <ul>
          ${posts
            .map(
              (post) =>
                `<li><a href="${siteUrl}/blog/${post.slug}">${escapeHtml(post.title || post.slug)}</a></li>`
            )
            .join("")}
        </ul>
      </article>
    </main>
  `;

  const buildBreadcrumb = (...items) => ({
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  });

  const blogMeta = {
    title: "Blog | Minh Duc",
    description: "Latest posts from Minh Duc.",
    url: `${siteUrl}/blog`,
    image: defaultOgImage,
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Minh Duc Blog",
      url: `${siteUrl}/blog`,
    },
    breadcrumb: buildBreadcrumb(
      { name: "Home", url: `${siteUrl}/` },
      { name: "Blog", url: `${siteUrl}/blog` }
    ),
  };

  await writePage("/blog", blogMeta, blogListHtml, indexHtml);

  const homeBody = `
    <main class="prerender">
      <article>
        <h1>${escapeHtml(siteTitle)}</h1>
        ${siteTagline ? `<p>${escapeHtml(siteTagline)}</p>` : ""}
        ${heroIntro ? `<p>${escapeHtml(heroIntro)}</p>` : ""}
      </article>
    </main>
  `;
  await writePage(
    "/",
    {
      title: `${siteTitle} | Developer Portfolio`,
      description: heroIntro || siteTagline || "Personal portfolio and blog.",
      url: `${siteUrl}/`,
      image: defaultOgImage,
      ogType: "website",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Person",
        name: siteTitle,
        url: `${siteUrl}/`,
        jobTitle: "Backend Developer",
        sameAs: [
          "https://github.com/ducdeptrai052",
          "https://www.linkedin.com/in/duc-ho-073aa8153/",
        ],
      },
    },
    homeBody,
    indexHtml
  );

  const projectsList = projects
    .map(
      (project) =>
        `<li><strong>${escapeHtml(project.title || "")}</strong>${project.shortDescription ? ` — ${escapeHtml(project.shortDescription)}` : ""}</li>`
    )
    .join("");
  const projectsBody = `
    <main class="prerender">
      <article>
        <h1>Projects</h1>
        <p>A collection of things I've built.</p>
        ${projectsList ? `<ul>${projectsList}</ul>` : "<p>No projects yet.</p>"}
      </article>
    </main>
  `;
  await writePage(
    "/projects",
    {
      title: `Projects | ${siteTitle}`,
      description: "A collection of projects and open source contributions.",
      url: `${siteUrl}/projects`,
      image: defaultOgImage,
      ogType: "website",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Projects",
        url: `${siteUrl}/projects`,
      },
      breadcrumb: buildBreadcrumb(
        { name: "Home", url: `${siteUrl}/` },
        { name: "Projects", url: `${siteUrl}/projects` }
      ),
    },
    projectsBody,
    indexHtml
  );

  const aboutBody = `
    <main class="prerender">
      <article>
        <h1>About</h1>
        ${about.shortBio ? `<p>${escapeHtml(about.shortBio)}</p>` : ""}
        ${about.longStory ? `<p>${escapeHtml(about.longStory)}</p>` : ""}
      </article>
    </main>
  `;
  await writePage(
    "/about",
    {
      title: `About | ${siteTitle}`,
      description: about.shortBio || siteTagline || "Learn more about Minh Duc.",
      url: `${siteUrl}/about`,
      image: defaultOgImage,
      ogType: "profile",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        name: `About ${siteTitle}`,
        url: `${siteUrl}/about`,
        mainEntity: {
          "@type": "Person",
          name: siteTitle,
          jobTitle: "Backend Developer",
          url: `${siteUrl}/`,
        },
      },
      breadcrumb: buildBreadcrumb(
        { name: "Home", url: `${siteUrl}/` },
        { name: "About", url: `${siteUrl}/about` }
      ),
    },
    aboutBody,
    indexHtml
  );

  const resumeBody = `
    <main class="prerender">
      <article>
        <h1>Resume</h1>
        <p>Download or preview my latest resume.</p>
      </article>
    </main>
  `;
  await writePage(
    "/resume",
    {
      title: `Resume | ${siteTitle}`,
      description: "Download or preview my latest resume.",
      url: `${siteUrl}/resume`,
      image: defaultOgImage,
      ogType: "website",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Resume",
        url: `${siteUrl}/resume`,
      },
      breadcrumb: buildBreadcrumb(
        { name: "Home", url: `${siteUrl}/` },
        { name: "Resume", url: `${siteUrl}/resume` }
      ),
    },
    resumeBody,
    indexHtml
  );

  const contactBody = `
    <main class="prerender">
      <article>
        <h1>Contact</h1>
        <p>Get in touch for projects, consulting, or collaboration.</p>
      </article>
    </main>
  `;
  await writePage(
    "/contact",
    {
      title: `Contact | ${siteTitle}`,
      description: "Get in touch for projects, consulting, or collaboration.",
      url: `${siteUrl}/contact`,
      image: defaultOgImage,
      ogType: "website",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact",
        url: `${siteUrl}/contact`,
      },
      breadcrumb: buildBreadcrumb(
        { name: "Home", url: `${siteUrl}/` },
        { name: "Contact", url: `${siteUrl}/contact` }
      ),
    },
    contactBody,
    indexHtml
  );

  for (const post of posts) {
    const title = post.title || "Blog Post";
    const description = post.excerpt || "Read the latest blog post.";
    const url = `${siteUrl}/blog/${post.slug}`;
    const ogName = `blog-${toSlug(post.slug || title)}.svg`;
    const ogPath = path.join(ogDir, ogName);
    const ogPublicUrl = `${siteUrl}/og/${ogName}`;
    const ogSvg = buildOgSvg({ title, subtitle: siteTitle, description });
    await fs.writeFile(ogPath, ogSvg, "utf-8");
    const image = resolveImageUrl(post.coverImageUrl || post.coverImage || ogPublicUrl || defaultOgImage);
    const date = post.updatedAt || post.createdAt || new Date().toISOString();
    const contentHtml = renderContent(post.content);

    const articleHtml = `
      <main class="prerender">
        <article>
          <h1>${escapeHtml(title)}</h1>
          ${description ? `<p>${escapeHtml(description)}</p>` : ""}
          ${contentHtml}
        </article>
      </main>
    `;

    const meta = {
      title: `${title} | Minh Duc`,
      description,
      url,
      image,
      ogType: "article",
      jsonLd: buildJsonLd({ title, description, url, image, date }),
      breadcrumb: buildBreadcrumb(
        { name: "Home", url: `${siteUrl}/` },
        { name: "Blog", url: `${siteUrl}/blog` },
        { name: title, url }
      ),
    };

    const html = injectRoot(injectHead(indexHtml, meta), articleHtml);
    const postDir = path.join(distDir, "blog", post.slug);
    await ensureDir(postDir);
    await fs.writeFile(path.join(postDir, "index.html"), html, "utf-8");
  }

  const staticRoutes = ["/", "/projects", "/about", "/resume", "/contact", "/blog", "/certifications"];
  const urls = [
    ...staticRoutes.map((route) => ({ loc: `${siteUrl}${route}`, lastmod: new Date().toISOString() })),
    ...posts.map((post) => ({
      loc: `${siteUrl}/blog/${post.slug}`,
      lastmod: post.updatedAt || post.createdAt || new Date().toISOString(),
    })),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${new Date(item.lastmod).toISOString()}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>
`;
  await fs.writeFile(path.join(distDir, "sitemap.xml"), sitemap, "utf-8");

  const robots = `User-agent: *
Allow: /
Disallow: /admin
Sitemap: ${siteUrl}/sitemap.xml
`;
  await fs.writeFile(path.join(distDir, "robots.txt"), robots, "utf-8");
};

run().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
