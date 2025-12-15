"use client";

import { Template } from "@/generated/prisma";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { handlePdfResponse } from "@/lib/utils";

export default function PreviewClient({ template }: { template: Template }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<{ base64: string; filename: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function generatePdf() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/generate-pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          credentials: "include",
          mode: "cors",
          cache: "no-cache",
          body: JSON.stringify({ templateId: template.id, data: {} }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        if (!result.pdf || !result.filename) {
          throw new Error("Invalid response from server");
        }

        // Convert base64 to blob URL for display
        try {
          const base64Data = result.pdf;
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "application/pdf" });

          // Create blob URL for display
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setPdfData({ base64: result.pdf, filename: result.filename });
          console.log("PDF blob URL created successfully");
          
          // Also create data URL as fallback for browsers that block blob URLs
          const dataUrl = `data:application/pdf;base64,${result.pdf}`;
          // Store it but use blob URL first (more efficient)
          (window as any).__pdfDataUrl = dataUrl;
        } catch (blobError) {
          console.error("Error creating blob:", blobError);
          throw new Error("Failed to create PDF preview. Please try downloading the PDF instead.");
        }
      } catch (err) {
        let errorMessage = err instanceof Error ? err.message : "Failed to generate preview";
        
        // Brave-specific error handling
        if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
          errorMessage = "Network error. Please check your connection and try again. If using Brave browser, ensure shields are not blocking the request.";
        } else if (errorMessage.includes("CORS") || errorMessage.includes("cross-origin")) {
          errorMessage = "Cross-origin request blocked. If using Brave browser, try disabling shields for this site or allow cross-site cookies.";
        }
        
        console.error("Preview generation error:", err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    generatePdf();

    // Cleanup function
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [template.id]);

  const handleDownload = () => {
    if (pdfData) {
      handlePdfResponse(pdfData.base64, pdfData.filename, false);
    } else {
      console.error("No PDF data available for download");
      alert("PDF not available for download. Please try generating again.");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[600px] gap-4 animate-in fade-in duration-300">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground">Generating PDF preview...</p>
            <p className="text-sm text-muted-foreground">Please wait while we prepare your document</p>
          </div>
          <div className="flex gap-1 mt-4">
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-destructive">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{template.name}</h1>
          <p className="text-sm text-muted-foreground">PDF Preview</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        {pdfUrl ? (
          <div className="w-full h-[calc(100vh-200px)] min-h-[600px] relative">
            {/* Try object tag first (better browser compatibility) */}
            <object
              data={pdfUrl}
              type="application/pdf"
              className="w-full h-full"
              aria-label="PDF Preview"
            >
              {/* If object fails, try iframe */}
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="PDF Preview"
                style={{ border: "none" }}
              >
                {/* Final fallback if both object and iframe fail */}
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                  <p className="text-muted-foreground text-center">
                    Your browser doesn't support PDF preview. Please download the PDF to view it.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleDownload} 
                      variant="default"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    {pdfData && (
                      <Button
                        onClick={() => {
                          const dataUrl = `data:application/pdf;base64,${pdfData.base64}`;
                          window.open(dataUrl, "_blank");
                        }}
                        variant="outline"
                      >
                        Open in New Tab
                      </Button>
                    )}
                  </div>
                </div>
              </iframe>
            </object>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-200px)] min-h-[600px]">
            <p className="text-muted-foreground">No PDF to display</p>
          </div>
        )}
      </div>
    </div>
  );
}

