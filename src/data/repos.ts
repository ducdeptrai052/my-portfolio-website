export interface Repo {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
}

export const repos: Repo[] = [
  {
    name: "react-hooks-toolkit",
    description: "A collection of production-ready React hooks for common patterns and use cases.",
    language: "TypeScript",
    stars: 2847,
    forks: 312,
    url: "https://github.com/example/react-hooks-toolkit",
  },
  {
    name: "fast-api-template",
    description: "Production-ready FastAPI template with authentication, database, and Docker support.",
    language: "Python",
    stars: 1923,
    forks: 245,
    url: "https://github.com/example/fast-api-template",
  },
  {
    name: "css-grid-generator",
    description: "Visual CSS Grid generator with code export and responsive breakpoint support.",
    language: "TypeScript",
    stars: 1456,
    forks: 178,
    url: "https://github.com/example/css-grid-generator",
  },
  {
    name: "go-microservices",
    description: "Microservices starter kit in Go with gRPC, Kafka, and Kubernetes configs.",
    language: "Go",
    stars: 1102,
    forks: 156,
    url: "https://github.com/example/go-microservices",
  },
  {
    name: "markdown-it-plugins",
    description: "Collection of markdown-it plugins for enhanced Markdown rendering.",
    language: "JavaScript",
    stars: 876,
    forks: 98,
    url: "https://github.com/example/markdown-it-plugins",
  },
  {
    name: "terminal-themes",
    description: "Beautiful, accessible terminal color schemes for popular shells and editors.",
    language: "Shell",
    stars: 654,
    forks: 87,
    url: "https://github.com/example/terminal-themes",
  },
];

export const getTopRepos = (limit: number = 4): Repo[] => {
  return [...repos].sort((a, b) => b.stars - a.stars).slice(0, limit);
};
