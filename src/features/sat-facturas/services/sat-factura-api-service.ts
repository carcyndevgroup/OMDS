import { createServerSupabaseClient } from "@/core/supabase/server-client";

import { getSatFacturaEventDefaults } from "../repositories/sat-factura-defaults-repository";
import {
  createSatFactura,
  getSatFacturaDetail,
  listSatFacturaQueue,
  updateSatFactura,
} from "../repositories/sat-factura-queue-repository";
import {
  updateSatFacturaComplemento,
  updateSatFacturaWorkflow,
} from "../repositories/sat-factura-workflow-repository";
import {
  createBankAccount,
  createFiscalProfile,
  findBankAccount,
  findFiscalProfile,
  getSatSettings,
  updateBankAccount,
  updateFiscalProfile,
} from "../repositories/sat-settings-repository";
import {
  createSatPayment,
  getSatPaymentDetail,
  listSatPayments,
} from "../repositories/sat-payment-repository";
import type {
  SatComplementoAction,
  SatFacturaFormValues,
  SatPaymentFormValues,
  SatFacturaWorkflowValues,
} from "../types/sat-factura";
import type {
  SatBankAccountFormValues,
  SatFiscalProfileFormValues,
} from "../types/sat-settings";

export async function createSatFacturaApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    createBankAccount: (values: SatBankAccountFormValues) =>
      createBankAccount(client, values),
    createFactura: (values: SatFacturaFormValues) =>
      createSatFactura(client, values),
    createFiscalProfile: (values: SatFiscalProfileFormValues) =>
      createFiscalProfile(client, values),
    createPayment: (values: SatPaymentFormValues) => createSatPayment(client, values),
    findBankAccount: (id: string) => findBankAccount(client, id),
    findFiscalProfile: (id: string) => findFiscalProfile(client, id),
    get: (facturaId: string) => getSatFacturaDetail(client, facturaId),
    getEventDefaults: (eventId: string) => getSatFacturaEventDefaults(client, eventId),
    getPayment: (paymentId: string) => getSatPaymentDetail(client, paymentId),
    list: () => listSatFacturaQueue(client),
    listPayments: () => listSatPayments(client),
    settings: () => getSatSettings(client),
    updateBankAccount: (id: string, values: SatBankAccountFormValues) =>
      updateBankAccount(client, id, values),
    updateFactura: (facturaId: string, values: SatFacturaFormValues) =>
      updateSatFactura(client, facturaId, values),
    updateFacturaComplemento: (facturaId: string, action: SatComplementoAction) =>
      updateSatFacturaComplemento(client, facturaId, action),
    updateFacturaWorkflow: (facturaId: string, values: SatFacturaWorkflowValues) =>
      updateSatFacturaWorkflow(client, facturaId, values),
    updateFiscalProfile: (id: string, values: SatFiscalProfileFormValues) =>
      updateFiscalProfile(client, id, values),
  };
}
