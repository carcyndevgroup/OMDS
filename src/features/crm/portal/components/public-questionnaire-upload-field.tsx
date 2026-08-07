"use client";

import { ExternalLink, Paperclip, Trash2 } from "lucide-react";
import { useState } from "react";

import type { Json } from "@/core/supabase/json.types";

type UploadedAttachment = {
  fileName: string;
  path: string;
  signedUrl?: string;
};

type UploadStatus = "queued" | "uploading" | "success" | "failed";

type UploadQueueItem = {
  id: string;
  fileName: string;
  status: UploadStatus;
};

type PublicQuestionnaireUploadFieldProps = {
  accessKey: string;
  fieldKey: string;
  helper?: string;
  label: string;
  onChange: (nextValue: Json) => void;
  questionType: "file" | "image";
  questionnaireId: string;
  required?: boolean;
  t: (key:
    | "public.questionnaire.upload.status.failed"
    | "public.questionnaire.upload.status.queued"
    | "public.questionnaire.upload.status.success"
    | "public.questionnaire.upload.status.uploading"
    | "public.questionnaire.upload.deleteError"
    | "public.questionnaire.upload.error"
    | "public.questionnaire.upload.open"
    | "public.questionnaire.upload.partialError"
    | "public.questionnaire.upload.remove"
    | "public.questionnaire.upload.uploading") => string;
  value: Json;
};

const isRecord = (value: Json): value is Record<string, Json> => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

const asAttachments = (value: Json): UploadedAttachment[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, Json> => isRecord(item as Json))
    .map((item) => ({
      fileName: typeof item.fileName === "string" ? item.fileName : "",
      path: typeof item.path === "string" ? item.path : "",
      signedUrl: typeof item.signedUrl === "string" ? item.signedUrl : undefined,
    }))
    .filter((item) => item.path && item.fileName);
};

