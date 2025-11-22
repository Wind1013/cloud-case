"use client";

import { Template } from "@/generated/prisma";
import { useState } from "react";

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
        },
        body: JSON.stringify({ templateId: template.id, data: formData }),
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
      alert("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!template) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Use Template: {template.name}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {isGenerating ? "Generating..." : "Generate PDF"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
