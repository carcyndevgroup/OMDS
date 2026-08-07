import { AppShell } from "@/components/layout/app-shell";
import { ModulePlaceholderPage } from "@/components/layout/module-placeholder-page";

export default function FinancialsPage() {
  return (
    <AppShell>
      <ModulePlaceholderPage
        descriptionKey="placeholder.financials"
        titleKey="nav.financials"
      />
    </AppShell>
  );
}
