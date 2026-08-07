import { Plus } from "lucide-react";
import type { PropsWithChildren } from "react";

import { translations, type TranslationKey } from "@/core/i18n";

import type { AdditionalClient, SecondaryContact } from "./public-booking-questionnaire-data";
import { PhoneInput } from "../../shared/components/phone-input";

const t = (key: TranslationKey) => translations.en[key];

export function QuestionnaireSection(
  props: PropsWithChildren<{ title: string }>,
) {
  return (
    <section className="space-y-4 rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
      <h3 className="text-xl font-black text-white">{props.title}</h3>
      {props.children}
    </section>
  );
}

export function AdditionalClients(props: {
  clients: AdditionalClient[];
  onAdd: () => void;
  onChange: (index: number, field: keyof AdditionalClient, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {props.clients.map((client, index) => (
        <div
          className="grid gap-4 rounded-md border border-zinc-800 p-4 md:grid-cols-2"
          key={index}
        >
          <TextField label={t("public.questionnaire.field.firstName")} onChange={(value) => props.onChange(index, "firstName", value)} value={client.firstName} />
          <TextField label={t("public.questionnaire.field.lastName")} onChange={(value) => props.onChange(index, "lastName", value)} value={client.lastName} />
          <PhoneInput label={t("public.questionnaire.field.phone")} onChange={(value) => props.onChange(index, "phone", value)} t={t} value={client.phone} />
          <TextField label={t("public.questionnaire.field.email")} onChange={(value) => props.onChange(index, "email", value)} type="email" value={client.email} />
          <TextField label={t("public.questionnaire.field.role")} onChange={(value) => props.onChange(index, "role", value)} value={client.role} />
        </div>
      ))}
      <button
        className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm font-bold text-cyan-200"
        onClick={props.onAdd}
        type="button"
      >
        <Plus aria-hidden="true" size={16} />
        {t("public.questionnaire.action.addClient")}
      </button>
    </div>
  );
}

export function SecondaryContacts(props: {
  contacts: SecondaryContact[];
  onAdd: () => void;
  onChange: (index: number, field: keyof SecondaryContact, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {props.contacts.map((contact, index) => (
        <div
          className="grid gap-4 rounded-md border border-zinc-800 p-4 md:grid-cols-2"
          key={index}
        >
          <TextField label={t("public.questionnaire.field.name")} onChange={(value) => props.onChange(index, "name", value)} value={contact.name} />
          <TextField label={t("public.questionnaire.field.role")} onChange={(value) => props.onChange(index, "role", value)} value={contact.role} />
          <PhoneInput label={t("public.questionnaire.field.phone")} onChange={(value) => props.onChange(index, "phone", value)} t={t} value={contact.phone} />
          <TextField label={t("public.questionnaire.field.email")} onChange={(value) => props.onChange(index, "email", value)} type="email" value={contact.email} />
        </div>
      ))}
      <button
        className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm font-bold text-cyan-200"
        onClick={props.onAdd}
        type="button"
      >
        <Plus aria-hidden="true" size={16} />
        {t("public.questionnaire.action.addSecondaryContact")}
      </button>
    </div>
  );
}

export function TextField(props: {
  helper?: string;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="block text-sm font-bold text-zinc-300">
      {props.label}
      {props.helper ? (
        <span className="mt-1 block text-xs font-medium leading-5 text-zinc-500">
          {props.helper}
        </span>
      ) : null}
      <input
        className="mt-2 h-11 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-zinc-100 outline-none focus:border-cyan-300"
        onChange={(event) => props.onChange(event.target.value)}
        required={props.required}
        type={props.type ?? "text"}
        value={props.value}
      />
    </label>
  );
}

export function TextareaField(props: {
  helper?: string;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="block text-sm font-bold text-zinc-300">
      {props.label}
      {props.helper ? (
        <span className="mt-1 block text-xs font-medium leading-5 text-zinc-500">
          {props.helper}
        </span>
      ) : null}
      <textarea
        className="mt-2 min-h-28 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-3 text-zinc-100 outline-none focus:border-cyan-300"
        onChange={(event) => props.onChange(event.target.value)}
        required={props.required}
        value={props.value}
      />
    </label>
  );
}

export function SelectField(props: {
  label: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  return (
    <label className="block text-sm font-bold text-zinc-300">
      {props.label}
      <select
        className="mt-2 h-11 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-zinc-100 outline-none focus:border-cyan-300"
        onChange={(event) => props.onChange(event.target.value)}
        value={props.value}
      >
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export const booleanOptions = () => [
  { label: t("public.questionnaire.option.no"), value: "no" },
  { label: t("public.questionnaire.option.yes"), value: "yes" },
];

export const communicationOptions = () => [
  { label: t("public.questionnaire.option.email"), value: "email" },
  { label: t("public.questionnaire.option.whatsapp"), value: "whatsapp" },
  { label: t("public.questionnaire.option.phone"), value: "phone" },
];

export const yesNoOptions = () => [
  { label: t("public.questionnaire.option.notSure"), value: "not_sure" },
  { label: t("public.questionnaire.option.yes"), value: "yes" },
  { label: t("public.questionnaire.option.no"), value: "no" },
];
