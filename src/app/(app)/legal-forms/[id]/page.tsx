import { getTemplate } from "@/actions/template";
import { lexicalToHtml } from "@/lib/lexical";
import Link from "next/link";
import PreviewButton from "./preview-button";
import { buttonVariants } from "@/components/ui/button";

export default async function ViewTemplatePage({
  params,
}: {
  params: { id: string };
}) {
  const template = await getTemplate(params.id);

  if (!template) {
    return <div>Template not found</div>;
  }

  const htmlContent = lexicalToHtml(template.content);

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
        <h2 className="text-xl font-bold mb-4">Form Content</h2>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
}
