"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Eye } from "lucide-react";

export default function PreviewButton({ templateId }: { templateId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePreview = () => {
    setIsLoading(true);
    router.push(`/legal-forms/${templateId}/preview`);
    // Reset loading state after navigation (in case navigation is delayed)
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <Button onClick={handlePreview} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </>
      )}
    </Button>
  );
}
