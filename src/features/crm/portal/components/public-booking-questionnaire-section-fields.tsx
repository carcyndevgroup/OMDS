import { translations, type Locale } from "@/core/i18n";
import type { Json } from "@/core/supabase/json.types";
import {
  resolveLocalizedText,
  type QuestionnaireDefinitionQuestion,
} from "@/features/settings/questionnaire-template/utils/questionnaire-definition";

import { contactRoleOptions } from "../../shared/constants/crm-options";
import type {
  AdditionalClient,
  FormValues,
  SecondaryContact,
} from "./public-booking-questionnaire-data";
import {
  AdditionalClients,
  SelectField,
  SecondaryContacts,
  TextareaField,
  TextField,
  booleanOptions,
  communicationOptions,
  yesNoOptions,
} from "./public-questionnaire-fields";
import { PublicQuestionnaireUploadField } from "./public-questionnaire-upload-field";

type QuestionnaireSectionFieldsProps = {
  accessKey: string;
  dynamicFieldValues: Record<string, Json>;
  onAddAdditionalClient: () => void;
  onAddSecondaryContact: () => void;
  onSetDynamicField: (fieldKey: string, value: Json) => void;
  onSetAdditionalClient: (index: number, field: keyof AdditionalClient, value: string) => void;
  onSetSecondaryContact: (index: number, field: keyof SecondaryContact, value: string) => void;
  onSetField: (field: keyof FormValues, value: string) => void;
  locale: Locale;
  questionPrefix: string;
  questionnaireId: string;
  questions: QuestionnaireDefinitionQuestion[];
  values: FormValues;
};

export function QuestionnaireSectionFields(props: QuestionnaireSectionFieldsProps) {
  const {
    accessKey,
    dynamicFieldValues,
    onAddAdditionalClient,
    onAddSecondaryContact,
    onSetDynamicField,
    onSetAdditionalClient,
    onSetSecondaryContact,
    locale,
    onSetField,
    questionPrefix,
    questionnaireId,
    questions,
    values,
  } = props;

  return (
    <div className="space-y-4">
      {questions.map((question) => {
        const fieldKey = question.fieldKey || `${questionPrefix}.`;
        const label = resolveLocalizedText(question.label, locale);
        const helper = resolveLocalizedText(question.helper, locale);

        if (fieldKey === "client.additionalClients") {
          return (
            <div key={fieldKey} className="space-y-3 rounded-md border border-zinc-800 p-4">
              <div>
                <h4 className="text-sm font-bold text-white">{label}</h4>
                {helper ? <p className="mt-1 text-xs text-zinc-500">{helper}</p> : null}
              </div>
              <AdditionalClients
                clients={values.additionalClients}
                onAdd={onAddAdditionalClient}
                onChange={onSetAdditionalClient}
              />
            </div>
          );
        }

        if (
          fieldKey === "additional.secondaryContact"
          || fieldKey === "additional.secondaryContacts"
        ) {
          return (
            <div key={fieldKey} className="space-y-3 rounded-md border border-zinc-800 p-4">
              <div>
                <h4 className="text-sm font-bold text-white">{label}</h4>
                {helper ? <p className="mt-1 text-xs text-zinc-500">{helper}</p> : null}
              </div>
              <SecondaryContacts
                contacts={values.secondaryContacts}
                onAdd={onAddSecondaryContact}
                onChange={onSetSecondaryContact}
              />
            </div>
          );
        }

        const rendered = renderQuestionField(
          fieldKey,
          question,
          values,
          onSetField,
          locale,
          accessKey,
          questionnaireId,
          dynamicFieldValues,
          onSetDynamicField,
        );
        return rendered ? <div key={fieldKey}>{rendered}</div> : null;
      })}
    </div>
  );
}

