import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, FileText, Plus, Clock, GitBranch } from 'lucide-react';
import { fetchProjects, AdminProject } from '@/data/adminProjects';
import { fetchPosts, AdminPost } from '@/data/adminPosts';
import { fetchRepos, AdminRepo } from '@/data/adminRepos';

export default function AdminDashboardPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [repos, setRepos] = useState<AdminRepo[]>([]);

  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => setProjects([]));
    fetchPosts().then(setPosts).catch(() => setPosts([]));
    fetchRepos().then(setRepos).catch(() => setRepos([]));
  }, []);

  const stats = [
    {
      title: 'Total Projects',
      value: projects.length,
      icon: FolderKanban,
      published: projects.filter((p) => p.status === 'published').length,
    },
    {
      title: 'Total Blog Posts',
      value: posts.length,
      icon: FileText,
      published: posts.filter((p) => p.status === 'published').length,
    },
    {
      title: 'Total Open Source',
      value: repos.length,
      icon: GitBranch,
      published: repos.length,
    }
  ];

  const recentActivity = [
    ...projects.map((p) => ({ type: 'project', title: p.title, date: p.updatedAt, status: p.status })),
    ...posts.map((p) => ({ type: 'post', title: p.title, date: p.updatedAt, status: p.status })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-medium">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/blog/new">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.published} published
              </p>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Updated
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {recentActivity[0]?.date || 'Never'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {recentActivity[0]?.title || 'No activity'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link to="/admin/settings">Edit Site Settings</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/admin/about">Update About Page</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/admin/skills">Manage Skills</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.type === 'project' ? (
                      <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
