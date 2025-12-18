import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AdminRepo, createRepo, deleteRepo, fetchRepos, updateRepo } from "@/data/adminRepos";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const emptyRepo: AdminRepo = {
  id: "",
  name: "",
  description: "",
  language: "",
  stars: 0,
  forks: 0,
  url: "",
};

export default function AdminReposPage() {
  const { toast } = useToast();
  const [repos, setRepos] = useState<AdminRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminRepo>(emptyRepo);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const selectedRepo = useMemo(
    () => repos.find((r) => r.id === selectedId) || null,
    [repos, selectedId]
  );

  useEffect(() => {
    fetchRepos()
      .then((data) => setRepos(data))
      .catch(() => toast({ title: "Error", description: "Failed to load repos", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    if (selectedRepo) {
      setForm(selectedRepo);
    } else {
      setForm(emptyRepo);
    }
  }, [selectedRepo]);

  const handleChange = (field: keyof AdminRepo, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.url.trim()) {
      toast({ title: "Missing fields", description: "Name and URL are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (selectedRepo) {
        const updated = await updateRepo({ ...selectedRepo, ...form });
        setRepos((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        toast({ title: "Saved", description: "Repository updated." });
      } else {
        const created = await createRepo(form);
        setRepos((prev) => [created, ...prev]);
        setSelectedId(created.id);
        toast({ title: "Created", description: "Repository added." });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to save repo", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRepo) return;
    try {
      await deleteRepo(selectedRepo.id);
      setRepos((prev) => prev.filter((r) => r.id !== selectedRepo.id));
      setSelectedId(null);
      toast({ title: "Deleted", description: "Repository removed." });
    } catch {
      toast({ title: "Error", description: "Failed to delete repo", variant: "destructive" });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Open Source Repos</CardTitle>
          <Button variant="outline" onClick={() => setSelectedId(null)}>
            New Repo
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading repositories...</p>
          ) : repos.length === 0 ? (
            <p className="text-muted-foreground">No repositories yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Stars</TableHead>
                  <TableHead>Forks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repos.map((repo) => (
                  <TableRow
                    key={repo.id}
                    className={selectedId === repo.id ? "bg-muted/60" : "cursor-pointer"}
                    onClick={() => setSelectedId(repo.id)}
                  >
                    <TableCell className="font-medium">{repo.name}</TableCell>
                    <TableCell>{repo.language}</TableCell>
                    <TableCell>{repo.stars}</TableCell>
                    <TableCell>{repo.forks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{selectedRepo ? "Edit Repo" : "Create Repo"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="my-library" />
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input value={form.url} onChange={(e) => handleChange("url", e.target.value)} placeholder="https://github.com/..." />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Short description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Language</Label>
              <Input value={form.language} onChange={(e) => handleChange("language", e.target.value)} placeholder="TypeScript" />
            </div>
            <div className="space-y-2">
              <Label>Stars</Label>
              <Input
                type="number"
                value={form.stars}
                onChange={(e) => handleChange("stars", Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Forks</Label>
              <Input
                type="number"
                value={form.forks}
                onChange={(e) => handleChange("forks", Number(e.target.value))}
                min={0}
              />
            </div>
          </div>
          <Separator />
          <div className="flex gap-2">
            {selectedRepo && (
              <Button variant="destructive" type="button" onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Repository"
        description="Are you sure you want to delete this repo?"
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
