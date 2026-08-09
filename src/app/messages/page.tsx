import { Suspense } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { MessageInbox } from "@/features/messages/components/message-inbox";

export default function MessagesPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <MessageInbox />
      </Suspense>
    </AppShell>
  );
}
