import { useState, useMemo, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { BlogCard } from "@/components/BlogCard";
import { SearchBar } from "@/components/SearchBar";
import { PaginationBar } from "@/components/PaginationBar";
import { EmptyState } from "@/components/EmptyState";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadPosts, type Post } from "@/data/posts";
import { setPageMeta } from "@/lib/seo";

const ITEMS_PER_PAGE = 9;

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts()
      .then((data) => {
        setPosts(data);
        setError(null);
      })
      .catch((err: any) => setError(err?.message || "Failed to load posts"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPageMeta({
      title: "Blog | Minh Duc",
      description: "Latest posts on development, design, and personal growth.",
      canonical: "https://www.hominhduc.cloud/blog",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Minh Duc Blog",
        url: "https://www.hominhduc.cloud/blog",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.hominhduc.cloud/" },
            { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.hominhduc.cloud/blog" },
          ],
        },
      },
    });
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || post.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [posts, search, category]);

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const skeletonCards = Array.from({ length: ITEMS_PER_PAGE }, (_, i) => (
    <div key={`post-skeleton-${i}`} className="h-72 rounded-xl border bg-muted animate-pulse" />
  ));

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages || 1);
    }
  }, [page, totalPages]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <SectionHeader title="Blog" subtitle="My stories & ideas" className="mb-8" />
          
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <SearchBar placeholder="Search posts..." onSearch={handleSearch} className="max-w-md" />
            <Tabs value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="writing">Writing</TabsTrigger>
                <TabsTrigger value="tech">Tech</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {skeletonCards}
            </div>
          ) : paginatedPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState title="No posts found" description="Try a different search or category." />
          )}

          {error && !loading && (
            <p className="text-sm text-destructive mb-6">{error}</p>
          )}

          <PaginationBar currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
