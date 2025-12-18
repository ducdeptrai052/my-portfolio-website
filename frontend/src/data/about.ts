export interface TimelineItem {
  id: string;
  title: string;
  organization: string;
  period: string;
  description: string;
}

export interface AboutData {
  shortBio: string;
  longStory: string;
  education: TimelineItem[];
  experience: TimelineItem[];
}

export const defaultAboutData: AboutData = {
  shortBio: 'Full-Stack Developer with 10+ years of experience building web applications.',
  longStory: `I'm a passionate developer who loves creating elegant solutions to complex problems. My journey in tech started when I built my first website at 15, and I've been hooked ever since.

Over the years, I've worked with startups and enterprises, leading teams and shipping products used by millions. I believe in clean code, thoughtful design, and continuous learning.

When I'm not coding, you can find me reading, hiking, or experimenting with new technologies.`,
  education: [
    {
      id: 'edu-1',
      title: 'M.S. Computer Science',
      organization: 'Stanford University',
      period: '2012 - 2014',
      description: 'Focused on distributed systems and machine learning.',
    },
    {
      id: 'edu-2',
      title: 'B.S. Computer Science',
      organization: 'UC Berkeley',
      period: '2008 - 2012',
      description: 'Graduated with honors. Minor in Mathematics.',
    },
  ],
  experience: [
    {
      id: 'exp-1',
      title: 'Senior Software Engineer',
      organization: 'Tech Company',
      period: '2020 - Present',
      description: 'Leading frontend architecture and mentoring junior developers.',
    },
    {
      id: 'exp-2',
      title: 'Software Engineer',
      organization: 'Startup Inc.',
      period: '2016 - 2020',
      description: 'Built core features and scaled the platform to 1M+ users.',
    },
    {
      id: 'exp-3',
      title: 'Junior Developer',
      organization: 'Agency Co.',
      period: '2014 - 2016',
      description: 'Developed client websites and internal tools.',
    },
  ],
};

import { apiFetch } from "@/lib/api";

export async function fetchAboutData(isPublic = false): Promise<AboutData> {
  const path = isPublic ? "/public/about" : "/api/about";
  try {
    const res = await apiFetch<AboutData>(path);
    return res.data ?? defaultAboutData;
  } catch {
    return defaultAboutData;
  }
}

export async function saveAboutData(data: AboutData): Promise<AboutData> {
  const res = await apiFetch<AboutData>("/api/about", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data ?? data;
}
