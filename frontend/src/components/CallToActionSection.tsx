import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CtaAction = {
  label: string;
  to: string;
  variant?: "hero" | "hero-outline";
  className?: string;
};

interface CallToActionSectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryAction?: CtaAction;
  secondaryAction?: CtaAction | null;
  className?: string;
}

const defaultPrimaryAction: CtaAction = {
  label: "Contact",
  to: "/contact",
  variant: "hero",
};

const defaultSecondaryAction: CtaAction = {
  label: "View Resume",
  to: "/resume",
  variant: "hero-outline",
};

const actionClasses: Record<NonNullable<CtaAction["variant"]>, string> = {
  hero:
    "liquid-glass-hover shadow-lg shadow-accent/30 dark:shadow-primary/25 hover:text-foreground dark:hover:text-white",
  "hero-outline":
    "liquid-glass-hover shadow-lg shadow-primary/20 dark:shadow-primary/25 hover:text-foreground dark:hover:text-white",
};

export function CallToActionSection({
  eyebrow = "Let's build something",
  title = "I design and build reliable systems.",
  description = "Want to collaborate or learn more about my work? Get in touch or download my resume.",
  primaryAction,
  secondaryAction,
  className,
}: CallToActionSectionProps) {
  const primary = { ...defaultPrimaryAction, ...primaryAction };
  const secondary = secondaryAction === null ? null : { ...defaultSecondaryAction, ...secondaryAction };

  return (
    <div className={cn("mx-auto mt-12 w-full max-w-3xl px-4 lg:px-0", className)}>
      <div className="cta-glass px-6 py-6">
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground dark:text-white/70">
              {eyebrow}
            </p>
            <h3 className="mt-2 text-2xl font-serif text-foreground dark:text-white">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground dark:text-white/70">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={primary.variant ?? "hero"}
              size="lg"
              asChild
              className={cn(actionClasses[primary.variant ?? "hero"], primary.className)}
            >
              <Link to={primary.to}>{primary.label}</Link>
            </Button>
            {secondary && (
              <Button
                variant={secondary.variant ?? "hero-outline"}
                size="lg"
                asChild
                className={cn(actionClasses[secondary.variant ?? "hero-outline"], secondary.className)}
              >
                <Link to={secondary.to}>{secondary.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
