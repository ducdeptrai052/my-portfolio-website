import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Mail, href: "mailto:hello@example.com", label: "Email" },
];

const footerLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              to="/"
              className="font-serif text-2xl font-semibold tracking-tight"
            >
              Minh Duc
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Full-stack developer crafting thoughtful digital experiences.
              Always learning, always building.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium">Navigate</h4>
            <nav className="flex flex-col space-y-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium">Connect</h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} Minh Duc. All rights reserved.</p>
          <p>Built with React & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}