function renderQuestionField(
  fieldKey: string,
  question: QuestionnaireDefinitionQuestion,
  values: FormValues,
  setField: (field: keyof FormValues, value: string) => void,
  locale: Locale,
  accessKey: string,
  questionnaireId: string,
  dynamicFieldValues: Record<string, Json>,
  onSetDynamicField: (fieldKey: string, value: Json) => void,
) {
  const label = resolveLocalizedText(question.label, locale);
  const helper = resolveLocalizedText(question.helper, locale);
  const clientRoleOptions = contactRoleOptions.map((option) => ({
    label: translations[locale][option.translationKey],
    value: option.value,
  }));

  if (fieldKey === "client.legalFirstName") return <TextField helper={helper} label={label} onChange={(value) => setField("legalFirstName", value)} required={question.required} value={values.legalFirstName} />;
  if (fieldKey === "client.legalLastName") return <TextField helper={helper} label={label} onChange={(value) => setField("legalLastName", value)} required={question.required} value={values.legalLastName} />;
  if (fieldKey === "client.address") return <TextareaField label={label} onChange={(value) => setField("clientAddress", value)} required={question.required} value={values.clientAddress} />;
  if (fieldKey === "client.phone") return <TextField helper={helper} label={label} onChange={(value) => setField("phone", value)} value={values.phone} />;
  if (fieldKey === "client.instagram") return <TextField label={label} onChange={(value) => setField("instagram", value)} value={values.instagram} />;
  if (fieldKey === "client.facebook") return <TextField label={label} onChange={(value) => setField("facebook", value)} value={values.facebook} />;
  if (fieldKey === "client.role") return <SelectField label={label} onChange={(value) => setField("clientRole", value)} options={clientRoleOptions} value={values.clientRole} />;
  if (fieldKey === "client.preferredCommunicationMethod") return <SelectField label={label} onChange={(value) => setField("preferredCommunicationMethod", value)} options={communicationOptions()} value={values.preferredCommunicationMethod} />;
  if (fieldKey === "event.eventName") return <TextField helper={helper} label={label} onChange={(value) => setField("eventName", value)} value={values.eventName} />;
  if (fieldKey === "event.guestCount") return <TextField label={label} onChange={(value) => setField("guestCount", value)} type="number" value={values.guestCount} />;
  if (fieldKey === "event.serviceStartTime") return <TextField label={label} onChange={(value) => setField("serviceStartTime", value)} type="time" value={values.serviceStartTime} />;
  if (fieldKey === "event.serviceEndTime") return <TextField label={label} onChange={(value) => setField("serviceEndTime", value)} type="time" value={values.serviceEndTime} />;
  if (fieldKey === "event.marqueeNames") return <TextField helper={helper} label={label} onChange={(value) => setField("marqueeNames", value)} value={values.marqueeNames} />;
  if (fieldKey === "event.eventHashtags") return <TextField label={label} onChange={(value) => setField("eventHashtags", value)} value={values.eventHashtags} />;
  if (fieldKey === "event.serviceLocationDescription") return <TextareaField label={label} onChange={(value) => setField("serviceLocationDescription", value)} value={values.serviceLocationDescription} />;
  if (fieldKey === "venue.name") return <TextField label={label} onChange={(value) => setField("venueName", value)} value={values.venueName} />;
  if (fieldKey === "venue.address") return <TextareaField label={label} onChange={(value) => setField("venueAddress", value)} value={values.venueAddress} />;
  if (fieldKey === "venue.assignedContact.name") return <TextField label={label} onChange={(value) => setField("venueContactName", value)} value={values.venueContactName} />;
  if (fieldKey === "venue.assignedContact.role") return <TextField label={label} onChange={(value) => setField("venueContactRole", value)} value={values.venueContactRole} />;
  if (fieldKey === "venue.assignedContact.phone") return <TextField label={label} onChange={(value) => setField("venueContactPhone", value)} value={values.venueContactPhone} />;
  if (fieldKey === "venue.assignedContact.email") return <TextField label={label} onChange={(value) => setField("venueContactEmail", value)} type="email" value={values.venueContactEmail} />;
  if (fieldKey === "venue.powerSupplyAccess") return <SelectField label={label} onChange={(value) => setField("powerSupplyAccess", value)} options={yesNoOptions()} value={values.powerSupplyAccess} />;
  if (fieldKey === "venue.powerSupplyNotes") return <TextareaField label={label} onChange={(value) => setField("powerSupplyNotes", value)} value={values.powerSupplyNotes} />;
  if (fieldKey === "planner.company") return <TextField label={label} onChange={(value) => setField("plannerCompany", value)} value={values.plannerCompany} />;
  if (fieldKey === "planner.firstName") return <TextField label={label} onChange={(value) => setField("plannerFirstName", value)} value={values.plannerFirstName} />;
  if (fieldKey === "planner.lastName") return <TextField label={label} onChange={(value) => setField("plannerLastName", value)} value={values.plannerLastName} />;
  if (fieldKey === "planner.phone") return <TextField label={label} onChange={(value) => setField("plannerPhone", value)} value={values.plannerPhone} />;
  if (fieldKey === "planner.email") return <TextField label={label} onChange={(value) => setField("plannerEmail", value)} type="email" value={values.plannerEmail} />;
  if (fieldKey === "planner.instagram") return <TextField label={label} onChange={(value) => setField("plannerInstagram", value)} value={values.plannerInstagram} />;
  if (fieldKey === "planner.facebook") return <TextField label={label} onChange={(value) => setField("plannerFacebook", value)} value={values.plannerFacebook} />;
  if (fieldKey === "planner.primaryEventContact") return <SelectField label={label} onChange={(value) => setField("plannerPrimaryContact", value)} options={booleanOptions()} value={values.plannerPrimaryContact} />;
  if (fieldKey === "coordinator.company") return <TextField label={label} onChange={(value) => setField("coordinatorCompany", value)} value={values.coordinatorCompany} />;
  if (fieldKey === "coordinator.firstName") return <TextField label={label} onChange={(value) => setField("coordinatorFirstName", value)} value={values.coordinatorFirstName} />;
  if (fieldKey === "coordinator.lastName") return <TextField label={label} onChange={(value) => setField("coordinatorLastName", value)} value={values.coordinatorLastName} />;
  if (fieldKey === "coordinator.phone") return <TextField label={label} onChange={(value) => setField("coordinatorPhone", value)} value={values.coordinatorPhone} />;
  if (fieldKey === "coordinator.email") return <TextField label={label} onChange={(value) => setField("coordinatorEmail", value)} type="email" value={values.coordinatorEmail} />;
  if (fieldKey === "coordinator.instagram") return <TextField label={label} onChange={(value) => setField("coordinatorInstagram", value)} value={values.coordinatorInstagram} />;
  if (fieldKey === "coordinator.facebook") return <TextField label={label} onChange={(value) => setField("coordinatorFacebook", value)} value={values.coordinatorFacebook} />;
  if (fieldKey === "coordinator.primaryEventContact") return <SelectField label={label} onChange={(value) => setField("coordinatorPrimaryContact", value)} options={booleanOptions()} value={values.coordinatorPrimaryContact} />;
  if (fieldKey === "additional.specialRequests") return <TextareaField label={label} onChange={(value) => setField("specialRequests", value)} value={values.specialRequests} />;
  if (fieldKey === "additional.operationalNotes") return <TextareaField label={label} onChange={(value) => setField("operationalNotes", value)} value={values.operationalNotes} />;

  const dynamicValue = dynamicFieldValues[fieldKey] ?? "";
  const dynamicTextValue = typeof dynamicValue === "string" ? dynamicValue : "";

  if (question.type === "textarea" || question.type === "repeatable") {
    return <TextareaField helper={helper} label={label} onChange={(value) => onSetDynamicField(fieldKey, value)} required={question.required} value={dynamicTextValue} />;
  }

  if (question.type === "file" || question.type === "image") {
    return (
      <PublicQuestionnaireUploadField
        accessKey={accessKey}
        fieldKey={fieldKey}
        helper={helper}
        label={label}
        onChange={(nextValue) => onSetDynamicField(fieldKey, nextValue)}
        questionType={question.type}
        questionnaireId={questionnaireId}
        required={question.required}
        t={(key) => translations[locale][key]}
        value={dynamicValue}
      />
    );
  }

  const mappedType = question.type === "phone" ? "tel" : question.type;
  if (["text", "email", "tel", "number", "date", "time"].includes(mappedType)) {
    return <TextField helper={helper} label={label} onChange={(value) => onSetDynamicField(fieldKey, value)} required={question.required} type={mappedType} value={dynamicTextValue} />;
  }

  if (question.type === "select") {
    return <TextField helper={helper} label={label} onChange={(value) => onSetDynamicField(fieldKey, value)} required={question.required} value={dynamicTextValue} />;
  }

  return null;
}
