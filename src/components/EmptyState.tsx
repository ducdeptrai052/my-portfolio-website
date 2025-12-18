import { SearchX, FileQuestion, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: "search" | "file" | "folder";
  className?: string;
}

const icons = {
  search: SearchX,
  file: FileQuestion,
  folder: FolderOpen,
};

export function EmptyState({
  title = "No results found",
  description = "Try adjusting your search or filters.",
  icon = "search",
  className,
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-serif text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}
