"use client";

import {
  ArrowUpRight,
  Building2,
  CreditCard,
  ClipboardList,
  FileText,
  Mail,
  MessageSquare,
  Package,
  ReceiptText,
  PenLine,
  Tag,
  Truck,
  WalletCards,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";

export function SettingsHome() {
  const { t } = useTranslation();
  const cards = [
    {
      href: "/settings/equipment",
      icon: Package,
      subtitleKey: "settings.equipment.card.subtitle",
      titleKey: "settings.equipment.card.title",
    },
    {
      href: "/settings/products",
      icon: Tag,
      subtitleKey: "settings.product.card.subtitle",
      titleKey: "settings.product.card.title",
    },
    {
      href: "/settings/expenses",
      icon: ReceiptText,
      subtitleKey: "settings.expense.card.subtitle",
      titleKey: "settings.expense.card.title",
    },
    {
      href: "/settings/payroll-tasks",
      icon: WalletCards,
      subtitleKey: "settings.payrollTask.card.subtitle",
      titleKey: "settings.payrollTask.card.title",
    },
    {
      href: "/settings/travel",
      icon: Truck,
      subtitleKey: "settings.travel.card.subtitle",
      titleKey: "settings.travel.card.title",
    },
    {
      href: "/settings/payment-plans",
      icon: CreditCard,
      subtitleKey: "settings.paymentPlan.card.subtitle",
      titleKey: "settings.paymentPlan.card.title",
    },
    {
      href: "/settings/questionnaire-templates",
      icon: ClipboardList,
      subtitleKey: "settings.questionnaireTemplate.card.subtitle",
      titleKey: "settings.questionnaireTemplate.card.title",
    },
    {
      href: "/settings/contract-templates",
      icon: FileText,
      subtitleKey: "settings.contractTemplate.card.subtitle",
      titleKey: "settings.contractTemplate.card.title",
    },
    {
      href: "/settings/email-templates",
      icon: Mail,
      subtitleKey: "settings.emailTemplate.card.subtitle",
      titleKey: "settings.emailTemplate.card.title",
    },
    {
      href: "/settings/message-connections",
      icon: MessageSquare,
      subtitleKey: "settings.messages.card.subtitle",
      titleKey: "settings.messages.card.title",
    },
    {
      href: "/settings/company-profile",
      icon: Building2,
      subtitleKey: "settings.companyProfile.card.subtitle",
      titleKey: "settings.companyProfile.card.title",
    },
    {
      href: "/settings/signing-profile",
      icon: PenLine,
      subtitleKey: "settings.signingProfile.card.subtitle",
      titleKey: "settings.signingProfile.card.title",
    },
    {
      href: "/settings/data-cleanup",
      icon: Trash2,
      subtitleKey: "settings.dataCleanup.subtitle",
      titleKey: "settings.dataCleanup.title",
    },
  ] as const;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header>
          <h1 className="text-3xl font-bold sm:text-4xl">
            {t("settings.title")}
          </h1>
          <p className="mt-2 text-base font-medium text-zinc-500">
            {t("settings.subtitle")}
          </p>
        </header>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link className="group min-h-44 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 transition hover:border-cyan-300/40" href={card.href} key={card.href}>
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-md bg-cyan-300/15 text-cyan-200">
                    <Icon aria-hidden="true" size={24} />
                  </span>
                  <ArrowUpRight className="text-zinc-600 transition group-hover:text-cyan-200" size={28} />
                </div>
                <h2 className="mt-7 text-xl font-bold">
                  {t(card.titleKey)}
                </h2>
                <p className="mt-3 text-sm font-medium leading-6 text-zinc-500">
                  {t(card.subtitleKey)}
                </p>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
