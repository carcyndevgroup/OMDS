export const contractEn = {
  "crm.contract.action.create": "Create Contract",
  "crm.contract.action.markSigned": "Mark Signed",
  "crm.contract.action.send": "Mark Sent",
  "crm.contract.action.void": "Void",
  "crm.contract.defaultTitle": "Service Contract",
  "crm.contract.empty": "No contracts have been created for this booking.",
  "crm.contract.loadError": "We could not load contracts.",
  "crm.contract.loading": "Loading contracts...",
  "crm.contract.status.draft": "Draft",
  "crm.contract.status.sent": "Sent",
  "crm.contract.status.signed": "Signed",
  "crm.contract.status.void": "Void",
  "crm.contract.title": "Contracts",
} as const;

export type ContractTranslationKey = keyof typeof contractEn;

export const contractEs = {
  "crm.contract.action.create": "Crear Contrato",
  "crm.contract.action.markSigned": "Marcar Firmado",
  "crm.contract.action.send": "Marcar Enviado",
  "crm.contract.action.void": "Anular",
  "crm.contract.defaultTitle": "Contrato de Servicio",
  "crm.contract.empty": "No se han creado contratos para esta reservación.",
  "crm.contract.loadError": "No pudimos cargar los contratos.",
  "crm.contract.loading": "Cargando contratos...",
  "crm.contract.status.draft": "Borrador",
  "crm.contract.status.sent": "Enviado",
  "crm.contract.status.signed": "Firmado",
  "crm.contract.status.void": "Anulado",
  "crm.contract.title": "Contratos",
} satisfies Record<ContractTranslationKey, string>;
