import { AppShell } from "@/components/layout/app-shell";
import { DashboardHome } from "@/features/dashboard/components/dashboard-home";

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardHome />
    </AppShell>
  );
}
