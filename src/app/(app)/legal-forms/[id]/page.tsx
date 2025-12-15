import { getTemplate } from "@/actions/template";
import TemplateViewClient from "./template-view-client";

export default async function ViewTemplatePage({
  params,
}: {
  params: { id: string };
}) {
  const template = await getTemplate(params.id);

  if (!template) {
    return <div>Template not found</div>;
  }

  return <TemplateViewClient template={template} />;
}
