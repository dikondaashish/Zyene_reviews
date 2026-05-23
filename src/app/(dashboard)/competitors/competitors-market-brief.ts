export function parseCompetitorsMarketBrief(rawBrief: Record<string, unknown> | null) {
    if (!rawBrief || typeof rawBrief !== "object" || !rawBrief.id) return null;
    const bullets = Array.isArray(rawBrief.positioning_bullets)
        ? rawBrief.positioning_bullets.map((x) => String(x ?? "")).filter(Boolean)
        : [];
    const actions = Array.isArray(rawBrief.opportunity_actions)
        ? rawBrief.opportunity_actions
              .map((a) => {
                  const o = a as Record<string, unknown>;
                  return { title: String(o.title ?? "").trim(), detail: String(o.detail ?? "").trim() };
              })
              .filter((a) => a.title && a.detail)
        : [];
    return {
        id: String(rawBrief.id),
        headline: String(rawBrief.headline ?? ""),
        overview: String(rawBrief.overview ?? ""),
        positioning_bullets: bullets,
        opportunity_actions: actions,
        data_limitations: rawBrief.data_limitations != null ? String(rawBrief.data_limitations) : null,
        model: rawBrief.model != null ? String(rawBrief.model) : null,
        created_at: String(rawBrief.created_at ?? ""),
    };
}
