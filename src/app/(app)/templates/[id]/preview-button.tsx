"use client";

import { generatePDF } from "@/actions/template";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PreviewButton({ templateId }: { templateId: string }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePreview = async () => {
    setIsGenerating(true);
    try {
      const { pdf } = await generatePDF(templateId, {});
      const byteCharacters = atob(pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const file = new Blob([byteArray], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
      alert("Failed to generate PDF preview");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handlePreview}
      disabled={isGenerating}
      className="btn btn-secondary"
    >
      {isGenerating ? "Generating..." : "Preview"}
    </Button>
  );
}
