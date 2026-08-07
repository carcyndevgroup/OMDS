import {
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  ChartColumn,
  CircleDollarSign,
  ContactRound,
  LayoutDashboard,
  ListChecks,
  MapPinned,
  MessageSquare,
  ReceiptText,
  Settings,
  UserPlus,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import type { TranslationKey } from "@/core/i18n";

export type SidebarNavItem = {
  href: string;
  icon: LucideIcon;
  labelKey: TranslationKey;
};

export const sidebarNavigation: SidebarNavItem[][] = [
  [
    { href: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  ],
  [
    { href: "/crm/leads", icon: UserPlus, labelKey: "nav.leads" },
    { href: "/crm/clients", icon: Users, labelKey: "nav.clients" },
    { href: "/crm/planners", icon: ContactRound, labelKey: "nav.planners" },
    { href: "/crm/venues", icon: MapPinned, labelKey: "nav.venues" },
  ],
  [
    { href: "/events", icon: CalendarClock, labelKey: "nav.events" },
    { href: "/calendar", icon: CalendarDays, labelKey: "nav.calendar" },
    { href: "/crm/staff", icon: BriefcaseBusiness, labelKey: "nav.staffing" },
    { href: "/payroll", icon: WalletCards, labelKey: "nav.payroll" },
    { href: "/financials", icon: CircleDollarSign, labelKey: "nav.financials" },
    { href: "/sat-facturas", icon: ReceiptText, labelKey: "nav.satFacturas" },
  ],
  [
    { href: "/messages", icon: MessageSquare, labelKey: "nav.messages" },
    { href: "/tasks", icon: ListChecks, labelKey: "nav.tasks" },
  ],
  [
    { href: "/reports", icon: ChartColumn, labelKey: "nav.reports" },
  ],
  [
    { href: "/settings", icon: Settings, labelKey: "nav.settings" },
  ],
];
