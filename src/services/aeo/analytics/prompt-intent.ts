export type PromptClassification = {
    intent: "discovery" | "comparison" | "transactional" | "branded";
    funnelStage: "awareness" | "consideration" | "decision" | "retention";
};

export function classifyPrompt(prompt: string, brandNames: readonly string[]): PromptClassification {
    const text = prompt.toLowerCase();
    const branded = brandNames.some((brand) => brand.trim() && text.includes(brand.toLowerCase()));
    if (/\b(vs\.?|versus|compare|comparison|alternative|better than)\b/.test(text)) {
        return { intent: "comparison", funnelStage: "consideration" };
    }
    if (/\b(book|buy|schedule|appointment|quote|hire|call|today|open now|near me)\b/.test(text)) {
        return { intent: "transactional", funnelStage: "decision" };
    }
    if (branded) return { intent: "branded", funnelStage: "consideration" };
    return { intent: "discovery", funnelStage: "awareness" };
}
