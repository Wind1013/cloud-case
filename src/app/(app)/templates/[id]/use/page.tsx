import React from "react";
import UseTemplatePage from "./template-page";
import { getTemplate } from "@/actions/template";

type TemplatePageProps = {
  params: Promise<{ id: string }>;
};

const page = async ({ params }: TemplatePageProps) => {
  const { id } = await params;
  const template = await getTemplate(id);
  return <UseTemplatePage template={template} />;
};

export default page;
