"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTemplate, updateTemplate } from "@/actions/template";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("./rich-text-editor"), {
  ssr: false,
});
import { Template } from "@/generated/prisma";

export default function TemplateEditor({ template }: { template?: Template }) {
  const [name, setName] = useState(template?.name || "");
  const [content, setContent] = useState(template?.content || "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !content) {
      alert("Please fill in all fields");
      return;
    }

    startTransition(async () => {
      try {
        if (template) {
          await updateTemplate(template.id, { name, content });
          router.push(`/legal-forms/${template.id}`);
        } else {
          await createTemplate({ name, content });
          router.push("/legal-forms");
        }
      } catch (error) {
        alert(`Failed to ${template ? "update" : "create"} template`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Affidavit of Loss"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Form Content
            </label>
          </div>
          <RichTextEditor onChange={setContent} initialContent={content} />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          {isPending
            ? `${template ? "Updating" : "Creating"}...`
            : `${template ? "Update" : "Create"} Template`}
        </button>
      </div>
    </form>
  );
}
