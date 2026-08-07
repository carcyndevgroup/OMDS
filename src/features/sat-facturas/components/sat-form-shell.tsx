"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type SatFormShellProps = {
  backHref?: string;
  children: ReactNode;
  subtitle: string;
  title: string;
};

export function SatFormShell({
  backHref = "/sat-facturas",
  children,
  subtitle,
  title,
}: SatFormShellProps) {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <Link className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-cyan-200" href={backHref}>
            <ArrowLeft aria-hidden="true" size={18} />
            {subtitle}
          </Link>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{title}</h1>
        </header>
        {children}
      </div>
    </main>
  );
}
