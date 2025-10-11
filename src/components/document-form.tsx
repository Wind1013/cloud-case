"use client";

import { generatePDF } from "@/actions/template";
import { Template } from "@/generated/prisma";
import { useState, useTransition } from "react";

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
        const result = await generatePDF(template.id, formData);

        // Convert base64 to blob and trigger download
        const byteCharacters = atob(result.pdf);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        alert("Failed to generate PDF");
      }
    });
  };

  const variables = template.variables as string[];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isPending ? "Generating PDF..." : "Generate PDF"}
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
