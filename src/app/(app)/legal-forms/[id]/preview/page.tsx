import { getTemplate } from "@/actions/template";
import PreviewClient from "./preview-client";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getTemplate(id);

  if (!template) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Template not found</h1>
          <p className="text-muted-foreground">The template you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <PreviewClient template={template} />;
}

