"use client";

import { Template } from "@/generated/prisma";
import { useState } from "react";
import { handlePdfResponse } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function UseTemplatePage({ template }: { template: Template }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include", // Include cookies for authentication (important for Brave browser)
        mode: "cors",
        cache: "no-cache",
        body: JSON.stringify({ templateId: template.id, data: formData }),
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

      // Handle PDF response - opens in new window with fallback to download
      // Compatible with all browsers (Chrome, Firefox, Safari, Edge)
      handlePdfResponse(result.pdf, result.filename, true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate PDF";
      console.error("PDF generation error:", error);
      alert(`Failed to generate PDF: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!template) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 relative">
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-4 min-w-[300px]">
            <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">Generating PDF...</p>
              <p className="text-sm text-gray-500 mt-1">Please wait while we create your document</p>
            </div>
            <div className="flex gap-1 mt-2">
              <div className="h-2 w-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="h-2 w-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="h-2 w-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        </div>
      )}
      
      <h1 className="text-3xl font-bold mb-6">Use Template: {template.name}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
          {isGenerating && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                <p className="text-sm text-gray-600">Processing form...</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.isArray(template.variables) &&
              template.variables.map(variable => (
                <div key={variable as string} className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {(variable as string).replace(/_/g, " ")}
                  </label>
                  <input
                    type="text"
                    name={variable as string}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              ))}
          </div>
          <div className="mt-6">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                "Generate PDF"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
