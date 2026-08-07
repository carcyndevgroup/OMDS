import type { ReactNode } from "react";

export function SettingsDivider() {
  return <div className="border-t border-zinc-800" />;
}

type CheckboxFieldProps = {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
  readOnly: boolean;
};

export function CheckboxField(props: CheckboxFieldProps) {
  const { checked, label, onChange, readOnly } = props;

  return (
    <label className="flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-bold text-zinc-300">
      <input
        checked={checked}
        className="h-4 w-4 accent-cyan-300"
        disabled={readOnly}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      {label}
    </label>
  );
}

type FieldProps = {
  label: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  type: string;
  value: string;
};

export function NumberField(props: Omit<FieldProps, "type">) {
  return <Field {...props} type="number" />;
}

type SelectFieldProps = {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  value: string;
};

export function SelectField(props: SelectFieldProps) {
  const { children, label, onChange, readOnly, value } = props;

  return (
    <label className="grid gap-1.5 text-sm font-bold text-zinc-300">
      {label}
      <select
        className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-zinc-100 outline-none focus:border-cyan-300"
        disabled={readOnly}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}

export function Field(props: FieldProps) {
  const { label, onChange, readOnly, type, value } = props;

  return (
    <label className="grid gap-1.5 text-sm font-bold text-zinc-300">
      {label}
      <input
        className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-zinc-100 outline-none focus:border-cyan-300"
        disabled={readOnly}
        onChange={(event) => onChange(event.target.value)}
        step="0.000001"
        type={type}
        value={value}
      />
    </label>
  );
}
