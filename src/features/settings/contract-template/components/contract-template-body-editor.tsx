"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useTranslation } from "@/core/i18n";
import { TemplateConditionAssistant } from "@/features/settings/template-tools/template-condition-assistant";
import { TemplateSnippetAssistant } from "@/features/settings/template-tools/template-snippet-assistant";
import { TemplateTokenAssistant } from "@/features/settings/template-tools/template-token-assistant";
import {
  findUnknownTemplateTokens,
  insertTemplateToken,
} from "@/features/settings/template-tools/template-token-catalog";
import { appendTemplateSnippet } from "@/features/settings/template-tools/template-snippet-library";

const toolbarButtons = [
  { command: "bold", icon: Bold, key: "settings.contractTemplate.editor.bold" },
  { command: "italic", icon: Italic, key: "settings.contractTemplate.editor.italic" },
  { command: "underline", icon: Underline, key: "settings.contractTemplate.editor.underline" },
  { command: "formatBlock", icon: Heading1, key: "settings.contractTemplate.editor.heading", value: "h2" },
  { command: "formatBlock", icon: Heading2, key: "settings.contractTemplate.editor.paragraph", value: "p" },
  { command: "insertUnorderedList", icon: List, key: "settings.contractTemplate.editor.bullets" },
  { command: "insertOrderedList", icon: ListOrdered, key: "settings.contractTemplate.editor.numbered" },
  { command: "justifyLeft", icon: AlignLeft, key: "settings.contractTemplate.editor.alignLeft" },
  { command: "justifyCenter", icon: AlignCenter, key: "settings.contractTemplate.editor.alignCenter" },
  { command: "justifyRight", icon: AlignRight, key: "settings.contractTemplate.editor.alignRight" },
  { command: "justifyFull", icon: AlignJustify, key: "settings.contractTemplate.editor.alignJustify" },
] as const;

type ToolbarButton = (typeof toolbarButtons)[number];

type ContractTemplateBodyEditorProps = {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
};

