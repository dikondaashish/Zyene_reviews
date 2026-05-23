/**
 * Normalized competitor AI insight shape + safe parsing from model JSON.
 * Used by generateCompetitorInsight and unit tests (malformed output handling).
 */

export type CompetitorInsightResult = {
    summary: string;
    whyItMatters: string;
    ownerSuggestion: "owner" | "manager" | "ops";
    actions: Array<{ title: string; impact: string; effort: string; priority: string }>;
    priority: "low" | "medium" | "high";
    confidence: number;
    recommendations: string[];
};

export function normalizeInsightPriority(value: string | null | undefined): "low" | "medium" | "high" {
    const v = String(value || "").toLowerCase().trim();
    if (v === "high") return "high";
    if (v === "medium") return "medium";
    return "low";
}

export function normalizeOwnerSuggestion(value: string | null | undefined): "owner" | "manager" | "ops" {
    const v = String(value || "").toLowerCase().trim();
    if (v === "owner" || v === "manager") return v;
    return "ops";
}

/**
 * Parses JSON object from Gemini (after JSON.parse). Throws if summary is unusable.
 */
export function parseCompetitorInsightPayload(parsed: unknown): CompetitorInsightResult {
    if (parsed === null || typeof parsed !== "object") {
        throw new Error("Invalid model output: expected object");
    }
    const o = parsed as Record<string, unknown>;
    const summary = String(o.summary ?? "").trim();
    if (!summary) {
        throw new Error("Missing summary from model output");
    }
    const confidenceRaw = Number(o.confidence);
    const confidence = Number.isFinite(confidenceRaw) ? Math.min(1, Math.max(0, confidenceRaw)) : 0.5;
    const recommendations = Array.isArray(o.recommendations)
        ? o.recommendations
              .reduce<string[]>((acc, r) => {
                  const value = String(r ?? "").trim();
                  if (value) acc.push(value);
                  return acc;
              }, [])
              .slice(0, 3)
        : [];
    const whyItMatters =
        String(o.why_it_matters ?? "").trim() || "This change can influence local customer decisions.";
    const actions = Array.isArray(o.actions)
        ? o.actions
              .reduce<
                  Array<{
                      title: string;
                      impact: string;
                      effort: string;
                      priority: string;
                  }>
              >((acc, a) => {
                  const row = a as Record<string, unknown>;
                  const title = String(row?.title ?? "").trim();
                  const impact = String(row?.impact ?? "").trim();
                  if (!title || !impact) return acc;
                  acc.push({
                      title,
                      impact,
                      effort: String(row?.effort ?? "").trim().toLowerCase() || "medium",
                      priority: String(row?.priority ?? "").trim().toLowerCase() || "medium",
                  });
                  return acc;
              }, [])
              .slice(0, 3)
        : [];
    return {
        summary,
        whyItMatters,
        ownerSuggestion: normalizeOwnerSuggestion(
            typeof o.owner_suggestion === "string" ? o.owner_suggestion : undefined
        ),
        actions,
        priority: normalizeInsightPriority(typeof o.priority === "string" ? o.priority : undefined),
        confidence,
        recommendations,
    };
}
