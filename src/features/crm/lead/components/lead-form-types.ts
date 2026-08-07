import type { LeadFormErrors } from "../schemas/lead-schema";
import type { LeadFormValues } from "../types/lead";
import type { Translate } from "../../shared/types/form-types";
import type { Venue } from "../../venue/types/venue";

export type { Translate } from "../../shared/types/form-types";

export type LeadFieldSetter = <TField extends keyof LeadFormValues>(
  field: TField,
  value: LeadFormValues[TField],
) => void;

export type LeadSectionProps = {
  errors: LeadFormErrors;
  setFieldValue: LeadFieldSetter;
  t: Translate;
  values: LeadFormValues;
  venues: Venue[];
};
