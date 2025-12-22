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

const normalizeUrl = (value) => (value ? value.replace(/\/+$/, "") : "");
const siteUrl = normalizeUrl(
  process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8080")
);
const apiBase = normalizeUrl(process.env.VITE_API_URL || process.env.API_URL || "http://localhost:3000");

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

  const ogTags = [
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:url" content="${escapeHtml(meta.url)}" />`,
  ];
  if (meta.image) {
    ogTags.push(`<meta property="og:image" content="${escapeHtml(meta.image)}" />`);
  }

  const twitterTags = [
    `<meta name="twitter:card" content="${meta.image ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
  ];
  if (meta.image) {
    twitterTags.push(`<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`);
  }

  const canonical = `<link rel="canonical" href="${escapeHtml(meta.url)}" />`;
  const jsonLd = `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`;

  return cleaned.replace(
    "</head>",
    `${canonical}\n${ogTags.join("\n")}\n${twitterTags.join("\n")}\n${jsonLd}\n</head>`
  );
};

const injectRoot = (html, body) => {
  return html.replace(/<div id="root"><\/div>/i, `<div id="root">${body}</div>`);
};

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
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

const run = async () => {
  const indexHtml = await fs.readFile(indexPath, "utf-8");
  const posts = await fetchPosts();

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

  const blogMeta = {
    title: "Blog | Minh Duc",
    description: "Latest posts from Minh Duc.",
    url: `${siteUrl}/blog`,
    image: "",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Minh Duc Blog",
      url: `${siteUrl}/blog`,
    },
  };

  const blogHtml = injectRoot(injectHead(indexHtml, blogMeta), blogListHtml);
  await ensureDir(path.join(distDir, "blog"));
  await fs.writeFile(path.join(distDir, "blog", "index.html"), blogHtml, "utf-8");

  for (const post of posts) {
    const title = post.title || "Blog Post";
    const description = post.excerpt || "Read the latest blog post.";
    const url = `${siteUrl}/blog/${post.slug}`;
    const image = post.coverImageUrl || post.coverImage || "";
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
      jsonLd: buildJsonLd({ title, description, url, image, date }),
    };

    const html = injectRoot(injectHead(indexHtml, meta), articleHtml);
    const postDir = path.join(distDir, "blog", post.slug);
    await ensureDir(postDir);
    await fs.writeFile(path.join(postDir, "index.html"), html, "utf-8");
  }

  const staticRoutes = ["/", "/projects", "/about", "/resume", "/contact", "/blog"];
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
Sitemap: ${siteUrl}/sitemap.xml
`;
  await fs.writeFile(path.join(distDir, "robots.txt"), robots, "utf-8");
};

run().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
