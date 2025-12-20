import { Download, FileText } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { fetchSiteSettings, defaultSiteSettings } from "@/data/siteSettings";

export default function ResumePage() {
  const [resumeUrl, setResumeUrl] = useState<string>("");
  useEffect(() => {
    fetchSiteSettings(true)
      .then((data) => setResumeUrl(data.resumeUrl || ""))
      .catch(() => setResumeUrl(""));
  }, []);

  const downloadLink = resumeUrl || "/resume.pdf";
  const isPdf = !!resumeUrl && /\.pdf($|\?)/i.test(resumeUrl);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <SectionHeader title="Resume" subtitle="Download my full resume or preview below" />
          
          <div className="flex gap-4 mb-8">
            <Button asChild>
              <a href={downloadLink} download>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </a>
            </Button>
          </div>

          <Card className="p-8 bg-muted/30">
            {resumeUrl ? (
              isPdf ? (
                <object
                  data={resumeUrl}
                  type="application/pdf"
                  className="w-full min-h-[70vh] rounded-md border"
                >
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Preview không hiển thị được. Nhấn tải xuống để xem PDF.
                    </p>
                    <Button asChild>
                      <a href={downloadLink} download>
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </a>
                    </Button>
                  </div>
                </object>
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
                    Hiện chưa có resume. Hãy upload trong Admin Settings.
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
