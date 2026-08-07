import type { ClientFormErrors } from "../schemas/client-schema";
import type { ClientFormValues } from "../types/client";
import type { Venue } from "../../venue/types/venue";
import type { Translate } from "../../shared/types/form-types";

export type ClientFieldSetter = <TField extends keyof ClientFormValues>(
  field: TField,
  value: ClientFormValues[TField],
) => void;

export type ClientSectionProps = {
  errors: ClientFormErrors;
  venues: Venue[];
  setFieldValue: ClientFieldSetter;
  t: Translate;
  values: ClientFormValues;
};
