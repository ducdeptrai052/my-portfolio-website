import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { fetchPostById, createPost, updatePost, deletePost, AdminPost } from '@/data/adminPosts';
import { Save, Trash2, ArrowLeft } from 'lucide-react';
import DOMPurify from 'dompurify';
import { highlightCodeBlocks } from '@/lib/highlight';
import {
  ARTICLE_PROSE_CLASSES,
  composeDocFromFields,
  extractPostFieldsFromDoc,
  getHtmlFromJson,
  parseJsonDoc,
} from '@/lib/editor';
import { uploadMedia } from '@/lib/uploads';

const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function AdminBlogEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement | null>(null);
  const isNew = !id || id === 'new';

  const [post, setPost] = useState<AdminPost>({
    id: `post-${Date.now()}`,
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'tech',
    coverImageUrl: '',
    status: 'draft',
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [contentTab, setContentTab] = useState<'write' | 'preview'>('write');
  const [editorContent, setEditorContent] = useState<string>('');
  const lastSavedRef = useRef<string>('');

  const editorDoc = useMemo(() => parseJsonDoc(editorContent) || { type: 'doc', content: [] }, [editorContent]);
  const extracted = useMemo(() => extractPostFieldsFromDoc(editorDoc), [editorDoc]);
  const bodyJson = useMemo(() => JSON.stringify(extracted.body), [extracted.body]);

  const sanitizedPreview = useMemo(() => {
    const bodyDoc = extracted.body;
    if (!bodyDoc || !Array.isArray(bodyDoc.content) || bodyDoc.content.length === 0) {
      return '<p class="text-muted-foreground">No content yet.</p>';
    }
    const html = getHtmlFromJson(bodyDoc);
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "src", "title", "width", "height"],
    });
  }, [extracted.body]);

  useEffect(() => {
    if (!isNew && id) {
      fetchPostById(id)
        .then((existing) => {
          if (existing) {
            setPost(existing);
            const bodyDoc = parseJsonDoc(existing.content) || { type: 'doc', content: [] };
            const fullDoc = composeDocFromFields(existing.title, existing.excerpt, bodyDoc);
            setEditorContent(JSON.stringify(fullDoc));
          } else {
            navigate('/admin/blog');
          }
        })
        .finally(() => setLoading(false));
    }
    if (isNew) {
      const fullDoc = composeDocFromFields('', '', { type: 'doc', content: [] });
      setEditorContent(JSON.stringify(fullDoc));
      setLoading(false);
    }
  }, [id, isNew, navigate]);

  const handleChange = (field: keyof AdminPost, value: any) => {
    setPost((prev) => {
      return { ...prev, [field]: value };
    });
  };

  const generateSlug = () => {
    const slug = slugify(extracted.title) || post.slug;
    handleChange('slug', slug);
  };

  const handleSave = async (status?: 'draft' | 'published') => {
    if (!extracted.title.trim()) {
      toast({ title: 'Error', description: 'Title is required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const updated = {
      ...post,
      title: extracted.title,
      excerpt: extracted.excerpt,
      content: bodyJson,
      slug: post.slug || slugify(extracted.title),
      status: status || post.status,
    };
    try {
      let saved: AdminPost;
      if (isNew) {
        saved = await createPost(updated);
        navigate(`/admin/blog/${saved.id}/edit`, { replace: true });
      } else {
        saved = await updatePost(updated);
      }
      setPost(saved);
      lastSavedRef.current = JSON.stringify({
        title: saved.title,
        excerpt: saved.excerpt,
        content: saved.content,
        slug: saved.slug,
        category: saved.category,
        coverImageUrl: saved.coverImageUrl,
        status: saved.status,
      });
      toast({
        title: isNew ? 'Post created' : 'Post saved',
        description: status === 'published' ? 'Your post is now live.' : 'Your changes have been saved.',
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save post', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    deletePost(post.id)
      .then(() => {
        toast({ title: 'Post deleted', description: 'The blog post has been removed.' });
        navigate('/admin/blog');
      })
      .catch(() => toast({ title: 'Error', description: 'Failed to delete post', variant: 'destructive' }));
  };

  useEffect(() => {
    if (!extracted.title || post.slug) return;
    setPost((prev) => ({ ...prev, slug: slugify(extracted.title) }));
  }, [extracted.title, post.slug]);

  useEffect(() => {
    if (loading) return;
    const snapshot = JSON.stringify({
      title: extracted.title,
      excerpt: extracted.excerpt,
      content: bodyJson,
      slug: post.slug,
      category: post.category,
      coverImageUrl: post.coverImageUrl,
      status: post.status,
    });
    if (snapshot === lastSavedRef.current) return;
    const timer = window.setTimeout(async () => {
      if (!extracted.title.trim()) return;
      const payload: AdminPost = {
        ...post,
        title: extracted.title,
        excerpt: extracted.excerpt,
        content: bodyJson,
        slug: post.slug || slugify(extracted.title),
        status: post.status || 'draft',
      };
      try {
        const saved = isNew ? await createPost(payload) : await updatePost(payload);
        if (isNew) {
          navigate(`/admin/blog/${saved.id}/edit`, { replace: true });
        }
        setPost(saved);
        lastSavedRef.current = JSON.stringify({
          title: saved.title,
          excerpt: saved.excerpt,
          content: saved.content,
          slug: saved.slug,
          category: saved.category,
          coverImageUrl: saved.coverImageUrl,
          status: saved.status,
        });
      } catch {
        // silent autosave failure
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [bodyJson, extracted.excerpt, extracted.title, isNew, loading, navigate, post, post.category, post.coverImageUrl, post.slug, post.status]);

  useEffect(() => {
    highlightCodeBlocks(previewRef.current);
  }, [sanitizedPreview]);

  if (loading) {
    return <p className="text-muted-foreground">Loading post...</p>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/blog')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-serif font-medium">
            {isNew ? 'New Post' : 'Edit Post'}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          {!isNew && (
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(true)}
              className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
          >
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
          >
            <Save className="h-4 w-4 sm:mr-2" />
            <span>{saving ? 'Saving...' : 'Publish'}</span>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={extracted.title}
                  readOnly
                  placeholder="Type the title as the first line in the editor"
                />
                <p className="text-xs text-muted-foreground">Title is taken from the first line of the editor.</p>
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <div className="flex gap-2">
                  <Input
                    value={post.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="post-slug"
                  />
                  <Button variant="outline" type="button" onClick={generateSlug}>
                    Generate
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea
                  value={extracted.excerpt}
                  readOnly
                  placeholder="Type the excerpt as the second line in the editor"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">Excerpt is taken from the second line of the editor.</p>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Tabs value={contentTab} onValueChange={(v) => setContentTab(v as 'write' | 'preview')}>
                  <TabsList className="mb-2 w-full justify-start">
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="write" className="mt-0">
                    <RichTextEditor
                      value={editorContent}
                      onChange={setEditorContent}
                      placeholder="Write your blog post..."
                      onImageUpload={uploadMedia}
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-0">
                    <div className="rounded-lg border border-border bg-card/50 dark:bg-muted/30 p-4 min-h-[200px]">
                      {extracted.title && (
                        <h1 className="font-serif text-3xl md:text-[52px] font-semibold mb-6 text-[#111] dark:text-[#f5f5f5] leading-tight">
                          {extracted.title}
                        </h1>
                      )}
                    <div className={ARTICLE_PROSE_CLASSES} ref={previewRef}>
                      <div dangerouslySetInnerHTML={{ __html: sanitizedPreview }} />
                    </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Post Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={post.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={post.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 lg:col-span-1">
              <Label>Cover Image</Label>
              <Input
                value={post.coverImageUrl}
                onChange={(e) => handleChange('coverImageUrl', e.target.value)}
                placeholder="https://..."
              />
              {post.coverImageUrl && (
                <img
                  src={post.coverImageUrl}
                  alt="Cover preview"
                  className="mt-3 w-full aspect-video object-cover rounded-md border"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
