import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type ProductPageHeaderProps = {
  backHref?: string;
  backLabel: string;
  title: string;
};

export function ProductPageHeader({
  backHref = "/settings/products",
  backLabel,
  title,
}: ProductPageHeaderProps) {
  return (
    <header className="flex items-center gap-4">
      <Link className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-400 hover:bg-white/[0.05] hover:text-white" href={backHref}>
        <ArrowLeft aria-label={backLabel} size={22} />
      </Link>
      <h1 className="text-3xl font-black text-white sm:text-4xl">{title}</h1>
    </header>
  );
}
