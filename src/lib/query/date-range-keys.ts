export type RangeKey = "7d" | "30d" | "90d" | "12m";

export const dateRangeKeys = {
  analytics: (businessId: string, range: RangeKey) =>
    ["analytics", businessId, range] as const,
  competitors: (businessId: string, range: RangeKey) =>
    ["competitors", businessId, range] as const,
};

export function rangeToDays(range: RangeKey): number {
  if (range === "7d") return 7;
  if (range === "90d") return 90;
  if (range === "12m") return 365;
  return 30;
}
