import { getTemplate } from "@/actions/template";
import TemplateEditor from "@/components/template-editor";

export default async function EditTemplatePage({ 
    params 
}: {
    params: { id: string };
}) {
  const template = await getTemplate(params.id);

  if (!template) {
    return <div>Template not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Edit Template</h1>
      <TemplateEditor template={template} />
    </div>
  );
}
