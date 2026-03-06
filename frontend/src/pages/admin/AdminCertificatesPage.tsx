import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AdminCertificate,
  createCertificate,
  deleteCertificate,
  fetchCertificates,
  updateCertificate,
} from "@/data/adminCertificates";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const PLATFORM_LOGO_URLS: Record<string, string> = {
  coursera: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Coursera_logo_%282020%29.svg",
  google: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  ibm: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
  aws: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
};

const ISSUER_OPTIONS = ["Coursera", "AWS", "Google", "IBM", "Meta", "Scrimba"] as const;
const CUSTOM_ISSUER_VALUE = "__custom_issuer__";

const suggestLogoUrl = (platform: string) => {
  const normalized = platform.trim().toLowerCase();
  if (!normalized) return "";
  if (normalized.includes("coursera")) return PLATFORM_LOGO_URLS.coursera;
  if (normalized.includes("google")) return PLATFORM_LOGO_URLS.google;
  if (normalized.includes("ibm")) return PLATFORM_LOGO_URLS.ibm;
  if (normalized === "aws" || normalized.includes("amazon web services")) return PLATFORM_LOGO_URLS.aws;
  return "";
};

const emptyCertificate: AdminCertificate = {
  id: "",
  title: "",
  issuer: "Coursera",
  platform: "Coursera",
  logoUrl: PLATFORM_LOGO_URLS.coursera,
  year: new Date().getFullYear(),
  verifyUrl: "",
  featured: false,
};

