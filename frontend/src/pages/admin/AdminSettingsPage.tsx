import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { FormSection } from '@/components/admin/FormSection';
import { fetchSiteSettings, updateSiteSettings, uploadAvatar, uploadResume, defaultSiteSettings, SiteSettings } from '@/data/siteSettings';
import { Save, RotateCcw } from 'lucide-react';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteSettings()
      .then((data) => setSettings({ ...defaultSiteSettings, ...data }))
      .catch(() => {
        setError('Failed to load settings');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }
      if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...(prev as any)[keys[0]],
            [keys[1]]: value,
          },
        };
      }
      return prev;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateSiteSettings(settings);
      setSettings(updated);
      toast({ title: 'Settings saved', description: 'Your site settings have been updated.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSiteSettings);
    toast({ title: 'Settings reset', description: 'Site settings have been reset to defaults.' });
  };

  const handleAvatarUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(file, settings.avatarUrl);
      if (url) {
        setSettings((prev) => ({ ...prev, avatarUrl: url }));
        toast({ title: 'Avatar uploaded', description: 'Image uploaded to storage.' });
      } else {
        toast({ title: 'Upload failed', description: 'No URL returned.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Upload error', description: 'Could not upload avatar.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleResumeUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploadingResume(true);
    try {
      const url = await uploadResume(file, settings.resumeUrl);
      if (url) {
        setSettings((prev) => ({ ...prev, resumeUrl: url }));
        toast({ title: 'Resume uploaded', description: 'File uploaded to storage.' });
      } else {
        toast({ title: 'Upload failed', description: 'No URL returned.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Upload error', description: 'Could not upload resume.', variant: 'destructive' });
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-serif font-medium">Site Settings</h1>
        <p className="text-muted-foreground">Loading settings...</p>
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-medium">Site Settings</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormSection title="Site Identity">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input
                  id="siteTitle"
                  value={settings.siteTitle}
                  onChange={(e) => handleChange('siteTitle', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={settings.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroIntro">Hero Introduction</Label>
              <Textarea
                id="heroIntro"
                value={settings.heroIntro}
                onChange={(e) => handleChange('heroIntro', e.target.value)}
                rows={3}
              />
            </div>
          </FormSection>

          <Separator />

          <FormSection title="Avatar">
            <div className="flex items-start gap-4">
              <img
                src={settings.avatarUrl}
                alt="Avatar preview"
                className="h-20 w-20 rounded-full object-cover border"
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="avatarFile">Upload Avatar</Label>
                <Input
                  id="avatarFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground">
                  Choose an image file; it will be uploaded and saved in settings.
                </p>
              </div>
            </div>
          </FormSection>

          <Separator />

          <FormSection title="Resume">
            <div className="space-y-2">
              <Label htmlFor="resumeUrl">Resume URL</Label>
              <Input
                id="resumeUrl"
                value={settings.resumeUrl || ''}
                onChange={(e) => handleChange('resumeUrl', e.target.value)}
                placeholder="https://.../resume.pdf"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resumeFile">Upload Resume (PDF or image)</Label>
              <Input
                id="resumeFile"
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => handleResumeUpload(e.target.files?.[0])}
                disabled={uploadingResume}
              />
              <p className="text-xs text-muted-foreground">
                Upload a PDF or image file; it will replace the current resume link.
              </p>
              {settings.resumeUrl && (
                <div className="space-y-2">
                  <a
                    className="text-sm text-accent underline"
                    href={settings.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View current resume
                  </a>
                  {settings.resumeUrl.match(/\\.pdf($|\\?)/i) ? (
                    <p className="text-xs text-muted-foreground">Preview shown on Resume page.</p>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <img
                        src={settings.resumeUrl}
                        alt="Resume preview"
                        className="max-h-64 w-full object-contain bg-muted"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </FormSection>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                value={settings.socialLinks.github}
                onChange={(e) => handleChange('socialLinks.github', e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={settings.socialLinks.linkedin}
                onChange={(e) => handleChange('socialLinks.linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.socialLinks.email}
                onChange={(e) => handleChange('socialLinks.email', e.target.value)}
                placeholder="hello@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter (optional)</Label>
              <Input
                id="twitter"
                value={settings.socialLinks.twitter || ''}
                onChange={(e) => handleChange('socialLinks.twitter', e.target.value)}
                placeholder="https://twitter.com/username"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={settings.seo.metaTitle}
              onChange={(e) => handleChange('seo.metaTitle', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 50-60 characters
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={settings.seo.metaDescription}
              onChange={(e) => handleChange('seo.metaDescription', e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 150-160 characters
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
