import { AppShell } from "@/components/layout/app-shell";
import { ModulePlaceholderPage } from "@/components/layout/module-placeholder-page";

export default function TasksPage() {
  return (
    <AppShell>
      <ModulePlaceholderPage
        descriptionKey="placeholder.tasks"
        titleKey="nav.tasks"
      />
    </AppShell>
  );
}
