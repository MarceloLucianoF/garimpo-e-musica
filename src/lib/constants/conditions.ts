export const CONDITIONS = {
  G: { label: "Bom", stars: 2, description: "Vinil com marcas visíveis, mas ainda funcional e com escuta honesta." },
  VG: { label: "Muito Bom", stars: 3, description: "Pode apresentar ruídos leves, mantendo boa experiência de reprodução." },
  VG_PLUS: { label: "Muito Bom+", stars: 4, description: "Boa reprodução, com poucos sinais de uso e acabamento preservado." },
  NM: { label: "Quase Novo", stars: 5, description: "Praticamente sem uso, com aparência muito próxima de nova." },
} as const;

export type ConditionKey = keyof typeof CONDITIONS;

export const CONDITION_OPTIONS: ConditionKey[] = ["G", "VG", "VG_PLUS", "NM"];

export function normalizeCondition(value?: string | null): ConditionKey {
  if (!value) {
    return "VG";
  }

  const normalized = value.toUpperCase().replace("+", "_PLUS");
  if (normalized === "VG_PLUS") {
    return "VG_PLUS";
  }

  if (normalized in CONDITIONS) {
    return normalized as ConditionKey;
  }

  if (value === "VG+") {
    return "VG_PLUS";
  }

  return "VG";
}

export function serializeCondition(value: ConditionKey) {
  return value === "VG_PLUS" ? "VG+" : value;
}
