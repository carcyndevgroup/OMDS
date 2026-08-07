"use client";

import { useCallback, useEffect, useState } from "react";

import type { ExpenseCategory } from "../types/expense-category";

export function useExpenseCategories() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const response = await fetch("/api/settings/expenses");
      if (!response.ok) throw new Error("expense_categories_load_failed");
      const payload = (await response.json()) as { data: ExpenseCategory[] };
      setCategories(payload.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { categories, hasError, isLoading, refresh };
}
