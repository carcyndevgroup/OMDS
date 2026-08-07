"use client";

import { useEffect, useState } from "react";

import type { SatBankAccount } from "../types/sat-settings";

type BankAccountResponse = { data: SatBankAccount };

export function useSatBankAccount(accountId: string) {
  const [account, setAccount] = useState<SatBankAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAccount() {
      try {
        const response = await fetch(`/api/sat-facturas/bank-accounts/${accountId}`);
        if (!response.ok) throw new Error("account_load_failed");
        const payload = (await response.json()) as BankAccountResponse;
        if (isMounted) setAccount(payload.data);
      } catch {
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadAccount();

    return () => {
      isMounted = false;
    };
  }, [accountId]);

  return { account, hasError, isLoading };
}
