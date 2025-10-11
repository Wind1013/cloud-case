import TemplateEditor from "@/components/template-editor";

export default function CreateTemplatePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Create New Template</h1>
      <TemplateEditor />
    </div>
  );
}