export function PublicQuestionnaireUploadField(props: PublicQuestionnaireUploadFieldProps) {
  const { accessKey, fieldKey, helper, label, onChange, questionType, questionnaireId, required, t, value } = props;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const attachments = asAttachments(value);

  const setQueueStatus = (id: string, status: UploadStatus) => {
    setUploadQueue((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const statusLabel = (status: UploadStatus) => {
    if (status === "queued") return t("public.questionnaire.upload.status.queued");
    if (status === "uploading") return t("public.questionnaire.upload.status.uploading");
    if (status === "success") return t("public.questionnaire.upload.status.success");
    return t("public.questionnaire.upload.status.failed");
  };

  const statusClassName = (status: UploadStatus) => {
    if (status === "queued") return "border-zinc-600 bg-zinc-800 text-zinc-200";
    if (status === "uploading") return "border-cyan-600 bg-cyan-950/50 text-cyan-100";
    if (status === "success") return "border-emerald-600 bg-emerald-950/50 text-emerald-100";
    return "border-rose-700 bg-rose-950/60 text-rose-100";
  };

  const openAttachment = async (attachment: UploadedAttachment) => {
    let nextUrl = attachment.signedUrl ?? "";
    if (!nextUrl) {
      const response = await fetch(`/api/portal/${accessKey}/questionnaires/${questionnaireId}/uploads/sign`, {
        body: JSON.stringify({ path: attachment.path }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) throw new Error("open_upload_failed");
      const payload = (await response.json()) as { signedUrl?: unknown };
      nextUrl = typeof payload.signedUrl === "string" ? payload.signedUrl : "";
      if (!nextUrl) throw new Error("open_upload_failed");
    }

    if (typeof window !== "undefined") window.open(nextUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <label className="block text-sm font-bold text-zinc-300">
      {label}
      {helper ? <span className="mt-1 block text-xs font-medium leading-5 text-zinc-500">{helper}</span> : null}
      <input
        accept={questionType === "image" ? "image/*" : undefined}
        className="mt-2 block w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 file:mr-3 file:rounded file:border-0 file:bg-cyan-300 file:px-3 file:py-1 file:font-bold file:text-zinc-950"
        disabled={isUploading}
        multiple
        onChange={async (event) => {
          const files = Array.from(event.target.files ?? []);
          if (!files.length) return;

          const queue = files.map((file, index) => ({
            fileName: file.name || `${fieldKey}-${index + 1}`,
            id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
            status: "queued" as const,
          }));

          setUploadQueue(queue);
          setUploadError(null);
          setIsUploading(true);
          try {
            const uploadedFiles: Array<Record<string, Json>> = [];
            const failedFiles: string[] = [];

            for (let index = 0; index < files.length; index += 1) {
              const file = files[index];
              if (!file) continue;
              const queueItem = queue[index];
              if (!queueItem) continue;

              setQueueStatus(queueItem.id, "uploading");
              const formData = new FormData();
              formData.set("fieldKey", fieldKey);
              formData.set("file", file);

              try {
                const response = await fetch(`/api/portal/${accessKey}/questionnaires/${questionnaireId}/uploads`, {
                  body: formData,
                  method: "POST",
                });

                if (!response.ok) throw new Error("upload_failed");

                const payload = (await response.json()) as {
                  data?: Record<string, Json>;
                  signedUrl?: unknown;
                };

                const entry = payload.data ?? {};
                uploadedFiles.push(
                  typeof payload.signedUrl === "string" ? { ...entry, signedUrl: payload.signedUrl } : entry,
                );
                setQueueStatus(queueItem.id, "success");
              } catch {
                setQueueStatus(queueItem.id, "failed");
                failedFiles.push(queueItem.fileName || t("public.questionnaire.upload.error"));
              }
            }

            if (uploadedFiles.length) onChange([...attachments, ...uploadedFiles]);
            if (failedFiles.length) setUploadError(`${t("public.questionnaire.upload.partialError")}: ${failedFiles.join(", ")}`);
            event.currentTarget.value = "";
          } finally {
            setIsUploading(false);
          }
        }}
        required={required}
        type="file"
      />

      {isUploading ? <span className="mt-2 block text-xs font-medium text-cyan-200">{t("public.questionnaire.upload.uploading")}</span> : null}
      {uploadError ? <span className="mt-2 block text-xs font-medium text-rose-300">{uploadError}</span> : null}

      {uploadQueue.length ? (
        <div className="mt-2 space-y-1">
          {uploadQueue.map((item) => (
            <div className="flex items-center justify-between gap-3 rounded border border-zinc-800 bg-zinc-900/80 px-2 py-1" key={item.id}>
              <span className="truncate text-[11px] font-medium text-zinc-200">{item.fileName}</span>
              <span className={`inline-flex shrink-0 items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusClassName(item.status)}`}>
                {statusLabel(item.status)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3 space-y-2">
        {attachments.map((attachment, index) => (
          <div className="flex items-center justify-between gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2" key={`${attachment.path}-${index}`}>
            <span className="inline-flex min-w-0 items-center gap-2 text-xs font-medium text-zinc-200">
              <Paperclip aria-hidden="true" size={12} />
              <span className="truncate">{attachment.fileName}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <button
                className="inline-flex h-7 items-center gap-1 rounded border border-zinc-700 px-2 text-xs font-bold text-cyan-200"
                onClick={() => {
                  void openAttachment(attachment).catch(() => {
                    if (typeof window !== "undefined") window.alert(t("public.questionnaire.upload.error"));
                  });
                }}
                type="button"
              >
                <ExternalLink aria-hidden="true" size={12} />
                {t("public.questionnaire.upload.open")}
              </button>
              <button
                className="inline-flex h-7 items-center gap-1 rounded border border-zinc-700 px-2 text-xs font-bold text-rose-200"
                onClick={async () => {
                  const response = await fetch(`/api/portal/${accessKey}/questionnaires/${questionnaireId}/uploads`, {
                    body: JSON.stringify({ path: attachment.path }),
                    headers: { "Content-Type": "application/json" },
                    method: "DELETE",
                  });

                  if (!response.ok) {
                    setUploadError(t("public.questionnaire.upload.deleteError"));
                    return;
                  }

                  setUploadError(null);
                  onChange(attachments.filter((_, currentIndex) => currentIndex !== index) as Json);
                }}
                type="button"
              >
                <Trash2 aria-hidden="true" size={12} />
                {t("public.questionnaire.upload.remove")}
              </button>
            </span>
          </div>
        ))}
      </div>
    </label>
  );
}
