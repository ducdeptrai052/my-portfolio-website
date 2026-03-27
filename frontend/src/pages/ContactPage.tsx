import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { submitContact } from "@/data/contact";
import { setPageMeta } from "@/lib/seo";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    category: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    setPageMeta({
      title: "Contact | Minh Duc",
      description: "Get in touch for projects, consulting, or collaboration.",
      canonical: "https://www.hominhduc.cloud/contact",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact",
        url: "https://www.hominhduc.cloud/contact",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.hominhduc.cloud/" },
            { "@type": "ListItem", position: 2, name: "Contact", item: "https://www.hominhduc.cloud/contact" },
          ],
        },
      },
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) {
      toast({ title: "Missing category", description: "Please select a category.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        company: form.company.trim() || undefined,
        category: form.category,
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      toast({ title: "Message sent!", description: "I'll get back to you soon.", variant: "success" });
      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        category: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <SectionHeader title="Get in Touch" subtitle="Have a project in mind? Let's talk." align="center" />
          
          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name *</label>
                <Input
                  required
                  placeholder="Your Full Name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email *</label>
                <Input
                  type="email"
                  required
                  placeholder="youremail@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Phone</label>
                <Input
                  placeholder="+84 123456789"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Company</label>
                <Input
                  placeholder="Your company"
                  value={form.company}
                  onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category *</label>
              <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">New Project</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="job">Job Opportunity</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Subject *</label>
              <Input
                required
                placeholder="What's this about?"
                value={form.subject}
                onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message *</label>
              <Textarea
                required
                placeholder="Tell me more..."
                className="min-h-[150px]"
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              />
            </div>
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
