import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagFilterChipsProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  className?: string;
}

export function TagFilterChips({
  tags,
  selectedTags,
  onTagToggle,
  className,
}: TagFilterChipsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <Badge
            key={tag}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:scale-105",
              isSelected && "bg-accent text-accent-foreground"
            )}
            onClick={() => onTagToggle(tag)}
          >
            {tag}
          </Badge>
        );
      })}
    </div>
  );
}
