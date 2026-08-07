"use client";

import {
  CalendarCheck,
  FileCheck2,
  UserRoundPlus,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";

import type { DashboardSummary } from "../types/dashboard";

type SummaryCardsProps = {
  hasError: boolean;
  isLoading: boolean;
  summary: DashboardSummary | null;
  t: ReturnType<typeof useTranslation>["t"];
};

export function DashboardSummaryCards(props: SummaryCardsProps) {
  const { hasError, isLoading, summary, t } = props;
  const cards = [
    {
      href: "/crm/leads",
      icon: UserRoundPlus,
      label: t("dashboard.summary.activeLeads"),
      value: summary?.activeLeads ?? 0,
      hint: t("dashboard.summary.activeLeadsHint"),
    },
    {
      href: "/crm/clients",
      icon: UsersRound,
      label: t("dashboard.summary.activeBookings"),
      value: summary?.activeBookings ?? 0,
      hint: t("dashboard.summary.activeBookingsHint"),
    },
    {
      href: "/crm/events",
      icon: CalendarCheck,
      label: t("dashboard.summary.confirmedEvents"),
      value: summary?.confirmedEvents ?? 0,
      hint: t("dashboard.summary.confirmedEventsHint"),
    },
    {
      href: "/dashboard",
      icon: FileCheck2,
      label: t("dashboard.summary.pendingQuestionnaires"),
      value: summary?.pendingQuestionnaires ?? 0,
      hint: t("dashboard.summary.pendingQuestionnairesHint"),
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <SummaryCard
          {...card}
          isDimmed={hasError}
          isLoading={isLoading}
          key={card.label}
        />
      ))}
    </section>
  );
}

function SummaryCard(props: {
  hint: string;
  href: string;
  icon: LucideIcon;
  isDimmed: boolean;
  isLoading: boolean;
  label: string;
  value: number;
}) {
  const Icon = props.icon;

  return (
    <Link
      className="rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 transition hover:border-cyan-300/40"
      href={props.href}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-300/15 text-cyan-200">
          <Icon aria-hidden="true" size={21} />
        </span>
        {props.isLoading ? (
          <span className="mt-2 h-8 w-12 animate-pulse rounded bg-zinc-800" />
        ) : (
          <span className="text-3xl font-black text-white">
            {props.isDimmed ? 0 : props.value}
          </span>
        )}
      </div>
      <p className="mt-5 font-bold text-zinc-100">{props.label}</p>
      <p className="mt-2 text-sm font-medium text-zinc-500">{props.hint}</p>
    </Link>
  );
}
