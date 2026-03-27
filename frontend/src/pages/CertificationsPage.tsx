import { Award, ExternalLink, Filter } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CallToActionSection } from "@/components/CallToActionSection";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchCertificatesPublic, type Certificate } from "@/data/certificates";
import { recruiterCtaPreset } from "@/data/recruiterCta";
import { setPageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { getPlatformLogoClass, getPlatformMonogram } from "@/lib/certificateBrand";

type IssuerFilterId = "all" | "amazon-web-services" | "google" | "ibm" | "meta";
type IssuerOnlyFilterId = Exclude<IssuerFilterId, "all">;

const issuerFilters: { id: IssuerFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "amazon-web-services", label: "Amazon Web Services" },
  { id: "google", label: "Google" },
  { id: "ibm", label: "IBM" },
  { id: "meta", label: "Meta" },
];

const emptyIssuerCounts: Record<IssuerOnlyFilterId, number> = {
  "amazon-web-services": 0,
  google: 0,
  ibm: 0,
  meta: 0,
};

const mapIssuerToFilter = (issuer: string): IssuerOnlyFilterId | null => {
  const normalized = issuer.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.includes("amazon web services") || /\baws\b/.test(normalized)) return "amazon-web-services";
  if (normalized.includes("google")) return "google";
  if (normalized.includes("ibm")) return "ibm";
  if (normalized.includes("meta")) return "meta";
  return null;
};

