export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  thumbnail: string;
  links: {
    live?: string;
    github?: string;
    demo?: string;
  };
  featured: boolean;
  year: string;
}

export const projects: Project[] = [
  {
    id: "devflow",
    title: "DevFlow",
    description: "A visual workflow builder for developers to automate CI/CD pipelines with drag-and-drop simplicity.",
    longDescription: "DevFlow reimagines how teams build and manage deployment pipelines. With an intuitive visual interface, developers can create complex workflows without writing YAML. Features include real-time collaboration, integrated testing, and seamless GitHub integration.",
    tags: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
    thumbnail: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&h=400&fit=crop",
    links: {
      live: "https://devflow.example.com",
      github: "https://github.com/example/devflow",
    },
    featured: true,
    year: "2024",
  },
  {
    id: "synthwave-ui",
    title: "Synthwave UI",
    description: "A retro-futuristic component library inspired by 80s aesthetics, built for modern React applications.",
    longDescription: "Synthwave UI brings the neon-soaked aesthetic of the 1980s to modern web applications. Every component is carefully crafted with attention to detail, featuring gradient effects, glow animations, and that distinctive retro feel.",
    tags: ["React", "Tailwind CSS", "Storybook", "Design System"],
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop",
    links: {
      live: "https://synthwave-ui.example.com",
      github: "https://github.com/example/synthwave-ui",
      demo: "https://demo.synthwave-ui.example.com",
    },
    featured: true,
    year: "2024",
  },
  {
    id: "markdown-studio",
    title: "Markdown Studio",
    description: "A distraction-free writing environment with live preview, syntax highlighting, and export options.",
    longDescription: "Markdown Studio is built for writers who think in Markdown. Features a clean, minimal interface with powerful features like live preview, custom themes, export to PDF/HTML, and cloud sync across devices.",
    tags: ["Electron", "React", "TypeScript", "MDX"],
    thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop",
    links: {
      github: "https://github.com/example/markdown-studio",
    },
    featured: true,
    year: "2023",
  },
  {
    id: "api-guardian",
    title: "API Guardian",
    description: "Real-time API monitoring and alerting system with performance analytics and uptime tracking.",
    longDescription: "API Guardian provides comprehensive monitoring for your APIs. Track response times, detect anomalies, receive instant alerts, and analyze trends over time. Built to scale from single endpoints to enterprise-level API ecosystems.",
    tags: ["Go", "React", "InfluxDB", "Grafana", "Kubernetes"],
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    links: {
      live: "https://apiguardian.example.com",
    },
    featured: false,
    year: "2023",
  },
  {
    id: "color-palette-pro",
    title: "Color Palette Pro",
    description: "Generate beautiful, accessible color palettes with AI assistance and WCAG compliance checking.",
    longDescription: "Color Palette Pro helps designers and developers create harmonious color schemes. AI-powered suggestions ensure aesthetic appeal while built-in accessibility tools verify WCAG compliance for color contrast ratios.",
    tags: ["Next.js", "OpenAI", "Tailwind CSS", "Framer Motion"],
    thumbnail: "https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=600&h=400&fit=crop",
    links: {
      live: "https://colorpalette.example.com",
      github: "https://github.com/example/color-palette-pro",
    },
    featured: false,
    year: "2023",
  },
  {
    id: "task-zen",
    title: "Task Zen",
    description: "A minimalist task management app focused on single-tasking and deep work sessions.",
    longDescription: "Task Zen strips away the complexity of traditional task managers. Focus on one thing at a time with built-in Pomodoro timer, distraction blocking, and mindful completion tracking.",
    tags: ["React Native", "Expo", "SQLite", "TypeScript"],
    thumbnail: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop",
    links: {
      github: "https://github.com/example/task-zen",
    },
    featured: false,
    year: "2022",
  },
];

export const getAllTags = (): string[] => {
  const tags = new Set<string>();
  projects.forEach((project) => {
    project.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
};

export const getFeaturedProjects = (): Project[] => {
  return projects.filter((project) => project.featured);
};
