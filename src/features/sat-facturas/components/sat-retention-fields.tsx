import type { TranslationKey } from "@/core/i18n";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";

import type { SatFacturaFormValues } from "../types/sat-factura";
import {
  calculateIsrRetention,
  calculateIvaRetention,
  hasSatAmount,
  zeroSatAmount,
} from "../utils/sat-retention-calculations";

type SatRetentionFieldsProps = {
  onChange: (key: "ivaRetentionMxn" | "isrRetentionMxn", value: string) => void;
  t: (key: TranslationKey) => string;
  values: SatFacturaFormValues;
};

export function SatRetentionFields({ onChange, t, values }: SatRetentionFieldsProps) {
  const hasIvaRetention = hasSatAmount(values.ivaRetentionMxn);
  const hasIsrRetention = hasSatAmount(values.isrRetentionMxn);

  return (
    <>
      <RetentionField
        checked={hasIvaRetention}
        label={t("satFacturas.field.ivaRetention")}
        onChange={(value) => onChange("ivaRetentionMxn", value)}
        onToggle={(checked) =>
          onChange(
            "ivaRetentionMxn",
            checked ? calculateIvaRetention(values.subtotalMxn) : zeroSatAmount(),
          )
        }
        toggleLabel={t("satFacturas.field.applyIvaRetention")}
        t={t}
        value={values.ivaRetentionMxn}
      />
      <RetentionField
        checked={hasIsrRetention}
        label={t("satFacturas.field.isrRetention")}
        onChange={(value) => onChange("isrRetentionMxn", value)}
        onToggle={(checked) =>
          onChange(
            "isrRetentionMxn",
            checked ? calculateIsrRetention(values.subtotalMxn) : zeroSatAmount(),
          )
        }
        toggleLabel={t("satFacturas.field.applyIsrRetention")}
        t={t}
        value={values.isrRetentionMxn}
      />
    </>
  );
}

function RetentionField(props: {
  checked: boolean;
  label: string;
  onChange: (value: string) => void;
  onToggle: (checked: boolean) => void;
  t: (key: TranslationKey) => string;
  toggleLabel: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <CrmTextInput
        label={props.label}
        onChange={props.onChange}
        t={props.t}
        type="number"
        value={props.value}
      />
      <label className="flex items-center gap-2 text-xs font-bold text-cyan-100">
        <input
          checked={props.checked}
          className="h-4 w-4 accent-cyan-300"
          onChange={(event) => props.onToggle(event.target.checked)}
          type="checkbox"
        />
        {props.toggleLabel}
      </label>
    </div>
  );
}
