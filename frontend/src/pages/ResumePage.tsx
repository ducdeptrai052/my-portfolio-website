import { Download, FileText } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { fetchSiteSettings } from "@/data/siteSettings";
import { setPageMeta } from "@/lib/seo";

export default function ResumePage() {
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [allowInlinePreview, setAllowInlinePreview] = useState(false);

  useEffect(() => {
    fetchSiteSettings(true)
      .then((data) => setResumeUrl(data.resumeUrl || ""))
      .catch(() => setResumeUrl(""));
  }, []);

  useEffect(() => {
    setPageMeta({
      title: "Resume | Minh Duc",
      description: "Download or preview my latest resume.",
      canonical: "https://www.hominhduc.cloud/resume",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Resume",
        url: "https://www.hominhduc.cloud/resume",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.hominhduc.cloud/" },
            { "@type": "ListItem", position: 2, name: "Resume", item: "https://www.hominhduc.cloud/resume" },
          ],
        },
      },
    });
  }, []);

  const downloadLink = resumeUrl || "/resume.pdf";
  const isPdf = !!resumeUrl && /\.pdf($|\?)/i.test(resumeUrl);
  const isMobile = typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false;

  useEffect(() => {
    if (!isPdf) return;
    // On mobile or slow connections we defer inline PDF rendering until user opts in.
    const connection = (navigator as any)?.connection?.effectiveType;
    const slow = connection === "slow-2g" || connection === "2g";
    const autoPreview = !isMobile && !slow;
    setAllowInlinePreview(autoPreview);
  }, [isMobile, isPdf]);

  const getFilenameFromUrl = (url: string) => {
    try {
      const { pathname } = new URL(url, window.location.href);
      const name = pathname.split("/").pop();
      if (!name) return "resume.pdf";
      return name.includes(".") ? name : `${name}.pdf`;
    } catch {
      return "resume.pdf";
    }
  };

  const handleDownload = async () => {
    if (!downloadLink) return;
    try {
      const response = await fetch(downloadLink);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = getFilenameFromUrl(downloadLink);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(downloadLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <SectionHeader title="Resume" subtitle="Download my full resume or preview below" />
          
          <div className="flex gap-4 mb-8">
            <Button type="button" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            {isPdf && !allowInlinePreview && (
              <Button variant="outline" type="button" onClick={() => setAllowInlinePreview(true)}>
                <FileText className="mr-2 h-4 w-4" /> Xem trước
              </Button>
            )}
          </div>

          <Card className="p-8 bg-muted/30">
            {resumeUrl ? (
              isPdf ? (
                allowInlinePreview ? (
                  <iframe
                    src={resumeUrl}
                    title="Resume preview"
                    className="w-full min-h-[70vh] rounded-md border bg-background"
                    loading="lazy"
                  >
                    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                      <FileText className="h-16 w-16 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Preview không hiển thị được. Nhấn tải xuống để xem PDF.
                      </p>
                      <Button type="button" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </Button>
                    </div>
                  </iframe>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                    <p className="text-muted-foreground max-w-md">
                      Để tiết kiệm băng thông trên thiết bị di động, xem trước PDF chỉ tải khi bạn yêu cầu.
                    </p>
                    <Button type="button" onClick={() => setAllowInlinePreview(true)}>
                      <FileText className="mr-2 h-4 w-4" /> Xem trước PDF
                    </Button>
                    <Button variant="outline" type="button" onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" /> Tải xuống luôn
                    </Button>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center">
                  <img
                    src={resumeUrl}
                    alt="Resume preview"
                    className="max-h-[80vh] w-full object-contain rounded-md border bg-background"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )
            ) : (
              <div className="flex items-center justify-center py-24 text-center">
                <div>
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-serif text-xl font-medium mb-2">Resume Preview</h3>
                  <p className="text-muted-foreground">
                    Empty.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
