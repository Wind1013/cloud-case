"use client";

import { Template } from "@/generated/prisma";
import { useState, useTransition } from "react";
import { handlePdfResponse } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function DocumentForm({ template }: { template: Template }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const handleChange = (varName: string, value: string) => {
    setFormData(prev => ({ ...prev, [varName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
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

        // Handle PDF response - triggers download
        // Compatible with all browsers (Chrome, Firefox, Safari, Edge)
        handlePdfResponse(result.pdf, result.filename, false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to generate PDF";
        console.error("PDF generation error:", error);
        alert(`Failed to generate PDF: ${errorMessage}`);
      }
    });
  };

  const variables = template.variables as string[];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
      {/* Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-gray-700">Generating PDF...</p>
            <p className="text-xs text-gray-500">This may take a few seconds</p>
          </div>
        </div>
      )}
      
      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
        {isPending && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Processing...</p>
            </div>
          </div>
        )}
        <h2 className="text-xl font-semibold mb-4">Fill Template Data</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {variables.map(varName => (
            <div key={varName}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {varName.replace(/_/g, " ")}
              </label>
              <input
                type={varName.includes("date") ? "date" : "text"}
                value={formData[varName] || ""}
                onChange={e => handleChange(varName, e.target.value)}
                placeholder={`Enter ${varName.replace(/_/g, " ")}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={isPending}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              "Generate PDF"
            )}
          </button>
        </form>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Preview</h2>
        <div
          className="border border-gray-300 rounded-lg p-6 bg-white overflow-auto max-h-[600px]"
          dangerouslySetInnerHTML={{
            __html: Object.keys(formData).reduce(
              (html, key) =>
                html.replace(
                  new RegExp(`\\{\\{${key}\\}\\}`, "g"),
                  formData[key] || `{{${key}}}`
                ),
              template.content
            ),
          }}
        />
      </div>
    </div>
  );
}
