"use client";

import { useEffect, useMemo, useState } from "react";

import { useEmailTemplateOptions } from "../../messages/hooks/use-email-template-options";
import type { BookingType } from "../types/client";
import { useQuestionnaireTemplateOptions } from "../../../settings/questionnaire-template";
import type { EventType } from "../../shared/types/crm-options";
import type { MessageDraftCreateInput, MessageDraftRecipient } from "../../messages/types/message-draft";
import type { ClientDetailSectionProps } from "./client-detail-types";

type ClientQuestionnaireSendModalProps = {
  contacts: NonNullable<ClientDetailSectionProps["client"]["event"]>["contacts"];
  isSaving: boolean;
  onClose: () => void;
  onSaveAndSend: (input: MessageDraftCreateInput) => Promise<void>;
  onSaveDraft: (input: MessageDraftCreateInput) => Promise<void>;
  bookingType: BookingType;
  eventType: EventType;
  questionnaireId: string;
  questionnaireTemplateKey: string;
  questionnaireTitle: string;
  t: ClientDetailSectionProps["t"];
};

export function ClientQuestionnaireSendModal(props: ClientQuestionnaireSendModalProps) {
  const {
    bookingType,
    contacts,
    eventType,
    isSaving,
    onClose,
    onSaveAndSend,
    onSaveDraft,
    questionnaireId,
    questionnaireTemplateKey,
    questionnaireTitle,
    t,
  } = props;

  const emailTemplateState = useEmailTemplateOptions("questionnaire");
  const questionnaireTemplateState = useQuestionnaireTemplateOptions();
  const questionnaireTemplateOptions = useMemo(() => {
    return questionnaireTemplateState.options.filter((template) => {
      const matchesBookingType = !template.bookingType || template.bookingType === bookingType;
      const matchesEventType = !template.eventType || template.eventType === eventType;
      return matchesBookingType && matchesEventType;
    });
  }, [bookingType, eventType, questionnaireTemplateState.options]);

  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [adHocEmail, setAdHocEmail] = useState("");
  const [templateKey, setTemplateKey] = useState(questionnaireTemplateKey || questionnaireTemplateOptions[0]?.templateKey || "");
  const [emailTemplate, setEmailTemplate] = useState<string>(emailTemplateState.options[0]?.templateKey ?? "");
  const [subject, setSubject] = useState(`Questionnaire: ${questionnaireTitle}`);
  const [body, setBody] = useState("Please review and complete your booking questionnaire. Reply here if you have questions.");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (emailTemplateState.options.some((option) => option.templateKey === emailTemplate)) return;
    setEmailTemplate(emailTemplateState.options[0]?.templateKey ?? "");
  }, [emailTemplate, emailTemplateState.options]);

  useEffect(() => {
    if (questionnaireTemplateOptions.some((option) => option.templateKey === templateKey)) return;
    const fallback = questionnaireTemplateOptions[0];
    if (!fallback) return;
    setTemplateKey(fallback.templateKey);
  }, [questionnaireTemplateOptions, templateKey]);

  const recipients = useMemo(() => {
    const fromContacts: MessageDraftRecipient[] = contacts
      .filter((contact) => selectedEmails.includes(contact.email) && contact.email)
      .map((contact) => ({
        email: contact.email,
        label: `${contact.firstName} ${contact.lastName}`.trim(),
      }));

    const adHoc = adHocEmail.trim();
    if (adHoc) {
      fromContacts.push({
        email: adHoc,
        label: t("crm.client.detail.questionnaireSend.adHocContact"),
      });
    }

    return fromContacts;
  }, [adHocEmail, contacts, selectedEmails, t]);

  const handleSubmit = async (mode: "draft" | "sent") => {

    if (!subject.trim() || !body.trim()) {
      setError(t("crm.client.detail.questionnaireSend.validation.subjectBody"));
      return;
    }

    if (recipients.length === 0) {
      setError(t("crm.client.detail.questionnaireSend.validation.recipient"));
      return;
    }

    const input: MessageDraftCreateInput = {
      body: body.trim(),
      documentId: questionnaireId,
      documentKind: "questionnaire",
      metadata: {
        emailTemplate,
        questionnaireTemplateKey: templateKey,
      },
      recipients,
      status: mode,
      subject: subject.trim(),
    };

    setError(null);
    if (mode === "sent") {
      await onSaveAndSend(input);
      return;
    }

    await onSaveDraft(input);
  };

  const applyTemplate = (templateKeyValue: string) => {
    setEmailTemplate(templateKeyValue);
    const template = emailTemplateState.options.find((option) => option.templateKey === templateKeyValue);
    if (!template) return;
    setSubject(template.subject);
    setBody(template.body);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form className="w-full max-w-2xl space-y-4 rounded-md border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
        <div>
          <h3 className="text-lg font-bold text-white">
            {t("crm.client.detail.questionnaireSend.title")}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            {t("crm.client.detail.questionnaireSend.description")}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold text-zinc-300">
            {t("crm.client.detail.questionnaireSend.recipients")}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {contacts.map((contact) => (
              <label className="flex items-center gap-2 text-sm text-zinc-200" key={contact.clientId}>
                <input
                  checked={selectedEmails.includes(contact.email)}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-900"
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setSelectedEmails((current) => {
                      if (!contact.email) return current;
                      if (checked) return Array.from(new Set([...current, contact.email]));
                      return current.filter((value) => value !== contact.email);
                    });
                  }}
                  type="checkbox"
                />
                <span>{contact.firstName} {contact.lastName} ({contact.email || "-"})</span>
              </label>
            ))}
          </div>
          <input
            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-cyan-300"
            onChange={(event) => setAdHocEmail(event.target.value)}
            placeholder={t("crm.client.detail.questionnaireSend.adHocPlaceholder")}
            value={adHocEmail}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-zinc-300">
            {t("crm.client.detail.questionnaireSend.questionnaireTemplate")}
            <select
              className="mt-2 h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-cyan-300"
              onChange={(event) => setTemplateKey(event.target.value)}
              value={templateKey}
            >
              {[templateKey, ...questionnaireTemplateOptions.map((option) => option.templateKey)]
                .filter((value, index, array) => array.indexOf(value) === index)
                .map((value) => (
                  <option key={value} value={value}>{questionnaireTemplateOptions.find((option) => option.templateKey === value)?.title ?? value}</option>
                ))}
            </select>
          </label>

          <label className="block text-sm font-bold text-zinc-300">
            {t("crm.client.detail.questionnaireSend.emailTemplate")}
            <select
              className="mt-2 h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-cyan-300"
              onChange={(event) => applyTemplate(event.target.value)}
              value={emailTemplate}
            >
              {emailTemplateState.options.map((value) => (
                <option key={value.templateKey} value={value.templateKey}>{value.title}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-bold text-zinc-300">
          {t("crm.client.detail.questionnaireSend.subject")}
          <input
            className="mt-2 h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-cyan-300"
            onChange={(event) => setSubject(event.target.value)}
            value={subject}
          />
        </label>

        <label className="block text-sm font-bold text-zinc-300">
          {t("crm.client.detail.questionnaireSend.body")}
          <textarea
            className="mt-2 min-h-24 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-300"
            onChange={(event) => setBody(event.target.value)}
            value={body}
          />
        </label>

        {error ? (
          <p className="rounded-md border border-rose-800/70 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <button
            className="inline-flex h-10 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200"
            onClick={onClose}
            type="button"
          >
            {t("crm.client.detail.modal.invoiceCreate.action.cancel")}
          </button>
          <button
            className="inline-flex h-10 items-center rounded-md border border-cyan-300/40 px-4 text-sm font-bold text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            onClick={() => void handleSubmit("draft")}
            type="button"
          >
            {t("crm.client.detail.questionnaireSend.saveDraft")}
          </button>
          <button
            className="inline-flex h-10 items-center rounded-md bg-cyan-300 px-4 text-sm font-black text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            onClick={() => void handleSubmit("sent")}
            type="button"
          >
            {t("crm.client.detail.questionnaireSend.saveAndSend")}
          </button>
        </div>
      </form>
    </div>
  );
}
