import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const skills = {
  Languages: ["TypeScript", "JavaScript", "Python", "Go", "SQL", "HTML/CSS"],
  Frameworks: ["React", "Next.js", "Node.js", "Express", "FastAPI", "Tailwind CSS"],
  Tools: ["Git", "VS Code", "Figma", "Notion", "Linear", "Vercel"],
  Databases: ["PostgreSQL", "MongoDB", "Redis", "Supabase"],
  DevOps: ["Docker", "Kubernetes", "GitHub Actions", "AWS", "Terraform"],
  Design: ["Figma", "Adobe XD", "Framer", "Principle"],
};

const experience = [
  { role: "Senior Software Engineer", company: "Tech Corp", period: "2022 - Present", description: "Leading frontend architecture for the main product." },
  { role: "Software Engineer", company: "StartupXYZ", period: "2019 - 2022", description: "Full-stack development for B2B SaaS platform." },
  { role: "Junior Developer", company: "Agency Co", period: "2017 - 2019", description: "Built websites and web applications for clients." },
];

const education = [
  { degree: "M.S. Computer Science", school: "Stanford University", period: "2015 - 2017" },
  { degree: "B.S. Computer Science", school: "UC Berkeley", period: "2011 - 2015" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row gap-8 mb-16">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" alt="John Doe" className="w-32 h-32 rounded-full object-cover" />
            <div>
              <h1 className="font-serif text-4xl font-medium mb-2">John Doe</h1>
              <p className="text-xl text-muted-foreground mb-4">Full-Stack Developer & Designer</p>
              <p className="text-muted-foreground">San Francisco, CA</p>
            </div>
          </div>

          <section className="mb-16">
            <SectionHeader title="About Me" />
            <p className="text-lg text-muted-foreground leading-relaxed">
              I'm a software engineer with over 10 years of experience building digital products. I love the intersection of design and engineering, creating experiences that are both beautiful and functional. When I'm not coding, you'll find me hiking, reading, or experimenting with new technologies.
            </p>
          </section>

          <Separator className="my-12" />

          <section className="mb-16">
            <SectionHeader title="Experience" />
            <div className="space-y-8">
              {experience.map((exp, i) => (
                <div key={i} className="relative pl-8 border-l-2 border-border">
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-accent" />
                  <h3 className="font-serif text-xl font-medium">{exp.role}</h3>
                  <p className="text-accent font-medium">{exp.company}</p>
                  <p className="text-sm text-muted-foreground mb-2">{exp.period}</p>
                  <p className="text-muted-foreground">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <SectionHeader title="Education" />
            <div className="space-y-6">
              {education.map((edu, i) => (
                <div key={i} className="relative pl-8 border-l-2 border-border">
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary" />
                  <h3 className="font-serif text-xl font-medium">{edu.degree}</h3>
                  <p className="text-muted-foreground">{edu.school}</p>
                  <p className="text-sm text-muted-foreground">{edu.period}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="Skills" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(skills).map(([category, items]) => (
                <div key={category}>
                  <h4 className="font-medium mb-3">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
