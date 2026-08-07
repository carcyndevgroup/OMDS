"use client";

import { ChevronDown, Plus, Settings, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import type { BookingType } from "@/features/crm/client/types/client";
import type { EventType } from "@/features/crm/shared/types/crm-options";
import type { Translate } from "@/features/crm/shared/types/form-types";

import type {
  QuoteAddManualItemValues,
  QuoteRecipientValues,
  QuoteSummary,
  QuoteUpdateVersionValues,
  QuoteVersion,
} from "../types/quote";
import { QuoteFleteHelper } from "./quote-flete-helper";
import { QuoteDocumentTemplateSection } from "./quote-document-template-section";
import { QuotePaymentPlanSection } from "./quote-payment-plan-section";
import { QuoteSettingsPanel } from "./quote-settings-panel";

export type QuoteEventContactOption = {
  clientId: string;
  email: string;
  firstName: string;
  isPrimary: boolean;
  lastName: string;
};

type QuoteSettingsDrawerProps = {
  canEdit: boolean;
  bookingType: BookingType;
  eventContacts: QuoteEventContactOption[];
  eventDistanceFromHqKm: number | null;
  eventType: EventType;
  isOpen: boolean;
  onAddManualItem: (values: QuoteAddManualItemValues) => Promise<void>;
  onClose: () => void;
  onUpdateRecipients: (values: QuoteRecipientValues[]) => Promise<void>;
  onUpdateVersion: (values: QuoteUpdateVersionValues) => Promise<void>;
  quote: QuoteSummary;
  t: Translate;
  version: QuoteVersion | null;
};

export function QuoteSettingsDrawer(props: QuoteSettingsDrawerProps) {
  const {
    canEdit,
    bookingType,
    eventContacts,
    eventDistanceFromHqKm,
    eventType,
    isOpen,
    onAddManualItem,
    onClose,
    onUpdateRecipients,
    onUpdateVersion,
    quote,
    t,
    version,
  } = props;
  const [openSection, setOpenSection] = useState("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [recipients, setRecipients] = useState<QuoteRecipientValues[]>([]);

  useEffect(() => {
    setRecipients(
      quote.recipients.map((recipient) => ({
        clientId: recipient.clientId,
        email: recipient.email,
        name: recipient.name,
      })),
    );
  }, [quote.recipients]);

  if (!isOpen) return null;

  const addCustomRecipient = () => {
    if (!name.trim() || !email.trim()) return;
    setRecipients((current) => uniqueRecipients([
      ...current,
      { clientId: null, email, name },
    ]));
    setName("");
    setEmail("");
  };

  const toggleContact = (contact: QuoteEventContactOption) => {
    const contactName = `${contact.firstName} ${contact.lastName}`.trim();
    setRecipients((current) => {
      const exists = current.some((item) => item.clientId === contact.clientId);
      if (exists) return current.filter((item) => item.clientId !== contact.clientId);
      return uniqueRecipients([
        ...current,
        { clientId: contact.clientId, email: contact.email, name: contactName },
      ]);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-sm">
      <aside className="ml-auto h-full w-full max-w-2xl overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-950 text-cyan-200">
              <Settings aria-hidden="true" size={20} />
            </span>
            <div>
              <h3 className="text-2xl font-black text-zinc-50">
                {t("crm.quote.settings.drawerTitle")}
              </h3>
              <p className="mt-1 text-sm font-bold text-zinc-500">
                {t("crm.quote.settings.drawerSubtitle")}
              </p>
            </div>
          </div>
          <button
            aria-label={t("crm.quote.action.closeSettings")}
            className="rounded-md border border-zinc-700 p-2 text-zinc-300 hover:border-cyan-300/40 hover:text-cyan-200"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </header>
        <div className="space-y-3">
          <Accordion id="client" openSection={openSection} setOpenSection={setOpenSection} title={t("crm.quote.settings.client")}>
            <div className="space-y-4">
              <ContactSelector
                contacts={eventContacts}
                disabled={!canEdit}
                onToggle={toggleContact}
                recipients={recipients}
                t={t}
              />
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-zinc-100" disabled={!canEdit} onChange={(event) => setName(event.target.value)} placeholder={t("crm.quote.field.recipientName")} value={name} />
                <input className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-zinc-100" disabled={!canEdit} onChange={(event) => setEmail(event.target.value)} placeholder={t("crm.quote.field.recipientEmail")} value={email} />
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/40 px-3 text-sm font-bold text-cyan-200 disabled:opacity-50" disabled={!canEdit} onClick={addCustomRecipient} type="button">
                  <Plus aria-hidden="true" size={16} />
                  {t("crm.quote.action.addRecipient")}
                </button>
              </div>
              <SelectedRecipients disabled={!canEdit} onChange={setRecipients} recipients={recipients} t={t} />
              <button className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-black text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50" disabled={!canEdit} onClick={() => onUpdateRecipients(recipients)} type="button">
                {t("crm.quote.action.saveRecipients")}
              </button>
            </div>
          </Accordion>
          <Accordion id="financial" openSection={openSection} setOpenSection={setOpenSection} title={t("crm.quote.settings.financial")}>
            {version ? <QuoteSettingsPanel onUpdate={onUpdateVersion} readOnly={!canEdit} t={t} version={version} /> : null}
          </Accordion>
          <Accordion id="flete" openSection={openSection} setOpenSection={setOpenSection} title={t("crm.quote.settings.flete")}>
            <QuoteFleteHelper distanceFromHqKm={eventDistanceFromHqKm} onAdd={onAddManualItem} t={t} />
          </Accordion>
          <Accordion id="payment" openSection={openSection} setOpenSection={setOpenSection} title={t("crm.quote.settings.payment")}>
            {version ? (
              <QuotePaymentPlanSection onUpdate={onUpdateVersion} readOnly={!canEdit} t={t} version={version} />
            ) : null}
          </Accordion>
          <Accordion id="questionnaire" openSection={openSection} setOpenSection={setOpenSection} title={t("crm.quote.settings.questionnaire")}>
            {version ? (
              <QuoteDocumentTemplateSection
                bookingType={bookingType}
                eventType={eventType}
                kind="questionnaire"
                onUpdate={onUpdateVersion}
                readOnly={!canEdit}
                t={t}
                version={version}
              />
            ) : null}
          </Accordion>
          <Accordion id="contract" openSection={openSection} setOpenSection={setOpenSection} title={t("crm.quote.settings.contract")}>
            {version ? (
              <QuoteDocumentTemplateSection
                bookingType={bookingType}
                eventType={eventType}
                kind="contract"
                onUpdate={onUpdateVersion}
                readOnly={!canEdit}
                t={t}
                version={version}
              />
            ) : null}
          </Accordion>
        </div>
      </aside>
    </div>
  );
}

function Accordion(props: {
  children: ReactNode;
  id: string;
  openSection: string;
  setOpenSection: (value: string) => void;
  title: string;
}) {
  const isOpen = props.openSection === props.id;
  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900">
      <button className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-black uppercase tracking-widest text-zinc-300" onClick={() => props.setOpenSection(isOpen ? "" : props.id)} type="button">
        {props.title}
        <ChevronDown className={isOpen ? "rotate-180" : ""} size={16} />
      </button>
      {isOpen ? <div className="border-t border-zinc-800 p-4">{props.children}</div> : null}
    </section>
  );
}

function ContactSelector(props: {
  contacts: QuoteEventContactOption[];
  disabled: boolean;
  onToggle: (contact: QuoteEventContactOption) => void;
  recipients: QuoteRecipientValues[];
  t: Translate;
}) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
        {props.t("crm.quote.settings.eventContacts")}
      </p>
      {props.contacts.map((contact) => {
        const selected = props.recipients.some((item) => item.clientId === contact.clientId);
        return (
          <label className="flex items-center justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-950 p-3 text-sm font-bold text-zinc-200" key={contact.clientId}>
            <span>{`${contact.firstName} ${contact.lastName}`.trim()}</span>
            <input checked={selected} className="h-4 w-4 accent-cyan-300" disabled={props.disabled} onChange={() => props.onToggle(contact)} type="checkbox" />
          </label>
        );
      })}
    </div>
  );
}

function SelectedRecipients(props: {
  disabled: boolean;
  onChange: (values: QuoteRecipientValues[]) => void;
  recipients: QuoteRecipientValues[];
  t: Translate;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {props.recipients.map((recipient) => (
        <button className="rounded-md border border-cyan-900 bg-cyan-950/40 px-3 py-2 text-left text-xs font-bold text-cyan-100 disabled:cursor-default" disabled={props.disabled} key={recipient.email} onClick={() => props.onChange(props.recipients.filter((item) => item.email !== recipient.email))} type="button">
          {recipient.name} · {recipient.email}
        </button>
      ))}
      {!props.recipients.length ? (
        <p className="text-sm text-zinc-500">{props.t("crm.quote.settings.noRecipients")}</p>
      ) : null}
    </div>
  );
}

function Placeholder(props: {
  id: string;
  label: string;
  openSection: string;
  setOpenSection: (value: string) => void;
  text: string;
}) {
  return (
    <Accordion
      id={props.id}
      openSection={props.openSection}
      setOpenSection={props.setOpenSection}
      title={props.label}
    >
      <p className="text-sm text-zinc-500">{props.text}</p>
    </Accordion>
  );
}

function uniqueRecipients(values: QuoteRecipientValues[]) {
  const map = new Map<string, QuoteRecipientValues>();
  values.forEach((recipient) => {
    if (!recipient.email.trim()) return;
    map.set(recipient.email.trim().toLowerCase(), {
      ...recipient,
      email: recipient.email.trim(),
      name: recipient.name.trim(),
    });
  });
  return Array.from(map.values());
}
