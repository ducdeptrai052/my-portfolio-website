import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BlogCard } from "@/components/BlogCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPostBySlug, getRelatedPosts } from "@/data/posts";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const post = getPostBySlug(slug || "");
  const relatedPosts = getRelatedPosts(slug || "", 3);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="font-serif text-4xl mb-4">Post not found</h1>
          <Button asChild><Link to="/blog">Back to blog</Link></Button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to blog</Link>
          </Button>

          <img src={post.coverImage} alt={post.title} className="w-full aspect-[2/1] object-cover rounded-lg mb-8" />

          <div className="flex items-center gap-4 mb-4">
            <Badge className="capitalize">{post.category}</Badge>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formattedDate}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{post.readTime}</span>
            </div>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-medium mb-8">{post.title}</h1>

          <div className="prose prose-lg max-w-none">
            {post.content.split("\n").map((line, i) => {
              if (line.startsWith("## ")) return <h2 key={i} className="font-serif text-2xl font-medium mt-8 mb-4">{line.slice(3)}</h2>;
              if (line.startsWith("### ")) return <h3 key={i} className="font-serif text-xl font-medium mt-6 mb-3">{line.slice(4)}</h3>;
              if (line.trim()) return <p key={i} className="text-muted-foreground mb-4 leading-relaxed">{line}</p>;
              return null;
            })}
          </div>
        </div>

        <div className="container mx-auto px-4 mt-16">
          <h2 className="font-serif text-2xl font-medium mb-8">Related Posts</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((p) => <BlogCard key={p.slug} post={p} />)}
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
}
