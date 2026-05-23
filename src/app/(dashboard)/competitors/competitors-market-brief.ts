export function parseCompetitorsMarketBrief(rawBrief: Record<string, unknown> | null) {
    if (!rawBrief || typeof rawBrief !== "object" || !rawBrief.id) return null;
    const bullets = Array.isArray(rawBrief.positioning_bullets)
        ? rawBrief.positioning_bullets.reduce<string[]>((acc, x) => {
              const value = String(x ?? "");
              if (value) acc.push(value);
              return acc;
          }, [])
        : [];
    const actions = Array.isArray(rawBrief.opportunity_actions)
        ? rawBrief.opportunity_actions.reduce<Array<{ title: string; detail: string }>>((acc, a) => {
              const o = a as Record<string, unknown>;
              const title = String(o.title ?? "").trim();
              const detail = String(o.detail ?? "").trim();
              if (title && detail) acc.push({ title, detail });
              return acc;
          }, [])
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
