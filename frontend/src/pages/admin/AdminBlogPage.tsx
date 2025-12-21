import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { DataTable, Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { fetchPosts, deletePost, AdminPost } from '@/data/adminPosts';
import { Plus } from 'lucide-react';

export default function AdminBlogPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'writing' | 'tech'>('all');
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load posts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filteredPosts = categoryFilter === 'all'
    ? posts
    : posts.filter((p) => p.category === categoryFilter);

  const handleDelete = () => {
    if (deleteId) {
      deletePost(deleteId)
        .then(() => {
          toast({ title: 'Post deleted', description: 'The blog post has been removed.' });
          return loadPosts();
        })
        .finally(() => setDeleteId(null));
    }
  };

  const columns: Column<AdminPost>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (item) => (
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{item.excerpt}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <Badge variant="outline" className="capitalize">
          {item.category}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
    },
    {
      key: 'slug',
      header: 'Public',
      render: (item) => (
        <Button asChild variant="ghost" size="sm">
          <a href={`/blog/${item.slug}`} target="_blank" rel="noreferrer">
            View
          </a>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-medium">Blog Posts</h1>
        <Button asChild>
          <Link to="/admin/blog/new">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Link>
        </Button>
      </div>

      <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="tech">Tech</TabsTrigger>
          <TabsTrigger value="writing">Writing</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <p className="text-muted-foreground">Loading posts...</p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filteredPosts.map((post) => (
              <div key={post.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div>
                  <p className="font-medium">{post.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">
                    {post.category}
                  </Badge>
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(post.updatedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                      View
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/admin/blog/${post.id}/edit`)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteId(post.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {filteredPosts.length === 0 && (
              <p className="text-muted-foreground">No posts found.</p>
            )}
          </div>
          <div className="hidden md:block">
            <DataTable
              data={filteredPosts}
              columns={columns}
              searchKey="title"
              searchPlaceholder="Search posts..."
              onEdit={(item) => navigate(`/admin/blog/${item.id}/edit`)}
              onDelete={(item) => setDeleteId(item.id)}
            />
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
