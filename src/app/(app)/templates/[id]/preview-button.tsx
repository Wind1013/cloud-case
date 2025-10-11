"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PreviewButton({ templateId }: { templateId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePreview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateId: templateId, data: {} }),
      });
      const { pdf, filename } = await response.json();

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
      alert("Failed to generate preview");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handlePreview} disabled={isLoading}>
      {isLoading ? "Loading..." : "Preview"}
    </Button>
  );
}
