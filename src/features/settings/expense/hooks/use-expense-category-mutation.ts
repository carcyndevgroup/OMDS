"use client";

import { useCallback, useState } from "react";

import type { ExpenseCategoryFormValues } from "../types/expense-category";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useExpenseCategoryMutation() {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const save = useCallback(async (
    values: ExpenseCategoryFormValues,
    id?: string,
  ) => {
    setStatus("loading");
    const response = await fetch(
      id ? `/api/settings/expenses/${id}` : "/api/settings/expenses",
      {
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        method: id ? "PUT" : "POST",
      },
    );

    if (!response.ok) {
      setStatus("error");
      throw new Error("expense_category_save_failed");
    }

    setStatus("success");
  }, []);

  return { save, status };
}
