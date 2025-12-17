import { Download, FileText } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <SectionHeader title="Resume" subtitle="Download my full resume or preview below" />
          
          <div className="flex gap-4 mb-8">
            <Button asChild>
              <a href="/resume.pdf" download>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </a>
            </Button>
          </div>

          <Card className="p-8 bg-muted/30">
            <div className="flex items-center justify-center py-24 text-center">
              <div>
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-serif text-xl font-medium mb-2">Resume Preview</h3>
                <p className="text-muted-foreground">
                  PDF preview would appear here. Click download to get the full resume.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
