import { EmailTemplateEdit } from "@/features/settings/email-template";

type EditEmailTemplatePageProps = { params: { id: string } };

export default function EditEmailTemplatePage({ params }: EditEmailTemplatePageProps) {
  return <EmailTemplateEdit id={params.id} />;
}