function normalizeEditorHtml(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "<p><br></p>";

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  if (looksLikeHtml) return trimmed;

  return trimmed
    .split(/\r?\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\r?\n/g, "<br>")}</p>`)
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeAdvancedHtml(value: string) {
  if (!value.trim()) return "";

  const parser = new DOMParser();
  const document = parser.parseFromString(`<div>${value}</div>`, "text/html");
  const allowedTags = new Set(["p", "h1", "h2", "ul", "ol", "li", "strong", "em", "u", "span", "br"]);
  const allowedAttributes = new Set(["class", "style"]);
  const allowedStyleProperties = new Set(["margin-top", "margin-bottom", "margin-left", "margin-right", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-left", "border-right", "border-top", "border-bottom", "text-align", "color", "background-color"]);

  const elements = Array.from(document.body.querySelectorAll("*"));
  for (const element of elements) {
    const tagName = element.tagName.toLowerCase();
    if (!allowedTags.has(tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      continue;
    }

    for (const attribute of Array.from(element.attributes)) {
      const attributeName = attribute.name.toLowerCase();
      if (!allowedAttributes.has(attributeName)) {
        element.removeAttribute(attribute.name);
        continue;
      }

      if (attributeName === "style") {
        const nextStyles = Array.from(attribute.value.split(";")).reduce<string[]>((parts, declaration) => {
          const trimmed = declaration.trim();
          if (!trimmed) return parts;
          const [property, ...valueParts] = trimmed.split(":");
          const normalizedProperty = property?.trim().toLowerCase();
          const normalizedValue = valueParts.join(":").trim();
          if (!normalizedProperty || !allowedStyleProperties.has(normalizedProperty) || !normalizedValue) {
            return parts;
          }
          parts.push(`${normalizedProperty}: ${normalizedValue}`);
          return parts;
        }, []);

        if (nextStyles.length) {
          element.setAttribute("style", nextStyles.join("; "));
        } else {
          element.removeAttribute("style");
        }
      }
    }
  }

  return document.body.innerHTML;
}

const advancedPresetSnippets = [
  { labelKey: "settings.contractTemplate.editor.advancedPresetSection", value: "<h2>Section Title</h2><p>Body copy here.</p>" },
  { labelKey: "settings.contractTemplate.editor.advancedPresetList", value: "<ul><li>First item</li><li>Second item</li></ul>" },
  { labelKey: "settings.contractTemplate.editor.advancedPresetCallout", value: "<p class=\"custom-callout\" style=\"margin-top: 12px; padding: 12px 14px; border-left: 3px solid #22d3ee;\">Important note</p>" },
  { labelKey: "settings.contractTemplate.editor.advancedPresetTerms", value: "<h2>Terms</h2><p>Use this section for scope, timing, or payment details.</p>" },
] as const;

export function ContractTemplateBodyEditor({ error, label, onChange, placeholder, value }: ContractTemplateBodyEditorProps) {
  const { t } = useTranslation();
  const editorRef = useRef<HTMLDivElement>(null);
  const [advancedHtml, setAdvancedHtml] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const sanitizedAdvancedHtml = useMemo(() => sanitizeAdvancedHtml(advancedHtml), [advancedHtml]);
  const unknownTokens = findUnknownTemplateTokens([value]);
  const hasUnknownTokens = unknownTokens.length > 0;

  useEffect(() => {
    const element = editorRef.current;
    if (!element) return;

    const nextHtml = normalizeEditorHtml(value);
    if (element.innerHTML !== nextHtml) {
      element.innerHTML = nextHtml;
    }
  }, [value]);

  const toolbar = useMemo(
    () =>
      toolbarButtons.map((button) => ({
        ...button,
        label: t(button.key),
      })),
    [t],
  );

  const applyCommand = (command: ToolbarButton["command"], value?: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    document.execCommand(command, false, value ?? undefined);
    const nextValue = editorRef.current.innerHTML;
    onChange(nextValue);
  };

  const insertToken = (token: string) => {
    const nextValue = insertTemplateToken(value, token);
    onChange(nextValue);
  };

  const insertSnippet = (snippet: string) => {
    const nextValue = appendTemplateSnippet(value, snippet);
    onChange(nextValue);
  };

  const insertAdvancedHtml = (value?: string) => {
    const snippet = sanitizeAdvancedHtml((value ?? advancedHtml).trim());
    if (!editorRef.current || !snippet) return;

    editorRef.current.focus();
    document.execCommand("insertHTML", false, snippet);
    const nextValue = editorRef.current.innerHTML;
    onChange(nextValue);
    setAdvancedHtml("");
    setIsAdvancedOpen(false);
  };

  const clearFormatting = () => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    document.execCommand("removeFormat", false);
    const nextValue = editorRef.current.innerHTML;
    onChange(nextValue);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-zinc-200">{label}</label>
      <div className="rounded-md border border-zinc-700 bg-zinc-950/70 p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
          {toolbar.map((button) => {
            const Icon = button.icon;
            return (
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 transition hover:border-cyan-300 hover:text-cyan-200"
                key={button.key}
                onClick={() => applyCommand(button.command, "value" in button ? button.value : undefined)}
                title={button.label}
                type="button"
              >
                <Icon aria-hidden="true" size={16} />
              </button>
            );
          })}
          <button
            className="ml-auto inline-flex h-9 items-center gap-2 rounded-md border border-dashed border-zinc-700 px-3 text-sm font-semibold text-zinc-200 transition hover:border-cyan-300 hover:text-cyan-200"
            onClick={() => setIsAdvancedOpen((current) => !current)}
            title={t("settings.contractTemplate.editor.advanced")}
            type="button"
          >
            <Code2 aria-hidden="true" size={15} />
            {t("settings.contractTemplate.editor.advanced")}
          </button>
        </div>
        {isAdvancedOpen ? (
          <div className="mb-4 rounded-md border border-dashed border-zinc-700 bg-zinc-900/60 p-3">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              {t("settings.contractTemplate.editor.advanced")}
            </label>
            <textarea
              className="min-h-28 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none"
              onChange={(event) => setAdvancedHtml(event.target.value)}
              placeholder={t("settings.contractTemplate.editor.advancedPlaceholder")}
              value={advancedHtml}
            />
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              {t("settings.contractTemplate.editor.advancedHint")}
            </p>
            <div className="mt-3 rounded-md border border-zinc-700 bg-zinc-950/70 p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                {t("settings.contractTemplate.editor.advancedStarter")}
              </p>
              <div className="flex flex-wrap gap-2">
                {advancedPresetSnippets.map((snippet) => (
                  <button
                    className="rounded-md border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-200"
                    key={snippet.labelKey}
                    onClick={() => insertAdvancedHtml(snippet.value)}
                    type="button"
                  >
                    {t(snippet.labelKey)}
                  </button>
                ))}
              </div>
            </div>
            {sanitizedAdvancedHtml ? (
              <div className="mt-3 rounded-md border border-zinc-700 bg-zinc-950/70 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {t("settings.contractTemplate.editor.advancedPreview")}
                </p>
                <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-3 text-sm text-zinc-100" dangerouslySetInnerHTML={{ __html: sanitizedAdvancedHtml }} />
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {advancedPresetSnippets.map((snippet) => (
                <button
                  className="rounded-md border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-200"
                  key={snippet.labelKey}
                  onClick={() => insertAdvancedHtml(snippet.value)}
                  type="button"
                >
                  {t(snippet.labelKey)}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="rounded-md bg-cyan-300 px-3 py-2 text-sm font-bold text-zinc-950"
                onClick={() => insertAdvancedHtml()}
                type="button"
              >
                {t("settings.contractTemplate.editor.advancedInsert")}
              </button>
              <button
                className="rounded-md border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-200"
                onClick={() => setAdvancedHtml("")}
                type="button"
              >
                {t("settings.contractTemplate.editor.advancedClear")}
              </button>
              <button
                className="rounded-md border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-200"
                onClick={clearFormatting}
                type="button"
              >
                {t("settings.contractTemplate.editor.clearFormatting")}
              </button>
            </div>
          </div>
        ) : null}
        <div
          className="min-h-72 rounded-md border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm leading-7 text-zinc-100 outline-none"
          contentEditable
          data-placeholder={placeholder}
          onInput={(event) => {
            const nextValue = (event.currentTarget as HTMLDivElement).innerHTML;
            onChange(nextValue);
          }}
          ref={editorRef}
          suppressContentEditableWarning
        />
        <div className="mt-4 space-y-3 border-t border-zinc-800 pt-4">
          <TemplateTokenAssistant
            onInsertBody={insertToken}
            t={t}
            unknownTokens={unknownTokens}
          />
          <TemplateSnippetAssistant onInsertBody={insertSnippet} t={t} />
          <TemplateConditionAssistant onInsertBody={insertSnippet} t={t} />
          {hasUnknownTokens ? <p className="text-sm text-amber-300">{t("settings.templateTokens.blockedUnknown")}</p> : null}
        </div>
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
