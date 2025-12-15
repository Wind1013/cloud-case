"use client";

import { useEffect, useState } from "react";
import { lexicalToHtml } from "@/lib/lexical-client";
import { Template } from "@/generated/prisma";
import Link from "next/link";
import PreviewButton from "./preview-button";
import { buttonVariants } from "@/components/ui/button";

export default function TemplateViewClient({ template }: { template: Template }) {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function convertContent() {
      try {
        const html = await lexicalToHtml(template.content);
        setHtmlContent(html);
      } catch (error) {
        console.error("Error converting template content:", error);
        setHtmlContent("<p>Error loading template content</p>");
      } finally {
        setIsLoading(false);
      }
    }
    convertContent();
  }, [template.content]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{template.name}</h1>
        <div className="flex gap-4">
          <PreviewButton templateId={template.id} />
          <Link
            href={`/legal-forms/${template.id}/use`}
            className={buttonVariants()}
          >
            Use Form
          </Link>
          <Link
            href={`/legal-forms/${template.id}/edit`}
            className={buttonVariants()}
          >
            Edit Form
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{
            paddingTop: `${template.marginTop}in`,
            paddingRight: `${template.marginRight}in`,
            paddingBottom: `${template.marginBottom}in`,
            paddingLeft: `${template.marginLeft}in`,
          }}
        />
      </div>
    </div>
  );
}

