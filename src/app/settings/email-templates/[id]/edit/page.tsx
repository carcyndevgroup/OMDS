import { EmailTemplateEdit } from "@/features/settings/email-template";

type EditEmailTemplatePageProps = { params: Promise<{ id: string }> };

export default async function EditEmailTemplatePage(props: EditEmailTemplatePageProps) {
  const params = await props.params;
  return <EmailTemplateEdit id={params.id} />;
}
