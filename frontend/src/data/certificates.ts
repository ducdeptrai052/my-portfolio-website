import { apiFetch } from "@/lib/api";

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  platform: string;
  logoUrl: string;
  year: number;
  verifyUrl: string;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type CertificateApi = Partial<Certificate> & { id: string };

const knownPlatformLogos: Record<string, string> = {
  coursera: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Coursera_logo_%282020%29.svg",
  google: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  ibm: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
  aws: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
};

const normalizePlatform = (platform?: string) => (platform ?? "").trim().toLowerCase();

export const defaultCertificates: Certificate[] = [
  {
    id: "google-cybersecurity",
    title: "Google Cybersecurity Professional Certificate",
    issuer: "Google",
    platform: "Coursera",
    logoUrl: knownPlatformLogos.coursera,
    year: 2025,
    verifyUrl: "https://www.coursera.org/professional-certificates/google-cybersecurity",
    featured: true,
  },
  {
    id: "aws-cloud-practitioner",
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    platform: "AWS",
    logoUrl: knownPlatformLogos.aws,
    year: 2025,
    verifyUrl: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
    featured: true,
  },
  {
    id: "ibm-full-stack",
    title: "IBM Full Stack Software Developer Professional Certificate",
    issuer: "IBM",
    platform: "Coursera",
    logoUrl: knownPlatformLogos.coursera,
    year: 2024,
    verifyUrl: "https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer",
    featured: true,
  },
  {
    id: "google-ux-design",
    title: "Google UX Design Professional Certificate",
    issuer: "Google",
    platform: "Coursera",
    logoUrl: knownPlatformLogos.coursera,
    year: 2024,
    verifyUrl: "https://www.coursera.org/professional-certificates/google-ux-design",
    featured: false,
  },
  {
    id: "ibm-devops",
    title: "IBM DevOps and Software Engineering Professional Certificate",
    issuer: "IBM",
    platform: "Coursera",
    logoUrl: knownPlatformLogos.coursera,
    year: 2024,
    verifyUrl: "https://www.coursera.org/professional-certificates/devops-and-software-engineering",
    featured: false,
  },
  {
    id: "aws-developer-associate",
    title: "AWS Certified Developer - Associate",
    issuer: "Amazon Web Services",
    platform: "AWS",
    logoUrl: knownPlatformLogos.aws,
    year: 2026,
    verifyUrl: "https://aws.amazon.com/certification/certified-developer-associate/",
    featured: false,
  },
];

const mapCertificate = (item: CertificateApi): Certificate => {
  const platform = item.platform?.trim() || "";
  const platformKey = normalizePlatform(platform);
  return {
    id: item.id,
    title: item.title ?? "",
    issuer: item.issuer ?? "",
    platform,
    logoUrl: item.logoUrl ?? knownPlatformLogos[platformKey] ?? "",
    year: Number(item.year ?? new Date().getFullYear()),
    verifyUrl: item.verifyUrl ?? "",
    featured: item.featured ?? false,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

let cachedCertificates: Certificate[] | null = null;
let inflight: Promise<Certificate[]> | null = null;

export async function fetchCertificatesPublic(force = false): Promise<Certificate[]> {
  if (cachedCertificates && !force) return cachedCertificates;
  if (inflight && !force) return inflight;

  inflight = (async () => {
    try {
      const res = await apiFetch<CertificateApi[]>("/public/certificates");
      const data = (res.data ?? []).map(mapCertificate);
      cachedCertificates = data;
      return cachedCertificates;
    } catch {
      cachedCertificates = [];
      return [];
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
