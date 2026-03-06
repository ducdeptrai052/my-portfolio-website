import { apiFetch } from "@/lib/api";
import { Certificate } from "./certificates";

export interface AdminCertificate extends Certificate {}

type CertificateApi = Partial<AdminCertificate> & { id: string };

const mapCertificate = (item: CertificateApi): AdminCertificate => ({
  id: item.id,
  title: item.title ?? "",
  issuer: item.issuer ?? "",
  platform: item.platform ?? "",
  logoUrl: item.logoUrl ?? "",
  year: Number(item.year ?? new Date().getFullYear()),
  verifyUrl: item.verifyUrl ?? "",
  featured: item.featured ?? false,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export async function fetchCertificates(): Promise<AdminCertificate[]> {
  const res = await apiFetch<CertificateApi[]>("/api/certificates");
  return (res.data ?? []).map(mapCertificate);
}

export async function fetchCertificateById(id: string): Promise<AdminCertificate | null> {
  if (!id) return null;
  const res = await apiFetch<CertificateApi>(`/api/certificates/${id}`);
  return res.data ? mapCertificate(res.data) : null;
}

export async function createCertificate(certificate: AdminCertificate): Promise<AdminCertificate> {
  const res = await apiFetch<CertificateApi>("/api/certificates", {
    method: "POST",
    body: JSON.stringify(certificate),
  });
  return res.data ? mapCertificate(res.data) : certificate;
}

export async function updateCertificate(certificate: AdminCertificate): Promise<AdminCertificate> {
  const res = await apiFetch<CertificateApi>(`/api/certificates/${certificate.id}`, {
    method: "PUT",
    body: JSON.stringify(certificate),
  });
  return res.data ? mapCertificate(res.data) : certificate;
}

export async function deleteCertificate(id: string): Promise<void> {
  await apiFetch(`/api/certificates/${id}`, { method: "DELETE" });
}
