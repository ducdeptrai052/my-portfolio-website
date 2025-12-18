import { useParams, Link } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BlogCard } from "@/components/BlogCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadPosts, type Post } from "@/data/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import DOMPurify from "dompurify";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const formattedDate = post ? new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  }) : "";
  const isHtmlContent = !!post && /<\/?[a-z][\s\S]*>/i.test(post.content);
  const sanitizedHtml = isHtmlContent ? DOMPurify.sanitize(post.content) : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="pt-24 pb-24">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="w-full max-w-[720px]">
            <Button variant="ghost" asChild className="mb-10">
              <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to blog</Link>
            </Button>

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
                <div className="flex justify-center mb-12">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full max-w-4xl aspect-[2/1] object-cover rounded-2xl shadow-lg"
                  />
                </div>

                <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                  <Badge className="capitalize">{post.category}</Badge>
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formattedDate}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{post.readTime}</span>
                </div>

                <h1 className="font-serif text-4xl md:text-5xl font-medium mb-8 leading-tight">
                  {post.title}
                </h1>

                <div className="prose prose-lg max-w-none text-[#111] dark:text-foreground leading-[1.7] prose-p:mb-7 prose-headings:mt-12 prose-headings:mb-5 prose-h2:mt-14 prose-h3:mt-10 prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground/30 prose-blockquote:bg-muted/40 prose-blockquote:px-4 prose-blockquote:py-3 prose-blockquote:rounded-md prose-li:mb-2 prose-pre:rounded-xl prose-pre:bg-[#0f1115] prose-pre:text-sm prose-pre:leading-[1.6] prose-pre:p-5 prose-code:text-sm">
                  {isHtmlContent ? (
                    <div
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                    />
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        h1: (props) => <h1 className="font-serif text-3xl mt-8 mb-4" {...props} />,
                        h2: (props) => <h2 className="font-serif text-2xl mt-8 mb-4" {...props} />,
                        h3: (props) => <h3 className="font-serif text-xl mt-6 mb-3" {...props} />,
                        p: (props) => <p className="text-muted-foreground mb-6 leading-relaxed" {...props} />,
                        code: ({
                          inline,
                          className,
                          children,
                          ...props
                        }: {
                          inline?: boolean;
                          className?: string;
                          children?: ReactNode;
                        }) => {
                          if (inline) {
                            return <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>{children}</code>;
                          }
                          return (
                            <pre className="rounded-lg border bg-muted p-4 overflow-auto">
                              <code className={className || ""} {...props}>
                                {children}
                              </code>
                            </pre>
                          );
                        },
                      }}
                    >
                      {post.content}
                    </ReactMarkdown>
                  )}
                </div>
              </>
            )}
          </div>
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