export default function AdminCertificatesPage() {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<AdminCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminCertificate>(emptyCertificate);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const selectedCertificate = useMemo(
    () => certificates.find((certificate) => certificate.id === selectedId) || null,
    [certificates, selectedId]
  );

  useEffect(() => {
    fetchCertificates()
      .then((data) => setCertificates(data))
      .catch(() =>
        toast({ title: "Error", description: "Failed to load certificates", variant: "destructive" })
      )
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    if (selectedCertificate) {
      const suggestedLogo = suggestLogoUrl(selectedCertificate.platform);
      setForm({
        ...selectedCertificate,
        logoUrl: selectedCertificate.logoUrl || suggestedLogo,
      });
    } else {
      setForm(emptyCertificate);
    }
  }, [selectedCertificate]);

  const handleChange = (field: keyof AdminCertificate, value: string | number | boolean) => {
    setForm((prev) => {
      if (field === "platform" && typeof value === "string") {
        const suggestedLogo = suggestLogoUrl(value);
        if (!prev.logoUrl.trim() && suggestedLogo) {
          return { ...prev, platform: value, logoUrl: suggestedLogo };
        }
      }
      return { ...prev, [field]: value };
    });
  };

  const normalizedIssuer = form.issuer.trim().toLowerCase();
  const issuerPresetValue =
    ISSUER_OPTIONS.find((issuer) => issuer.toLowerCase() === normalizedIssuer) ?? null;
  const issuerSelectValue = issuerPresetValue ?? CUSTOM_ISSUER_VALUE;

  const handleIssuerSelect = (value: string) => {
    if (value === CUSTOM_ISSUER_VALUE) {
      if (issuerPresetValue) {
        handleChange("issuer", "");
      }
      return;
    }
    handleChange("issuer", value);
  };

  const handleAutoFillLogo = () => {
    const suggestedLogo = suggestLogoUrl(form.platform);
    if (!suggestedLogo) {
      toast({
        title: "No suggested logo",
        description: "No default logo found for this platform.",
        variant: "destructive",
      });
      return;
    }
    setForm((prev) => ({ ...prev, logoUrl: suggestedLogo }));
    toast({ title: "Logo auto-filled", description: "Logo URL was suggested from platform." });
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.issuer.trim() || !form.platform.trim() || !form.verifyUrl.trim()) {
      toast({
        title: "Missing fields",
        description: "Title, issuer, platform and verify URL are required.",
        variant: "destructive",
      });
      return;
    }

    if (!Number.isFinite(form.year) || form.year < 1900) {
      toast({
        title: "Invalid year",
        description: "Please enter a valid completion year.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (selectedCertificate) {
        const updated = await updateCertificate({ ...selectedCertificate, ...form });
        setCertificates((prev) => prev.map((certificate) => (certificate.id === updated.id ? updated : certificate)));
        toast({ title: "Saved", description: "Certificate updated." });
      } else {
        const created = await createCertificate(form);
        setCertificates((prev) => [created, ...prev]);
        setSelectedId(created.id);
        toast({ title: "Created", description: "Certificate added." });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save certificate",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCertificate) return;
    try {
      await deleteCertificate(selectedCertificate.id);
      setCertificates((prev) => prev.filter((certificate) => certificate.id !== selectedCertificate.id));
      setSelectedId(null);
      toast({ title: "Deleted", description: "Certificate removed." });
    } catch {
      toast({ title: "Error", description: "Failed to delete certificate", variant: "destructive" });
    }
  };

  return (
    <div className="grid gap-4 md:gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Certificates</CardTitle>
          <Button variant="outline" onClick={() => setSelectedId(null)} className="w-full sm:w-auto">
            New Certificate
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading certificates...</p>
          ) : certificates.length === 0 ? (
            <p className="text-muted-foreground">No certificates yet.</p>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {certificates.map((certificate) => (
                  <button
                    key={certificate.id}
                    type="button"
                    onClick={() => setSelectedId(certificate.id)}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      selectedId === certificate.id
                        ? "border-primary/50 bg-muted/70"
                        : "border-border bg-card hover:bg-muted/40"
                    }`}
                  >
                    <p className="font-medium line-clamp-2">{certificate.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {certificate.issuer} • {certificate.year}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{certificate.platform}</span>
                      <Badge variant={certificate.featured ? "default" : "secondary"}>
                        {certificate.featured ? "Featured" : "Standard"}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Featured</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((certificate) => (
                      <TableRow
                        key={certificate.id}
                        className={selectedId === certificate.id ? "bg-muted/60" : "cursor-pointer"}
                        onClick={() => setSelectedId(certificate.id)}
                      >
                        <TableCell>
                          <p className="font-medium line-clamp-1">{certificate.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {certificate.issuer} • {certificate.year}
                          </p>
                        </TableCell>
                        <TableCell>{certificate.platform}</TableCell>
                        <TableCell>
                          <Badge variant={certificate.featured ? "default" : "secondary"}>
                            {certificate.featured ? "Featured" : "Standard"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{selectedCertificate ? "Edit Certificate" : "Create Certificate"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Certificate Title</Label>
            <Input value={form.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="AWS Certified Solutions Architect" />
          </div>
          <div className="space-y-2">
            <Label>Issuer</Label>
            <Select value={issuerSelectValue} onValueChange={handleIssuerSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select issuer" />
              </SelectTrigger>
              <SelectContent>
                {ISSUER_OPTIONS.map((issuer) => (
                  <SelectItem key={issuer} value={issuer}>
                    {issuer}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_ISSUER_VALUE}>+ Add new issuer</SelectItem>
              </SelectContent>
            </Select>
            {issuerSelectValue === CUSTOM_ISSUER_VALUE && (
              <Input
                value={form.issuer}
                onChange={(e) => handleChange("issuer", e.target.value)}
                placeholder="Enter new issuer name"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label>Platform</Label>
            <Input value={form.platform} onChange={(e) => handleChange("platform", e.target.value)} placeholder="Coursera, Google, IBM, AWS..." />
          </div>
          <div className="space-y-2">
            <Label>Completion Year</Label>
            <Input
              type="number"
              value={form.year}
              min={1900}
              max={2100}
              onChange={(e) => handleChange("year", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Verify URL</Label>
            <Input value={form.verifyUrl} onChange={(e) => handleChange("verifyUrl", e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Logo URL (optional)</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input value={form.logoUrl} onChange={(e) => handleChange("logoUrl", e.target.value)} placeholder="https://logo.svg" />
              <Button type="button" variant="outline" onClick={handleAutoFillLogo} className="w-full sm:w-auto">
                Auto
              </Button>
            </div>
            {form.logoUrl && (
              <div className="mt-2 rounded-md border border-border/70 bg-card p-2">
                <img
                  src={form.logoUrl}
                  alt="Logo preview"
                  className="h-9 w-auto object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => handleChange("featured", e.target.checked)}
              className="h-4 w-4 rounded border border-input"
            />
            Mark as featured certificate
          </label>
          <Separator />
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            {selectedCertificate && (
              <Button variant="destructive" type="button" onClick={() => setDeleteOpen(true)} className="w-full sm:w-auto">
                Delete
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Certificate"
        description="Are you sure you want to delete this certificate?"
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
