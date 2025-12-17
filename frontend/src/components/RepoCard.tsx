import { Star, GitFork, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Repo } from "@/data/repos";

interface RepoCardProps {
  repo: Repo;
}

const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-500",
  Python: "bg-green-500",
  Go: "bg-cyan-500",
  Shell: "bg-gray-500",
};

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card className="hover-lift group h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-mono text-sm font-medium group-hover:text-accent transition-colors flex items-center gap-2">
              {repo.name}
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {repo.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  languageColors[repo.language] || "bg-gray-500"
                }`}
              />
              <span className="text-xs text-muted-foreground">
                {repo.language}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>{repo.stars.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="h-3 w-3" />
                <span>{repo.forks}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
