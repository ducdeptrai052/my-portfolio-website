type MetaTag = {
  name: string;
  attr: "name" | "property";
  content: string;
};

type PageMeta = {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  author?: string;
  jsonLd?: Record<string, unknown>;
};

const SITE_NAME = "Minh Duc";
const DEFAULT_OG_IMAGE = "https://www.hominhduc.cloud/og-image.svg";

export const upsertMetaTag = ({ name, attr, content }: MetaTag) => {
  if (!content || typeof document === "undefined") return;
  let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const removeMetaTag = (name: string, attr: "name" | "property") => {
  if (typeof document === "undefined") return;
  const tag = document.querySelector(`meta[${attr}="${name}"]`);
  tag?.parentElement?.removeChild(tag);
};

export const upsertLinkTag = (rel: string, href: string) => {
  if (!href || typeof document === "undefined") return;
  let tag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
};

export const upsertJsonLd = (id: string, data: Record<string, unknown>) => {
  if (typeof document === "undefined") return;
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

export const setPageMeta = ({ title, description, canonical, ogImage, ogType, author, jsonLd }: PageMeta) => {
  if (typeof document === "undefined") return;
  const url = canonical || window.location.href;
  const image = ogImage || DEFAULT_OG_IMAGE;

  document.title = title;
  upsertMetaTag({ name: "description", attr: "name", content: description });
  upsertMetaTag({ name: "author", attr: "name", content: author || SITE_NAME });

  // Open Graph
  upsertMetaTag({ name: "og:title", attr: "property", content: title });
  upsertMetaTag({ name: "og:description", attr: "property", content: description });
  upsertMetaTag({ name: "og:type", attr: "property", content: ogType || "website" });
  upsertMetaTag({ name: "og:url", attr: "property", content: url });
  upsertMetaTag({ name: "og:site_name", attr: "property", content: SITE_NAME });
  upsertMetaTag({ name: "og:locale", attr: "property", content: "en_US" });
  upsertMetaTag({ name: "og:image", attr: "property", content: image });

  // Twitter Card
  upsertMetaTag({ name: "twitter:card", attr: "name", content: ogImage ? "summary_large_image" : "summary" });
  upsertMetaTag({ name: "twitter:title", attr: "name", content: title });
  upsertMetaTag({ name: "twitter:description", attr: "name", content: description });
  upsertMetaTag({ name: "twitter:image", attr: "name", content: image });

  upsertLinkTag("canonical", url);

  // Breadcrumb JSON-LD
  if (jsonLd) {
    upsertJsonLd("page-jsonld", jsonLd);
  }
};
