export type MarketPositioningBriefResult = {
    headline: string;
    overview: string;
    positioningBullets: string[];
    opportunityActions: Array<{ title: string; detail: string }>;
    dataLimitations: string;
};

export function parseMarketPositioningBriefPayload(parsed: unknown): MarketPositioningBriefResult {
    if (parsed === null || typeof parsed !== "object") {
        throw new Error("Invalid model output: expected object");
    }
    const o = parsed as Record<string, unknown>;
    const headline = String(o.headline ?? "").trim();
    const overview = String(o.overview ?? "").trim();
    if (!headline || !overview) {
        throw new Error("Missing headline or overview");
    }
    const positioningBullets = Array.isArray(o.positioning_bullets)
        ? o.positioning_bullets
              .reduce<string[]>((acc, x) => {
                  const value = String(x ?? "").trim();
                  if (value) acc.push(value);
                  return acc;
              }, [])
              .slice(0, 8)
        : [];
    const opportunityActions = Array.isArray(o.opportunity_actions)
        ? o.opportunity_actions
              .reduce<Array<{ title: string; detail: string }>>((acc, a) => {
                  const row = a as Record<string, unknown>;
                  const title = String(row?.title ?? "").trim();
                  const detail = String(row?.detail ?? "").trim();
                  if (title && detail) acc.push({ title, detail });
                  return acc;
              }, [])
              .slice(0, 5)
        : [];
    const dataLimitations = String(o.data_limitations ?? "").trim();
    return {
        headline,
        overview,
        positioningBullets,
        opportunityActions,
        dataLimitations:
            dataLimitations ||
            "Analysis uses public listing data and your own Google metrics only; competitor search terms inside Google are not available.",
    };
}
