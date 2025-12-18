import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DataTable, Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { fetchProjects, deleteProject, AdminProject } from '@/data/adminProjects';
import { Plus } from 'lucide-react';

export default function AdminProjectsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load projects', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = () => {
    if (deleteId) {
      deleteProject(deleteId)
        .then(() => {
          toast({ title: 'Project deleted', description: 'The project has been removed.' });
          return loadProjects();
        })
        .finally(() => setDeleteId(null));
    }
  };

  const columns: Column<AdminProject>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (item) => (
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.slug}</p>
        </div>
      ),
    },
    {
      key: 'tags',
      header: 'Tags',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {item.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{item.tags.length - 3}
            </Badge>
          )}
        </div>
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-medium">Projects</h1>
        <Button asChild>
          <Link to="/admin/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading projects...</p>
      ) : (
        <DataTable
          data={projects}
          columns={columns}
          searchKey="title"
          searchPlaceholder="Search projects..."
          onEdit={(item) => navigate(`/admin/projects/${item.id}/edit`)}
          onDelete={(item) => setDeleteId(item.id)}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
