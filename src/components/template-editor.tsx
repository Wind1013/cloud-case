"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTemplate, updateTemplate } from "@/actions/template";
import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Template } from "@/generated/prisma";

const RichTextEditor = dynamic(() => import("./rich-text-editor"), {
  ssr: false,
});

export default function TemplateEditor({ template }: { template?: Template }) {
  const [name, setName] = useState(template?.name || "");
  const [content, setContent] = useState(template?.content || "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Margin states
  const [marginTop, setMarginTop] = useState(template?.marginTop || 0);
  const [marginRight, setMarginRight] = useState(template?.marginRight || 0);
  const [marginBottom, setMarginBottom] = useState(
    template?.marginBottom || 0
  );
  const [marginLeft, setMarginLeft] = useState(template?.marginLeft || 0);
  const [allMargins, setAllMargins] = useState("");

  const handleAllMarginsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAllMargins(value);
    const floatValue = parseFloat(value);
    if (!isNaN(floatValue)) {
      setMarginTop(floatValue);
      setMarginRight(floatValue);
      setMarginBottom(floatValue);
      setMarginLeft(floatValue);
    }
  };

  const handleMarginChange = (
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setAllMargins("");
    setter(parseFloat(e.target.value) || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !name.trim()) {
      alert("Please enter a template name");
      return;
    }

    if (!content || !content.trim()) {
      alert("Please add content to the template");
      return;
    }

    // Check if content is valid JSON (Lexical editor state)
    try {
      const parsed = JSON.parse(content);
      // Check if the editor state has actual content (not just empty paragraphs)
      if (parsed?.root?.children) {
        const hasContent = parsed.root.children.some((child: any) => {
          if (child.type === "paragraph" && child.children) {
            return child.children.some((textNode: any) => 
              textNode.text && textNode.text.trim()
            );
          }
          return child.text && child.text.trim();
        });
        if (!hasContent) {
          alert("Please add some content to the template");
          return;
        }
      }
    } catch (jsonError) {
      alert("Invalid content format. Please try refreshing the page.");
      console.error("Invalid JSON content:", jsonError);
      return;
    }

    const data = {
      name: name.trim(),
      content,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
    };

    startTransition(async () => {
      try {
        console.log("Submitting template data:", { 
          name: data.name, 
          hasContent: !!data.content,
          contentLength: data.content?.length 
        });
        
        if (template) {
          const result = await updateTemplate(template.id, data);
          console.log("Update result:", result);
          if (result?.error) {
            alert(`Failed to update template: ${result.error}`);
            return;
          }
          if (result?.success) {
            router.push(`/legal-forms/${template.id}`);
          }
        } else {
          const result = await createTemplate(data);
          console.log("Create result:", result);
          if (result?.error) {
            alert(`Failed to create template: ${result.error}`);
            return;
          }
          if (result?.success) {
            router.push("/legal-forms");
          } else {
            alert("Failed to create template: Unknown error");
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Template submission error:", error);
        alert(`Failed to ${template ? "update" : "create"} template: ${errorMessage}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <Label htmlFor="templateName" className="font-medium">
            Template Name
          </Label>
          <Input
            id="templateName"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Affidavit of Loss"
            required
          />
        </div>

        {/* Margin Controls */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 items-end">
          <div>
            <Label htmlFor="allMargins">All Margins (in)</Label>
            <Input
              id="allMargins"
              type="number"
              value={allMargins}
              onChange={handleAllMarginsChange}
              placeholder="e.g., 1"
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="marginTop">Top (in)</Label>
            <Input
              id="marginTop"
              type="number"
              value={marginTop}
              onChange={handleMarginChange(setMarginTop)}
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="marginRight">Right (in)</Label>
            <Input
              id="marginRight"
              type="number"
              value={marginRight}
              onChange={handleMarginChange(setMarginRight)}
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="marginBottom">Bottom (in)</Label>
            <Input
              id="marginBottom"
              type="number"
              value={marginBottom}
              onChange={handleMarginChange(setMarginBottom)}
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="marginLeft">Left (in)</Label>
            <Input
              id="marginLeft"
              type="number"
              value={marginLeft}
              onChange={handleMarginChange(setMarginLeft)}
              step="0.1"
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Form Content
            </label>
          </div>
          <RichTextEditor
            onChange={setContent}
            initialContent={content}
            marginTop={marginTop}
            marginRight={marginRight}
            marginBottom={marginBottom}
            marginLeft={marginLeft}
          />
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
