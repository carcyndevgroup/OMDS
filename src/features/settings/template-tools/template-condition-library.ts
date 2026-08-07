const CONDITION_BLOCK_PATTERN = /\[\[if\s+([^\]]+)\]\]([\s\S]*?)\[\[endif\]\]/g;

type ConditionField = "bookingType" | "documentKind" | "eventType";

type ConditionContext = {
  bookingType?: string;
  documentKind?: string;
  eventType?: string;
};

const CONDITION_KEYS: ConditionField[] = ["bookingType", "eventType", "documentKind"];

export function applyConditionalBlocks(value: string, context: ConditionContext) {
  if (!value) return value;

  return value.replace(CONDITION_BLOCK_PATTERN, (match, rawCondition: string, content: string) => {
    return evaluateCondition(rawCondition, context) ? content.trim() : "";
  });
}

function evaluateCondition(rawCondition: string, context: ConditionContext) {
  const condition = rawCondition.trim();
  const operator = condition.includes("!=") ? "!=" : condition.includes("=") ? "=" : null;
  if (!operator) return true;

  const [leftRaw, rightRaw] = condition.split(operator);
  const left = (leftRaw ?? "").trim() as ConditionField;
  const right = (rightRaw ?? "").trim();

  if (!CONDITION_KEYS.includes(left) || !right) return true;

  const expectedValues = right.split("|").map((value) => value.trim()).filter(Boolean);
  if (!expectedValues.length) return true;

  const currentValue = (context[left] ?? "").trim();
  if (!currentValue) return false;

  const hasMatch = expectedValues.includes(currentValue);
  return operator === "=" ? hasMatch : !hasMatch;
}

export function buildConditionalSnippet(
  field: ConditionField,
  values: string[],
  placeholder: string,
) {
  const normalizedValues = values.map((value) => value.trim()).filter(Boolean).join("|");
  return `[[if ${field}=${normalizedValues}]]\n${placeholder}\n[[endif]]`;
}
