import type { Locale } from "@/core/i18n";
import type { Json } from "@/core/supabase/json.types";

export type LocalizedText = {
  en: string;
  es: string;
};

export type QuestionnaireDefinitionQuestion = {
  fieldKey: string;
  helper: LocalizedText;
  label: LocalizedText;
  required: boolean;
  type: string;
};

export type QuestionnaireDefinitionSection = {
  description: LocalizedText;
  questions: QuestionnaireDefinitionQuestion[];
  title: LocalizedText;
};

export type QuestionnaireDefinitionModel = {
  sections: QuestionnaireDefinitionSection[];
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const emptyLocalizedText = (fallback = ""): LocalizedText => ({
  en: fallback,
  es: fallback,
});

const readLocalizedText = (value: unknown, fallback = ""): LocalizedText => {
  if (typeof value === "string") return { en: value, es: value };
  if (!isRecord(value)) return emptyLocalizedText(fallback);

  const en = typeof value.en === "string" ? value.en : fallback;
  const es = typeof value.es === "string" ? value.es : en || fallback;
  return { en, es };
};

export const createLocalizedText = (fallback = ""): LocalizedText => emptyLocalizedText(fallback);

export const createBilingualQuestionnaireDefinition = (): QuestionnaireDefinitionModel => ({
  sections: [
    {
      description: {
        en: "Client details and contact fields.",
        es: "Datos del cliente y campos de contacto.",
      },
      questions: [
        {
          fieldKey: "client.legalFirstName",
          helper: emptyLocalizedText(),
          label: {
            en: "Legal First Name",
            es: "Nombre Legal",
          },
          required: true,
          type: "text",
        },
        {
          fieldKey: "client.legalLastName",
          helper: emptyLocalizedText(),
          label: {
            en: "Legal Last Name",
            es: "Apellido Legal",
          },
          required: true,
          type: "text",
        },
        {
          fieldKey: "client.address",
          helper: emptyLocalizedText(),
          label: {
            en: "Address",
            es: "Dirección",
          },
          required: false,
          type: "textarea",
        },
        {
          fieldKey: "client.phone",
          helper: emptyLocalizedText(),
          label: {
            en: "Phone",
            es: "Teléfono",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "client.instagram",
          helper: emptyLocalizedText(),
          label: {
            en: "Instagram",
            es: "Instagram",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "client.facebook",
          helper: emptyLocalizedText(),
          label: {
            en: "Facebook",
            es: "Facebook",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "client.preferredCommunicationMethod",
          helper: emptyLocalizedText(),
          label: {
            en: "Preferred Communication",
            es: "Comunicación Preferida",
          },
          required: false,
          type: "select",
        },
        {
          fieldKey: "client.additionalClients",
          helper: emptyLocalizedText(),
          label: {
            en: "Additional Clients",
            es: "Clientes Adicionales",
          },
          required: false,
          type: "repeatable",
        },
      ],
      title: {
        en: "Client",
        es: "Cliente",
      },
    },
    {
      description: {
        en: "Event timing and service details.",
        es: "Horario y detalles del servicio.",
      },
      questions: [
        {
          fieldKey: "event.eventName",
          helper: emptyLocalizedText(),
          label: {
            en: "Event Name",
            es: "Nombre del Evento",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "event.serviceStartTime",
          helper: emptyLocalizedText(),
          label: {
            en: "Service Start Time",
            es: "Hora de Inicio del Servicio",
          },
          required: false,
          type: "time",
        },
        {
          fieldKey: "event.serviceEndTime",
          helper: emptyLocalizedText(),
          label: {
            en: "Service End Time",
            es: "Hora de Fin del Servicio",
          },
          required: false,
          type: "time",
        },
        {
          fieldKey: "event.marqueeNames",
          helper: emptyLocalizedText(),
          label: {
            en: "Marquee Names",
            es: "Nombres para Marquee",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "event.eventHashtags",
          helper: emptyLocalizedText(),
          label: {
            en: "Event Hashtags",
            es: "Hashtags del Evento",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "event.serviceLocationDescription",
          helper: emptyLocalizedText(),
          label: {
            en: "Service Location",
            es: "Ubicación del Servicio",
          },
          required: false,
          type: "textarea",
        },
      ],
      title: {
        en: "Event",
        es: "Evento",
      },
    },
    {
      description: {
        en: "Venue and contact coordination.",
        es: "Coordinación de venue y contacto.",
      },
      questions: [
        {
          fieldKey: "venue.name",
          helper: emptyLocalizedText(),
          label: {
            en: "Venue Name",
            es: "Nombre del Venue",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "venue.address",
          helper: emptyLocalizedText(),
          label: {
            en: "Venue Address",
            es: "Dirección del Venue",
          },
          required: false,
          type: "textarea",
        },
        {
          fieldKey: "venue.assignedContact.name",
          helper: emptyLocalizedText(),
          label: {
            en: "Contact Name",
            es: "Nombre del Contacto",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "venue.assignedContact.role",
          helper: emptyLocalizedText(),
          label: {
            en: "Contact Role",
            es: "Rol del Contacto",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "venue.assignedContact.phone",
          helper: emptyLocalizedText(),
          label: {
            en: "Contact Phone",
            es: "Teléfono del Contacto",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "venue.assignedContact.email",
          helper: emptyLocalizedText(),
          label: {
            en: "Contact Email",
            es: "Correo del Contacto",
          },
          required: false,
          type: "email",
        },
        {
          fieldKey: "venue.powerSupplyAccess",
          helper: emptyLocalizedText(),
          label: {
            en: "Power Supply",
            es: "Acceso a Corriente",
          },
          required: false,
          type: "select",
        },
        {
          fieldKey: "venue.powerSupplyNotes",
          helper: emptyLocalizedText(),
          label: {
            en: "Power Notes",
            es: "Notas de Corriente",
          },
          required: false,
          type: "textarea",
        },
      ],
      title: {
        en: "Venue",
        es: "Venue",
      },
    },
    {
      description: {
        en: "Primary planner details.",
        es: "Datos del planner principal.",
      },
      questions: [
        {
          fieldKey: "planner.company",
          helper: emptyLocalizedText(),
          label: {
            en: "Company",
            es: "Empresa",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "planner.firstName",
          helper: emptyLocalizedText(),
          label: {
            en: "First Name",
            es: "Nombre",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "planner.lastName",
          helper: emptyLocalizedText(),
          label: {
            en: "Last Name",
            es: "Apellido",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "planner.phone",
          helper: emptyLocalizedText(),
          label: {
            en: "Phone",
            es: "Teléfono",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "planner.email",
          helper: emptyLocalizedText(),
          label: {
            en: "Email",
            es: "Correo",
          },
          required: false,
          type: "email",
        },
        {
          fieldKey: "planner.instagram",
          helper: emptyLocalizedText(),
          label: {
            en: "Instagram",
            es: "Instagram",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "planner.facebook",
          helper: emptyLocalizedText(),
          label: {
            en: "Facebook",
            es: "Facebook",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "planner.primaryEventContact",
          helper: emptyLocalizedText(),
          label: {
            en: "Primary Contact",
            es: "Contacto Principal",
          },
          required: false,
          type: "select",
        },
      ],
      title: {
        en: "Planner",
        es: "Planner",
      },
    },
    {
      description: {
        en: "Day-of coordinator details.",
        es: "Datos del coordinador del evento.",
      },
      questions: [
        {
          fieldKey: "coordinator.company",
          helper: emptyLocalizedText(),
          label: {
            en: "Company",
            es: "Empresa",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "coordinator.firstName",
          helper: emptyLocalizedText(),
          label: {
            en: "First Name",
            es: "Nombre",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "coordinator.lastName",
          helper: emptyLocalizedText(),
          label: {
            en: "Last Name",
            es: "Apellido",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "coordinator.phone",
          helper: emptyLocalizedText(),
          label: {
            en: "Phone",
            es: "Teléfono",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "coordinator.email",
          helper: emptyLocalizedText(),
          label: {
            en: "Email",
            es: "Correo",
          },
          required: false,
          type: "email",
        },
        {
          fieldKey: "coordinator.instagram",
          helper: emptyLocalizedText(),
          label: {
            en: "Instagram",
            es: "Instagram",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "coordinator.facebook",
          helper: emptyLocalizedText(),
          label: {
            en: "Facebook",
            es: "Facebook",
          },
          required: false,
          type: "text",
        },
        {
          fieldKey: "coordinator.primaryEventContact",
          helper: emptyLocalizedText(),
          label: {
            en: "Primary Contact",
            es: "Contacto Principal",
          },
          required: false,
          type: "select",
        },
      ],
      title: {
        en: "Coordinator",
        es: "Coordinador",
      },
    },
    {
      description: {
        en: "Additional booking notes.",
        es: "Notas adicionales de la reserva.",
      },
      questions: [
        {
          fieldKey: "additional.specialRequests",
          helper: emptyLocalizedText(),
          label: {
            en: "Special Requests",
            es: "Solicitudes Especiales",
          },
          required: false,
          type: "textarea",
        },
        {
          fieldKey: "additional.secondaryContacts",
          helper: {
            en: "Name & Role",
            es: "Nombre y rol",
          },
          label: {
            en: "Secondary Contact",
            es: "Contacto Secundario",
          },
          required: false,
          type: "repeatable",
        },
        {
          fieldKey: "additional.operationalNotes",
          helper: emptyLocalizedText(),
          label: {
            en: "Operational Notes",
            es: "Notas Operativas",
          },
          required: false,
          type: "textarea",
        },
      ],
      title: {
        en: "Additional",
        es: "Adicional",
      },
    },
  ],
});

export const createQuestionnaireQuestion = (): QuestionnaireDefinitionQuestion => ({
  fieldKey: "client.legalFirstName",
  helper: emptyLocalizedText(),
  label: emptyLocalizedText(),
  required: false,
  type: "text",
});

export const createQuestionnaireSection = (): QuestionnaireDefinitionSection => ({
  description: emptyLocalizedText(),
  questions: [createQuestionnaireQuestion()],
  title: emptyLocalizedText(),
});

export const parseQuestionnaireDefinition = (
  value: string | Json | null | undefined,
): QuestionnaireDefinitionModel | null => {
  try {
    const parsed = typeof value === "string" ? (JSON.parse(value) as Json) : value;
    if (!isRecord(parsed) || !Array.isArray(parsed.sections)) return null;

    return {
      sections: parsed.sections.map((section) => ({
        description: readLocalizedText((section as UnknownRecord)?.description),
        questions: Array.isArray((section as UnknownRecord)?.questions)
          ? ((section as UnknownRecord).questions as unknown[]).map((question) => {
              const questionRecord = isRecord(question) ? question : {};

              return {
                fieldKey:
                  typeof questionRecord.fieldKey === "string"
                    ? questionRecord.fieldKey
                    : "client.legalFirstName",
                helper: readLocalizedText(questionRecord.helper),
                label: readLocalizedText(questionRecord.label),
                required: Boolean(questionRecord.required),
                type:
                  typeof questionRecord.type === "string"
                    ? questionRecord.type
                    : "text",
              };
            })
          : [],
        title: readLocalizedText((section as UnknownRecord)?.title),
      })),
    };
  } catch {
    return null;
  }
};

export const resolveLocalizedText = (
  value: string | LocalizedText | undefined,
  locale: Locale,
) => {
  if (typeof value === "string") return value;
  if (!value) return "";
  return value[locale] || value.en || value.es || "";
};