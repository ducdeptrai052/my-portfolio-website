import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BlogCard } from "@/components/BlogCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadPosts, type Post } from "@/data/posts";
import { cn } from "@/lib/utils";
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
  const walk = (node: JSONContent | undefined) => {
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
  const contentRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const tocRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    const updateOffset = () => {
      if (!contentRef.current || !titleRef.current || !tocRef.current) return;
      const contentTop = contentRef.current.getBoundingClientRect().top;
      const titleTop = titleRef.current.getBoundingClientRect().top;
      const nextOffset = Math.max(0, Math.round(titleTop - contentTop));
      tocRef.current.style.marginTop = `${nextOffset}px`;
    };
    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, [heroError, loading, post?.title]);

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
    const headings = Array.from(contentRef.current.querySelectorAll("h2, h3")) as HTMLElement[];
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [tocItems, sanitizedHtml, loading]);

  useEffect(() => {
    if (!loading && post) {
      highlightCodeBlocks(contentRef.current);
    }
  }, [loading, post, sanitizedHtml]);

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
      <article className="pt-24 pb-24">
        <div className="container mx-auto px-4 lg:grid lg:grid-cols-[260px_minmax(0,720px)_260px] lg:gap-10">
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
            <Button variant="ghost" asChild className="mb-10">
              <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to blog</Link>
            </Button>

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
              </>
            )}
          </div>
          <aside className="hidden lg:block lg:col-start-3 lg:col-end-4">
            <div className="sticky top-28 space-y-4" ref={tocRef}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Table Of Contents
              </p>
              <nav className="space-y-2 text-sm border-l-2 border-border/70 pl-4 max-h-[70vh] overflow-y-auto pr-2">
                {tocItems.length === 0 && (
                  <p className="text-muted-foreground">No sections</p>
                )}
                {tocItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={cn(
                      "block rounded-md px-2 py-1 text-foreground/80 font-medium hover:text-foreground hover:bg-primary/10 transition dark:text-white/80 dark:hover:text-white dark:hover:bg-white/5",
                      item.id === activeId &&
                        "bg-primary/15 text-foreground dark:bg-white/10 dark:text-white font-semibold",
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
