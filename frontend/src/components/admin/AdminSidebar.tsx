import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/auth';
import {
  LayoutDashboard,
  Settings,
  User,
  Wrench,
  FolderKanban,
  FileText,
  GitBranch,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
  { path: '/admin/about', label: 'About', icon: User },
  { path: '/admin/skills', label: 'Skills', icon: Wrench },
  { path: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { path: '/admin/repos', label: 'Open Source', icon: GitBranch },
  { path: '/admin/blog', label: 'Blog', icon: FileText },
];

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {!collapsed && (
            <Link to="/admin" className="font-serif text-lg font-semibold">
              Admin Panel
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(collapsed && 'mx-auto')}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-border">
          <Separator className="mb-2" />
          <Link
            to="/"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors mb-1',
              collapsed && 'justify-center'
            )}
          >
            <ChevronLeft className="h-5 w-5" />
            {!collapsed && <span>View Site</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors w-full',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
