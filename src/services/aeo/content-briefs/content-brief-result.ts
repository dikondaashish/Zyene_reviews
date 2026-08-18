export type ContentBriefResult = {
    editItems: Array<{ category: string; description: string }>;
    faqItems: Array<{ question: string; answer: string }>;
    rewriteBefore: string;
    rewriteAfter: string;
};

/** Same defensive-parse shape as market-positioning-brief-result.ts — never trust the model's JSON to match the schema exactly. */
export function parseContentBriefPayload(parsed: unknown): ContentBriefResult {
    if (parsed === null || typeof parsed !== "object") {
        throw new Error("Invalid model output: expected object");
    }
    const o = parsed as Record<string, unknown>;

    const editItems = Array.isArray(o.edit_items)
        ? o.edit_items
              .reduce<Array<{ category: string; description: string }>>((acc, item) => {
                  const row = item as Record<string, unknown>;
                  const category = String(row?.category ?? "").trim();
                  const description = String(row?.description ?? "").trim();
                  if (category && description) acc.push({ category, description });
                  return acc;
              }, [])
              .slice(0, 10)
        : [];

    const faqItems = Array.isArray(o.faq_items)
        ? o.faq_items
              .reduce<Array<{ question: string; answer: string }>>((acc, item) => {
                  const row = item as Record<string, unknown>;
                  const question = String(row?.question ?? "").trim();
                  const answer = String(row?.answer ?? "").trim();
                  if (question && answer) acc.push({ question, answer });
                  return acc;
              }, [])
              .slice(0, 8)
        : [];
    const rewriteBefore = String(o.rewrite_before ?? "").trim();
    const rewriteAfter = String(o.rewrite_after ?? "").trim();

    if (editItems.length < 3) {
        throw new Error("Model must return at least three concrete edit items");
    }

    if (!rewriteAfter) throw new Error("Model must return a concrete rewrite suggestion");
    return { editItems, faqItems, rewriteBefore, rewriteAfter };
}
