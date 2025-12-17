export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: "writing" | "tech";
  coverImage: string;
  readTime: string;
}

export const posts: Post[] = [
  {
    slug: "building-scalable-react-applications",
    title: "Building Scalable React Applications",
    excerpt: "A deep dive into patterns and practices for creating maintainable React codebases that can grow with your team.",
    content: `
## Introduction

Building scalable React applications requires careful consideration of architecture, state management, and code organization. In this post, I'll share patterns I've learned from building applications used by millions.

## Component Architecture

The key to scalable React is thinking in terms of composable, reusable components. Here's my approach:

### Atomic Design Principles

I structure components using atomic design methodology:
- **Atoms**: Basic building blocks (buttons, inputs, labels)
- **Molecules**: Simple groups of atoms (search bars, card headers)
- **Organisms**: Complex UI sections (navigation, forms)
- **Templates**: Page-level layouts
- **Pages**: Specific instances of templates

## State Management

For state management, I recommend starting simple and scaling up:

1. **Local state** for component-specific data
2. **Context** for theme, auth, and app-wide settings
3. **Server state** (React Query/SWR) for API data
4. **Global state** (Zustand/Redux) only when necessary

## Conclusion

Scalability isn't just about handling more users—it's about handling more developers, more features, and more complexity without the codebase becoming unmaintainable.
    `,
    date: "2024-12-10",
    category: "tech",
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
    readTime: "8 min read",
  },
  {
    slug: "the-art-of-writing-clean-code",
    title: "The Art of Writing Clean Code",
    excerpt: "Why clean code matters and how to cultivate the discipline to write it consistently.",
    content: `
## What is Clean Code?

Clean code is code that is easy to understand and easy to change. It's not about following rigid rules—it's about empathy for the next developer who reads your code.

## The Four Pillars

### 1. Readability

Code is read far more often than it's written. Optimize for the reader, not the writer.

### 2. Simplicity

The best code is the code you didn't write. Always ask: "Is there a simpler way?"

### 3. Consistency

Pick patterns and stick to them. Inconsistency creates cognitive load.

### 4. Testability

If your code is hard to test, it's probably doing too much.

## Practical Tips

- Name things what they are, not what they do
- Keep functions small and focused
- Avoid premature optimization
- Write tests as documentation

## Final Thoughts

Clean code is a journey, not a destination. Every line you write is an opportunity to practice.
    `,
    date: "2024-11-28",
    category: "tech",
    coverImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=400&fit=crop",
    readTime: "6 min read",
  },
  {
    slug: "lessons-from-a-decade-of-software-development",
    title: "Lessons from a Decade of Software Development",
    excerpt: "Reflections on 10 years of building software, leading teams, and continuous learning.",
    content: `
## The Journey

Ten years ago, I wrote my first line of code. Today, I lead engineering teams building products used by millions. Here's what I've learned.

## Technical Lessons

### 1. Fundamentals Never Go Out of Style

Frameworks come and go, but data structures, algorithms, and system design remain constant. Invest in fundamentals.

### 2. Debugging is a Superpower

The ability to systematically diagnose and fix problems is more valuable than knowing any specific technology.

### 3. Performance Matters (Eventually)

Premature optimization is the root of all evil, but eventually, you'll need to care about performance.

## Human Lessons

### 1. Communication > Code

The best engineers I know are also excellent communicators. Technical skill alone isn't enough.

### 2. Mentorship is Force Multiplication

Teaching others doesn't just help them—it deepens your own understanding.

### 3. Take Care of Yourself

Burnout is real. Sustainable pace beats heroic sprints every time.

## Looking Forward

The next decade will bring AI, quantum computing, and technologies we can't imagine. Stay curious, stay humble, keep learning.
    `,
    date: "2024-11-15",
    category: "writing",
    coverImage: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=400&fit=crop",
    readTime: "10 min read",
  },
  {
    slug: "designing-developer-experience",
    title: "Designing Developer Experience",
    excerpt: "How to build APIs, SDKs, and tools that developers actually enjoy using.",
    content: `
## What is Developer Experience?

Developer Experience (DX) is to developers what User Experience (UX) is to users. It's about making tools that are intuitive, efficient, and delightful to use.

## Principles of Great DX

### Start with Getting Started

The first 5 minutes determine whether a developer will use your tool or find an alternative.

### Provide Sensible Defaults

Make the common case easy. Let power users customize, but don't force everyone to configure everything.

### Write Great Documentation

Documentation is part of the product, not an afterthought.

### Fail Gracefully

When things go wrong, provide clear, actionable error messages.

## Conclusion

Great DX is a competitive advantage. In a world where developers have choices, the tools that respect their time will win.
    `,
    date: "2024-10-30",
    category: "tech",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
    readTime: "7 min read",
  },
  {
    slug: "on-creativity-and-constraints",
    title: "On Creativity and Constraints",
    excerpt: "Why limitations often lead to more creative solutions than unlimited freedom.",
    content: `
## The Paradox of Choice

When faced with infinite possibilities, we often freeze. Constraints, counterintuitively, can be liberating.

## Constraints in Software

### Time Constraints

Deadlines force prioritization. Without them, we'd polish forever.

### Technical Constraints

Working within limitations (browser compatibility, device memory) breeds innovation.

### Resource Constraints

Small teams must be creative. They can't brute-force solutions.

## Embracing Constraints

Rather than fighting constraints, embrace them. Ask: "How can this limitation become a feature?"

## Personal Reflection

Some of my best work came from projects with tight constraints. They forced creative solutions I never would have found otherwise.
    `,
    date: "2024-10-15",
    category: "writing",
    coverImage: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&h=400&fit=crop",
    readTime: "5 min read",
  },
  {
    slug: "modern-css-is-amazing",
    title: "Modern CSS is Amazing",
    excerpt: "A celebration of how far CSS has come and the features that make it a joy to use today.",
    content: `
## CSS Has Grown Up

Remember float-based layouts? Clearfix hacks? Those days are behind us. Modern CSS is powerful, elegant, and actually enjoyable.

## Features I Love

### CSS Grid

Two-dimensional layouts that just work. No frameworks needed.

### CSS Custom Properties

Variables that cascade and can be modified at runtime. Game changer.

### Container Queries

Finally, components that respond to their container, not just the viewport.

### :has() Selector

Parent selection in CSS. I never thought I'd see the day.

## The Future

With cascade layers, subgrid, and more coming, CSS continues to evolve. It's a great time to be a front-end developer.
    `,
    date: "2024-09-20",
    category: "tech",
    coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
    readTime: "6 min read",
  },
];

export const getPostBySlug = (slug: string): Post | undefined => {
  return posts.find((post) => post.slug === slug);
};

export const getRelatedPosts = (currentSlug: string, limit: number = 3): Post[] => {
  return posts.filter((post) => post.slug !== currentSlug).slice(0, limit);
};
