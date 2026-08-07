export const satFacturaWorkflowEn = {
  "satFacturas.action.copied": "Copied",
  "satFacturas.action.copy": "Copy",
  "satFacturas.action.open": "Open",
  "satFacturas.next.accountantRequested":
    "Waiting for the accountant to send the factura PDF/XML.",
  "satFacturas.next.cancelled":
    "This factura has been cancelled. No active follow-up is needed.",
  "satFacturas.next.complete":
    "Factura payment and complemento follow-up are complete.",
  "satFacturas.next.complemento":
    "Payment is recorded. Request, receive, and send the complemento de pago.",
  "satFacturas.next.issued":
    "Send the factura PDF/XML to the venue or client contact.",
  "satFacturas.next.partiallyPaid":
    "Payment is partially applied. Follow up on the remaining balance before closing.",
  "satFacturas.next.pending":
    "Review fiscal data, confirm amount calculations, then request the factura from the accountant.",
  "satFacturas.next.sentToVenue":
    "Waiting for payment from the venue or client.",
  "satFacturas.next.title": "Next Step",
  "satFacturas.quick.error": "We could not update this step.",
  "satFacturas.quick.markSent": "Mark sent to venue",
  "satFacturas.quick.requestAccountant": "Mark requested from accountant",
  "satFacturas.quick.requestComplemento": "Request complemento",
  "satFacturas.quick.receivedComplemento": "Mark complemento received",
  "satFacturas.quick.sentComplemento": "Mark complemento sent",
  "satFacturas.quick.success": "Step updated.",
  "satFacturas.quick.title": "Quick Actions",
} as const;

export type SatFacturaWorkflowTranslationKey = keyof typeof satFacturaWorkflowEn;

export const satFacturaWorkflowEs: Record<SatFacturaWorkflowTranslationKey, string> = {
  "satFacturas.action.copied": "Copiado",
  "satFacturas.action.copy": "Copiar",
  "satFacturas.action.open": "Abrir",
  "satFacturas.next.accountantRequested":
    "En espera de que el contador envíe el PDF/XML de la factura.",
  "satFacturas.next.cancelled":
    "Esta factura fue cancelada. No requiere seguimiento activo.",
  "satFacturas.next.complete":
    "El pago de la factura y el seguimiento del complemento están completos.",
  "satFacturas.next.complemento":
    "El pago está registrado. Solicita, recibe y envía el complemento de pago.",
  "satFacturas.next.issued":
    "Envía el PDF/XML de la factura al contacto del venue o cliente.",
  "satFacturas.next.partiallyPaid":
    "El pago está aplicado parcialmente. Da seguimiento al saldo pendiente antes de cerrar.",
  "satFacturas.next.pending":
    "Revisa datos fiscales, confirma cálculos de montos y solicita la factura al contador.",
  "satFacturas.next.sentToVenue":
    "En espera del pago del venue o cliente.",
  "satFacturas.next.title": "Siguiente paso",
  "satFacturas.quick.error": "No pudimos actualizar este paso.",
  "satFacturas.quick.markSent": "Marcar enviada al venue",
  "satFacturas.quick.requestAccountant": "Marcar solicitada al contador",
  "satFacturas.quick.requestComplemento": "Solicitar complemento",
  "satFacturas.quick.receivedComplemento": "Marcar complemento recibido",
  "satFacturas.quick.sentComplemento": "Marcar complemento enviado",
  "satFacturas.quick.success": "Paso actualizado.",
  "satFacturas.quick.title": "Acciones rápidas",
};
