import { AppShell } from "@/components/layout/app-shell";
import { ModulePlaceholderPage } from "@/components/layout/module-placeholder-page";

export default function ReportsPage() {
  return (
    <AppShell>
      <ModulePlaceholderPage
        descriptionKey="placeholder.reports"
        titleKey="nav.reports"
      />
    </AppShell>
  );
}
