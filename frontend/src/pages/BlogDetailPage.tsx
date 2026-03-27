import "@/styles/highlight-theme.css";
import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Calendar, Clock, Share2, X, Copy, Linkedin, Facebook, Twitter, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BlogCard } from "@/components/BlogCard";
import { CallToActionSection } from "@/components/CallToActionSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { loadPosts, type Post } from "@/data/posts";
import { cn } from "@/lib/utils";
import { setPageMeta, upsertJsonLd } from "@/lib/seo";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import DOMPurify from "dompurify";
import { ARTICLE_PROSE_CLASSES, getHtmlFromJson, parseJsonDoc } from "@/lib/editor";
import { highlightCodeBlocks } from "@/lib/highlight";
import type { JSONContent } from "@tiptap/core";

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/d/g, "d")
    .replace(/D/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const extractHeadingsFromMarkdown = (markdown: string): TocItem[] => {
  const lines = markdown.split("\n");
  const items: TocItem[] = [];
  const counts = new Map<string, number>();
  lines.forEach((line) => {
    const match = line.match(/^(#{2,3})\s+(.*)/);
    if (!match) return;
    const level = match[1].length === 2 ? 2 : 3;
    const text = match[2].trim();
    if (!text) return;
    const base = slugify(text);
    const count = (counts.get(base) || 0) + 1;
    counts.set(base, count);
    const id = count > 1 ? `${base}-${count}` : base;
    items.push({ id, text, level });
  });
  return items;
};

const extractHeadingsFromDoc = (doc: JSONContent | null): TocItem[] => {
  const items: TocItem[] = [];
  const counts = new Map<string, number>();
  const walk = (node: JSONContent | null | undefined) => {
    if (!node) return;
    if (node.type === "heading" && (node.attrs?.level === 2 || node.attrs?.level === 3)) {
      const text = (node.content ?? [])
        .map((child) => (child.type === "text" ? child.text ?? "" : ""))
        .join("")
        .trim();
      if (text) {
        const base = slugify(text);
        const count = (counts.get(base) || 0) + 1;
        counts.set(base, count);
        const id = count > 1 ? `${base}-${count}` : base;
        items.push({ id, text, level: node.attrs.level });
      }
    }
    node.content?.forEach(walk);
  };
  walk(doc);
  return items;
};

const addIdsToHtml = (html: string, toc: TocItem[]) => {
  if (typeof window === "undefined") return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const headings = Array.from(doc.querySelectorAll("h2, h3"));
  headings.forEach((heading, index) => {
    const item = toc[index];
    if (item) heading.id = item.id;
  });
  doc.querySelectorAll("a").forEach((link) => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });
  doc.querySelectorAll("img").forEach((img) => {
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
  });
  doc.querySelectorAll("iframe").forEach((frame) => {
    frame.setAttribute("loading", "lazy");
  });
  return doc.body.innerHTML;
};


export default function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroError, setHeroError] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const contentRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const backLinkRef = useRef<HTMLDivElement | null>(null);
  const tocNavRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const relatedSkeletons = Array.from({ length: 3 }, (_, i) => (
    <div key={`related-skeleton-${i}`} className="h-48 rounded-xl border bg-muted animate-pulse" />
  ));

  useEffect(() => {
    let active = true;
    if (!slug) {
      setPost(null);
      setRelatedPosts([]);
      setError("Post not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    loadPosts()
      .then((data) => {
        if (!active) return;
        const current = data.find((p) => p.slug === slug);
        setPost(current ?? null);
        setRelatedPosts(data.filter((p) => p.slug !== slug).slice(0, 3));
        setError(current ? null : "Post not found");
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err?.message || "Failed to load post");
        setPost(null);
        setRelatedPosts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [slug]);

  const formattedDate = post ? new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  }) : "";
  const heroSrc = post?.coverImage || "";
  const contentDoc = post ? parseJsonDoc(post.content) : null;
  const jsonHtml = contentDoc ? getHtmlFromJson(contentDoc) : "";
  const isHtmlContent = !!post && (jsonHtml ? true : /<\/?[a-z][\s\S]*>/i.test(post.content));
  const tocItems = useMemo(() => {
    if (!post) return [];
    if (contentDoc) return extractHeadingsFromDoc(contentDoc);
    if (isHtmlContent) return extractHeadingsFromMarkdown(post.content);
    return extractHeadingsFromMarkdown(post.content);
  }, [contentDoc, isHtmlContent, post]);
  const sanitizedHtml = useMemo(() => {
    if (!isHtmlContent) return "";
    const html = jsonHtml || post?.content || "";
    const cleaned = DOMPurify.sanitize(html, {
      ADD_TAGS: ["iframe"],
      ADD_ATTR: [
        "allow",
        "allowfullscreen",
        "frameborder",
        "scrolling",
        "src",
        "title",
        "width",
        "height",
        "target",
        "rel",
      ],
    });
    return addIdsToHtml(cleaned, tocItems);
  }, [isHtmlContent, jsonHtml, post?.content, tocItems]);

  useEffect(() => {
    if (!contentRef.current || tocItems.length === 0) return;
    const headings = Array.from(contentRef.current.querySelectorAll<HTMLElement>("h2, h3"));
    if (headings.length === 0) return;

    const topOffset = 120;
    let ticking = false;

    const updateActive = () => {
      let nextActive: string | null = null;
      headings.forEach((heading) => {
        const top = heading.getBoundingClientRect().top;
        if (top <= topOffset) {
          nextActive = heading.id;
        }
      });

      if (!nextActive && headings.length > 0) {
        nextActive = headings[0].id;
      }

      if (nextActive) {
        setActiveId(nextActive);
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
    };

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [tocItems, sanitizedHtml, loading]);

  useEffect(() => {
    if (!activeId || !tocNavRef.current) return;
    const nav = tocNavRef.current;
    const activeLink = nav.querySelector<HTMLAnchorElement>(`a[href="#${activeId}"]`);
    if (!activeLink) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const offsetTop = linkRect.top - navRect.top;
    const offsetBottom = linkRect.bottom - navRect.bottom;
    if (offsetTop < 0) {
      nav.scrollTop += offsetTop - 8;
    } else if (offsetBottom > 0) {
      nav.scrollTop += offsetBottom + 8;
    }
  }, [activeId]);

  useEffect(() => {
    if (!loading && post) {
      highlightCodeBlocks(contentRef.current);
    }
  }, [loading, post, sanitizedHtml]);

  useEffect(() => {
    if (!post) return;
    const title = post.title || "Blog Post";
    const description = post.excerpt || "Read the latest blog post.";
    const url = `https://www.hominhduc.cloud/blog/${post.slug}`;
    const image = post.coverImage || undefined;
    const isoDate = post.date ? new Date(post.date).toISOString() : new Date().toISOString();

    setPageMeta({
      title: `${title} | minhduc.dev`,
      description,
      canonical: url,
      ogImage: image,
      ogType: "article",
    });

    upsertJsonLd("blog-jsonld", {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title,
      description,
      image: image || undefined,
      datePublished: isoDate,
      dateModified: isoDate,
      author: {
        "@type": "Person",
        name: "Minh Duc",
        url: "https://www.hominhduc.cloud/",
      },
      publisher: {
        "@type": "Person",
        name: "Minh Duc",
        url: "https://www.hominhduc.cloud/",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url,
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.hominhduc.cloud/" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.hominhduc.cloud/blog" },
          { "@type": "ListItem", position: 3, name: title, item: url },
        ],
      },
    });
  }, [post]);

  const openShare = () => {
    if (!post) return;
    const url = window.location.href;
    setShareUrl(url);
    setShareOpen(true);
  };

  useEffect(() => {
    if (!shareOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShareOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [shareOpen]);

  const handleCopyShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied", description: "Share link copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: "Could not copy the link.", variant: "destructive" });
    }
  };

  const shareLinks = useMemo(() => {
    if (!shareUrl || !post) return null;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(post.title || "");
    return {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    };
  }, [post, shareUrl]);

  if (!loading && (!post || error)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center px-4">
          <h1 className="font-serif text-4xl mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-6">{error || "The requested post does not exist."}</p>
          <Button asChild><Link to="/blog">Back to blog</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {shareOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white text-white shadow-2xl dark:bg-neutral-900">
              <div className="flex items-start justify-between px-6 pt-6 pb-3 text-black dark:text-white">
              <div>
                <h3 className="text-xl font-semibold">Shareable public link</h3>
                <p className="text-sm text-black/60 dark:text-white/75">Share this blog post anywhere.</p>
              </div>
              <button
                type="button"
                onClick={() => setShareOpen(false)}
                className="rounded-full p-2 text-black/60 hover:bg-black/5 hover:text-black dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              </div>

              <div className="px-6 pb-6 space-y-4">
              <div className="flex flex-col gap-3 rounded-2xl bg-black/5 p-4 sm:flex-row sm:items-center dark:bg-white/10">
                <Input
                  readOnly
                  value={shareUrl}
                  className="border-black/10 bg-white text-black placeholder:text-black/40 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/50"
                />
                <Button
                  type="button"
                  onClick={handleCopyShare}
                  className="sm:shrink-0 bg-black text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/90"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy link
                </Button>
              </div>

                <div className="flex items-start gap-2 text-xs text-black/60 dark:text-white/70">
                  <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-black/30 text-[10px] dark:border-white/50">i</span>
                  <p>Public links can be reshared. Share responsibly.</p>
                </div>

                {shareLinks && (
                  <div className="flex flex-wrap justify-center gap-6 pt-2 text-center">
                    <a
                      href={shareLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-24 flex-col items-center gap-2 text-xs text-white/70 hover:text-white"
                    >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A66C2]/15 text-xl text-[#0A66C2] shadow-[0_10px_25px_rgba(10,102,194,0.25)]">
                        <Linkedin className="h-5 w-5" />
                      </span>
                      Linkedin
                    </a>
                    <a
                      href={shareLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-24 flex-col items-center gap-2 text-xs text-white/70 hover:text-white"
                    >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877F2]/15 text-xl text-[#1877F2] shadow-[0_10px_25px_rgba(24,119,242,0.25)]">
                        <Facebook className="h-5 w-5" />
                      </span>
                      Facebook
                    </a>
                    <a
                      href={shareLinks.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-24 flex-col items-center gap-2 text-xs text-white/70 hover:text-white"
                    >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/5 text-xl text-black shadow-[0_10px_25px_rgba(0,0,0,0.08)] dark:bg-white/15 dark:text-white dark:shadow-[0_10px_25px_rgba(255,255,255,0.15)]">
                        <Twitter className="h-5 w-5" />
                      </span>
                      X
                    </a>
                    <a
                      href={shareLinks.reddit}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-24 flex-col items-center gap-2 text-xs text-white/70 hover:text-white"
                    >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF4500]/15 text-xl text-[#FF4500] shadow-[0_10px_25px_rgba(255,69,0,0.25)]">
                        <MessageCircle className="h-5 w-5" />
                      </span>
                      Reddit
                    </a>
                  </div>
                )}
              </div>
            </div>
        </div>
      )}
      <article className="pt-24 pb-24">
        <div className="container mx-auto px-4 overflow-visible lg:grid lg:grid-cols-[260px_minmax(0,720px)_260px] lg:gap-10">
          {/* hiển thị cover image ở bài blog */}
          {/* {!loading && post && (
            <div className="lg:col-span-3">
              {heroSrc && !heroError && (
                <div className="flex justify-center mb-10">
                  <img
                    src={heroSrc}
                    alt={post.title}
                    className="w-full max-w-[900px] aspect-[2/1] object-cover rounded-2xl shadow-lg border border-border/40 bg-white/60 dark:bg-muted"
                    onError={() => setHeroError(true)}
                    onLoad={() => {
                      if (contentRef.current && titleRef.current) {
                        const contentTop = contentRef.current.getBoundingClientRect().top;
                        const titleTop = titleRef.current.getBoundingClientRect().top;
                        setTocOffset(Math.max(0, Math.round(titleTop - contentTop)));
                      }
                    }}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </div>
              )}
              {(!heroSrc || heroError) && (
                <div className="flex justify-center mb-10">
                  <div className="w-full max-w-[900px] aspect-[2/1] rounded-2xl border border-dashed border-border/50 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    No cover image
                  </div>
                </div>
              )}
            </div>
          )} */}
          <div
            className="w-full max-w-3xl mx-auto lg:max-w-none lg:mx-0 lg:col-start-2 lg:col-end-3"
            ref={contentRef}
          >
            <div ref={backLinkRef} className="mb-10">
              <Button variant="ghost" asChild>
                <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to blog</Link>
              </Button>
            </div>

            <div className="lg:hidden mb-8">
              <details className="rounded-2xl border border-border/60 bg-white/80 dark:bg-card/80 p-4 shadow-sm">
                <summary className="cursor-pointer font-semibold">Table Of Contents</summary>
                <div className="mt-3 space-y-2 text-sm">
                  {tocItems.length === 0 && <p className="text-muted-foreground">No sections</p>}
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={cn(
                        "block text-muted-foreground hover:text-foreground",
                        item.level === 3 ? "ml-3" : ""
                      )}
                    >
                      {item.text}
                    </a>
                  ))}
                </div>
              </details>
            </div>

            {loading ? (
              <div className="space-y-6 animate-pulse">
                <div className="w-full aspect-[2/1] rounded-lg bg-muted" />
                <div className="h-7 w-40 bg-muted rounded" />
                <div className="h-10 w-3/4 bg-muted rounded" />
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                </div>
              </div>
            ) : post && (
              <>
                <article className="mx-auto w-full max-w-3xl px-4 lg:px-0">
                  <div className={ARTICLE_PROSE_CLASSES}>
                    <div className="not-prose flex flex-wrap items-center gap-4 mb-5 text-sm text-muted-foreground">
                      <Badge className="capitalize bg-black text-white dark:bg-white dark:text-black">{post.category}</Badge>
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formattedDate}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{post.readTime}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-auto text-xs"
                        onClick={openShare}
                      >
                        <Share2 className="mr-2 h-3.5 w-3.5" />
                        Share
                      </Button>
                    </div>

                    <h1 ref={titleRef}>{post.title}</h1>
                    {post.excerpt && (
                      <p className="lead text-muted-foreground">{post.excerpt}</p>
                    )}

                    {isHtmlContent ? (
                      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          h2: (props) => {
                            const text = String(props.children ?? "");
                            const id = slugify(text);
                            return <h2 id={id} {...props} />;
                          },
                          h3: (props) => {
                            const text = String(props.children ?? "");
                            const id = slugify(text);
                            return <h3 id={id} {...props} />;
                          },
                          a: ({ node: _node, ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" />
                          ),
                          img: ({ node: _node, ...props }) => (
                            <img
                              {...props}
                              loading="lazy"
                              decoding="async"
                            />
                          ),
                        }}
                      >
                        {post.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </article>
                <CallToActionSection />
              </>
            )}
          </div>
          <aside className="hidden lg:block lg:col-start-3 lg:col-end-4 lg:self-start toc-sticky">
            <div className="space-y-4 h-fit rounded-xl border border-border/60 bg-card/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-[0_12px_30px_-18px_rgba(0,0,0,0.85)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground text-center dark:text-white/70">
                Table Of Contents
              </p>
              <nav
                ref={tocNavRef}
                className="space-y-2 text-sm max-h-[45vh] overflow-y-auto pr-2 scroll-smooth"
              >
                {tocItems.length === 0 && (
                  <p className="text-muted-foreground">No sections</p>
                )}
                {tocItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={cn(
                      "block rounded-md px-2 py-1 text-foreground/80 font-medium hover:text-foreground hover:bg-primary/10 transition dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10",
                      item.id === activeId &&
                        "bg-primary/20 text-foreground dark:bg-white/15 dark:text-white font-semibold dark:ring-1 dark:ring-white/10",
                      item.level === 3 ? "ml-3" : ""
                    )}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        </div>

        <div className="container mx-auto px-4 mt-16">
          <h2 className="font-serif text-2xl font-medium mb-8">Related Posts</h2>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {relatedSkeletons}
            </div>
          ) : relatedPosts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((p) => <BlogCard key={p.slug} post={p} />)}
            </div>
          ) : (
            <p className="text-muted-foreground">No related posts yet.</p>
          )}
        </div>
      </article>
      <Footer />
    </div>
  );
}
