import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({ title: "Message sent!", description: "I'll get back to you soon.", variant: "success" });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <SectionHeader title="Get in Touch" subtitle="Have a project in mind? Let's talk." align="center" />
          
          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-2 block">Name *</label><Input required placeholder="Your name" /></div>
              <div><label className="text-sm font-medium mb-2 block">Email *</label><Input type="email" required placeholder="you@example.com" /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-2 block">Phone</label><Input placeholder="+1 (555) 000-0000" /></div>
              <div><label className="text-sm font-medium mb-2 block">Company</label><Input placeholder="Your company" /></div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category *</label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">New Project</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="job">Job Opportunity</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium mb-2 block">Subject *</label><Input required placeholder="What's this about?" /></div>
            <div><label className="text-sm font-medium mb-2 block">Message *</label><Textarea required placeholder="Tell me more..." className="min-h-[150px]" /></div>
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
