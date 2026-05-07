export const parsePositiveIntQuery = (
  value: string | string[] | undefined,
  fallback: number,
): number => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n > 0 ? n : fallback;
};

export const escapeLikePattern = (input: string): string => {
  return input.replace(/[\\%_]/g, "\\$&") as string;
};
