import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { FormSection } from '@/components/admin/FormSection';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import {
  fetchAboutData,
  saveAboutData,
  defaultAboutData,
  AboutData,
  TimelineItem,
  uploadAboutAvatar,
} from '@/data/about';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';

function TimelineEditor({
  items,
  onChange,
  type,
}: {
  items: TimelineItem[];
  onChange: (items: TimelineItem[]) => void;
  type: 'education' | 'experience';
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const addItem = () => {
    const newItem: TimelineItem = {
      id: `${type}-${Date.now()}`,
      title: '',
      organization: '',
      period: '',
      description: '',
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof TimelineItem, value: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-2 p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center cursor-move text-muted-foreground">
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="flex-1 grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                  placeholder={type === 'education' ? 'Degree/Certificate' : 'Job Title'}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Organization</Label>
                <Input
                  value={item.organization}
                  onChange={(e) => updateItem(item.id, 'organization', e.target.value)}
                  placeholder={type === 'education' ? 'University/School' : 'Company'}
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Period</Label>
                <Input
                  value={item.period}
                  onChange={(e) => updateItem(item.id, 'period', e.target.value)}
                  placeholder="2020 - 2024"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Brief description"
                />
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button variant="outline" onClick={addItem} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add {type === 'education' ? 'Education' : 'Experience'}
      </Button>
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteId && removeItem(deleteId)}
      />
    </div>
  );
}

export default function AdminAboutPage() {
  const { toast } = useToast();
  const [data, setData] = useState<AboutData>(defaultAboutData);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchAboutData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await saveAboutData(data);
      setData(updated);
      toast({ title: 'About page saved', description: 'Your changes have been saved.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file?: File) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadAboutAvatar(file, data.avatarUrl || undefined);
      if (url) {
        setData((prev) => ({ ...prev, avatarUrl: url }));
        toast({ title: 'Avatar uploaded', description: 'Image uploaded to storage.' });
      } else {
        toast({ title: 'Upload failed', description: 'No URL returned.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Upload error', description: 'Could not upload avatar.', variant: 'destructive' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-serif font-medium">About Page</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-medium">About Page</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Avatar</Label>
            <div className="flex items-center gap-4">
                {data.avatarUrl ? (
                  <img
                    src={data.avatarUrl}
                    alt="Avatar"
                    className="h-40 w-40 rounded-full object-cover border"
                    loading="lazy"
                    decoding="async"
                  />
              ) : (
                <div className="h-40 w-40 rounded-full bg-muted border" />
              )}
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                  disabled={uploadingAvatar}
                />
                <p className="text-xs text-muted-foreground">Upload a profile image for About page.</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={data.location || ''}
              onChange={(e) => setData({ ...data, location: e.target.value })}
              placeholder="City, Country"
            />
          </div>
          <div className="space-y-2">
            <Label>Short Bio</Label>
            <Input
              value={data.shortBio}
              onChange={(e) => setData({ ...data, shortBio: e.target.value })}
              placeholder="A brief one-liner about yourself"
            />
          </div>
          <div className="space-y-2">
            <Label>Long Story</Label>
            <MarkdownEditor
              value={data.longStory}
              onChange={(value) => setData({ ...data, longStory: value })}
              placeholder="Tell your story in detail..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineEditor
            items={data.education}
            onChange={(education) => setData({ ...data, education })}
            type="education"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineEditor
            items={data.experience}
            onChange={(experience) => setData({ ...data, experience })}
            type="experience"
          />
        </CardContent>
      </Card>
    </div>
  );
}