function CertificationCard({ cert, featured = false }: { cert: Certificate; featured?: boolean }) {
  return (
    <Card
      className={cn(
        "group flex h-full flex-col rounded-xl border bg-card/85 transition-all duration-300 hover:-translate-y-1",
        featured
          ? "border-accent/35 p-4 sm:p-5 shadow-[0_14px_35px_-26px_hsl(var(--accent)/0.8)]"
          : "border-border/70 p-4 shadow-[0_10px_24px_-22px_rgba(0,0,0,0.9)]"
      )}
    >
      <CardHeader className="p-0">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            {cert.logoUrl ? (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted p-2">
                <img
                  src={cert.logoUrl}
                  alt={`${cert.platform} logo`}
                  className="h-6 w-6 object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </span>
            ) : (
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold tracking-wide ${getPlatformLogoClass(
                  cert.platform
                )}`}
              >
                {getPlatformMonogram(cert.platform)}
              </span>
            )}
          </div>
          <h3
            className={`font-serif font-medium leading-snug [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden ${
              featured ? "text-lg sm:text-[1.22rem]" : "text-[0.98rem] sm:text-base"
            }`}
          >
            {cert.title}
          </h3>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="h-5 px-2 py-0 text-[10px] font-semibold">
            {cert.platform}
          </Badge>
          <span className="max-w-full text-[11px] text-muted-foreground">
            {cert.issuer} · {cert.year}
          </span>
        </div>
      </CardContent>

      <div className="flex-1" />

      <CardFooter className="p-0 pt-3.5">
        <a
          href={cert.verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/verify flex h-8 w-full items-center justify-between rounded-md border border-border/70 bg-background/30 px-2.5 text-[12px] font-semibold text-foreground/90 transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-accent"
        >
          <span className="flex items-center gap-2">
            <Award className="h-3.5 w-3.5" />
            Verify Certificate
          </span>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover/verify:text-accent" />
        </a>
      </CardFooter>
    </Card>
  );
}

function CertificationCardsGrid({
  loading,
  skeletons,
  certificates,
  className,
  emptyState,
  featured = false,
}: {
  loading: boolean;
  skeletons: ReactNode;
  certificates: Certificate[];
  className: string;
  emptyState?: ReactNode;
  featured?: boolean;
}) {
  return (
    <div className={className}>
      {loading && skeletons}
      {!loading && certificates.map((cert) => <CertificationCard key={cert.id} cert={cert} featured={featured} />)}
      {!loading && certificates.length === 0 && emptyState}
    </div>
  );
}

export default function CertificationsPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<IssuerFilterId>("all");

  useEffect(() => {
    fetchCertificatesPublic()
      .then((data) => {
        setCertificates(data);
        setError(null);
      })
      .catch((err: Error) => setError(err?.message || "Failed to load certifications"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPageMeta({
      title: "Certifications | Minh Duc",
      description: "Professional certifications from industry-leading platforms and organizations.",
      canonical: "https://www.hominhduc.cloud/certifications",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Certifications",
        url: "https://www.hominhduc.cloud/certifications",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.hominhduc.cloud/" },
            { "@type": "ListItem", position: 2, name: "Certifications", item: "https://www.hominhduc.cloud/certifications" },
          ],
        },
      },
    });
  }, []);

  const issuerCounts = useMemo(() => {
    const counts = { ...emptyIssuerCounts };
    for (const cert of certificates) {
      const bucket = mapIssuerToFilter(cert.issuer);
      if (bucket) counts[bucket] += 1;
    }
    return counts;
  }, [certificates]);

  const issuerFilteredCertificates = useMemo(() => {
    if (activeFilter === "all") return certificates;
    return certificates.filter((cert) => mapIssuerToFilter(cert.issuer) === activeFilter);
  }, [activeFilter, certificates]);

  const featuredCertificates = useMemo(
    () => issuerFilteredCertificates.filter((cert) => cert.featured),
    [issuerFilteredCertificates]
  );
  const allGridCertificates = useMemo(() => {
    if (activeFilter === "all") return issuerFilteredCertificates.filter((cert) => !cert.featured);
    return issuerFilteredCertificates;
  }, [activeFilter, issuerFilteredCertificates]);

  const featuredSkeletons = Array.from({ length: 3 }, (_, i) => (
    <div key={`featured-cert-skeleton-${i}`} className="h-64 rounded-xl border bg-muted animate-pulse" />
  ));
  const allGridSkeletons = Array.from({ length: 8 }, (_, i) => (
    <div key={`all-cert-skeleton-${i}`} className="h-56 rounded-xl border bg-muted animate-pulse" />
  ));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pb-16 md:pb-20">
        <section className="relative overflow-hidden border-b border-border/60 bg-pattern px-3 pt-24 pb-10 sm:px-4 sm:pt-28 sm:pb-12 md:pt-32">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-background/30" />
          <div className="container mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/55 bg-accent/20 px-3 py-1.5 text-xs font-semibold text-accent shadow-[0_0_24px_-14px_hsl(var(--accent))] sm:mb-6 sm:px-4 sm:text-sm">
              <Award className="h-3.5 w-3.5" />
              <span>{certificates.length} Verified Credentials</span>
            </div>
            <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl md:text-6xl">Certifications</h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-foreground/80 sm:mt-4 sm:text-lg">
              Professional certifications from industry-leading platforms and organizations.
            </p>
          </div>
        </section>

        <section className="sticky top-14 z-30 border-y border-border/60 bg-background/85 backdrop-blur-md md:top-16">
          <div className="container mx-auto max-w-[1280px] px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="shrink-0 text-muted-foreground">
                <Filter className="h-4 w-4" />
              </div>
              <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {issuerFilters.map((filter) => {
                  const isActive = activeFilter === filter.id;
                  const count = filter.id === "all" ? certificates.length : issuerCounts[filter.id];

                  return (
                    <button
                      key={filter.id}
                      type="button"
                      className={cn(
                        "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-[11px] font-semibold transition-colors sm:gap-2 sm:px-3 sm:text-xs",
                        isActive
                          ? "border-foreground bg-foreground text-background"
                          : "border-border/70 bg-card/70 text-foreground/85 hover:border-accent/30 hover:text-foreground"
                      )}
                      onClick={() => setActiveFilter(filter.id)}
                    >
                      {filter.label}
                      {filter.id !== "all" && (
                        <Badge
                          variant="secondary"
                          className={`ml-0.5 h-4 min-w-4 px-1 text-[10px] leading-none ${
                            isActive
                              ? "bg-background/20 text-background"
                              : "rounded-full bg-muted/80 text-muted-foreground"
                          }`}
                        >
                          {count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-3 py-8 sm:px-4 sm:py-10">
          <div className="container mx-auto max-w-[1280px] space-y-10">
            {activeFilter === "all" && (
              <div className="space-y-5">
                <h2 className="flex items-center gap-2 font-serif text-2xl font-medium sm:text-3xl">
                  <Award className="h-4 w-4 text-accent" />
                  Featured
                </h2>
                <CertificationCardsGrid
                  loading={loading}
                  skeletons={featuredSkeletons}
                  certificates={featuredCertificates}
                  featured
                  className="grid gap-5 md:grid-cols-3"
                  emptyState={
                    <p className="col-span-full py-8 text-center text-muted-foreground">
                      No featured certifications yet.
                    </p>
                  }
                />
              </div>
            )}

            <div className="space-y-5">
              {activeFilter === "all" && (
                <h2 className="font-serif text-2xl font-medium sm:text-3xl">All Certifications</h2>
              )}
              <CertificationCardsGrid
                loading={loading}
                skeletons={allGridSkeletons}
                certificates={allGridCertificates}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                emptyState={
                  <p className="col-span-full py-10 text-center text-muted-foreground">
                    No certifications found for this filter.
                  </p>
                }
              />
            </div>

            {error && !loading && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </section>

        <CallToActionSection {...recruiterCtaPreset} className="mt-0 px-3 sm:px-4" />
      </main>

      <Footer />
    </div>
  );
}
