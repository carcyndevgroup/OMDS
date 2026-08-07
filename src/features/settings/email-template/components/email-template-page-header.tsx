import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type EmailTemplatePageHeaderProps = {
  backHref?: string;
  backLabel: string;
  title: string;
};

export function EmailTemplatePageHeader({ backHref = "/settings/email-templates", backLabel, title }: EmailTemplatePageHeaderProps) {
  return (
    <header className="flex items-center gap-3">
      <Link className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-400 hover:bg-white/[0.05] hover:text-white" href={backHref}>
        <ArrowLeft aria-hidden="true" size={21} />
        <span className="sr-only">{backLabel}</span>
      </Link>
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
    </header>
  );
}
