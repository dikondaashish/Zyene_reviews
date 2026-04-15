import { Schema, Type as SchemaType } from "@google/genai";
import { generateContentWithFallback } from "@/domains/ai/adapters/VertexAdapter";
import {
    parseMarketPositioningBriefPayload,
    type MarketPositioningBriefResult,
} from "@/lib/competitors/market-positioning-brief-result";

export type { MarketPositioningBriefResult };

export type MarketPositioningBriefInput = {
    businessName: string;
    yourRating: number | null;
    yourReviewCount: number | null;
    yourTopKeywords: Array<{ keyword: string; impressions: number }>;
    keywordDiscoveryPct: number;
    keywordDirectPct: number;
    competitors: Array<{
        name: string;
        rating: number | null;
        reviewCount: number | null;
        primaryCategory: string | null;
        typesPreview: string | null;
        publicSummary: string | null;
    }>;
};

const MODEL =
    process.env.GOOGLE_AI_LITE_MODEL?.trim() || "gemini-3.1-flash-lite-preview";

const marketBriefSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        headline: {
            type: SchemaType.STRING,
            description: "Short punchy title for the brief (max ~12 words).",
        },
        overview: {
            type: SchemaType.STRING,
            description: "2-4 sentences grounding the competitive picture with ONLY the supplied numbers.",
        },
        positioning_bullets: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "3-5 bullets comparing positioning; no invented metrics.",
        },
        opportunity_actions: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    title: { type: SchemaType.STRING },
                    detail: { type: SchemaType.STRING },
                },
                required: ["title", "detail"],
            },
            description: "2-4 concrete next steps for the owner.",
        },
        data_limitations: {
            type: SchemaType.STRING,
            description:
                "One honest sentence: data is from public Maps/Places listings and the user's own GBP keywords — not competitors' private dashboards.",
        },
    },
    required: [
        "headline",
        "overview",
        "positioning_bullets",
        "opportunity_actions",
        "data_limitations",
    ],
};

function buildPrompt(input: MarketPositioningBriefInput): string {
    const kwLines =
        input.yourTopKeywords.length > 0
            ? input.yourTopKeywords
                  .slice(0, 15)
                  .map((k, i) => `${i + 1}. "${k.keyword}" — ${k.impressions} impressions (monthly bucket)`)
            : ["(no keyword impression data synced yet)"];

    const compLines = input.competitors.map((c, i) => {
        const parts = [
            `${i + 1}. ${c.name}`,
            `   Rating: ${c.rating != null ? c.rating.toFixed(1) : "unknown"}`,
            `   Reviews (public total): ${c.reviewCount ?? "unknown"}`,
            c.primaryCategory ? `   Primary category (Places): ${c.primaryCategory}` : null,
            c.typesPreview ? `   Place types: ${c.typesPreview}` : null,
            c.publicSummary ? `   Public description snippet: ${c.publicSummary.slice(0, 280)}` : null,
        ].filter(Boolean);
        return parts.join("\n");
    });

    return [
        "You help local businesses interpret competitor context using ONLY the facts below.",
        "Do NOT claim access to competitors' private Google Business Profile search queries, ads, or internal analytics.",
        "Do NOT invent ratings, review counts, or rankings not listed below.",
        "You MAY infer soft positioning themes (e.g. price tier, cuisine style) only when clearly supported by category names or the public description text provided.",
        "",
        `Business name: ${input.businessName}`,
        `Our public average rating (stored): ${input.yourRating != null ? input.yourRating.toFixed(1) : "unknown"}`,
        `Our total reviews (stored): ${input.yourReviewCount ?? "unknown"}`,
        "",
        "Our Google Business Profile search terms (impressions — our listing only):",
        ...kwLines,
        "",
        `Heuristic split of our keyword impressions (name/brand vs discovery): ${input.keywordDirectPct}% brand/name vs ${input.keywordDiscoveryPct}% broader discovery (approximate).`,
        "",
        `Tracked competitors (${input.competitors.length}), public Places-style fields:`,
        ...compLines,
        "",
        "Output JSON matching the schema. Be specific and practical; stay humble where data is thin.",
    ].join("\n");
}

export async function generateMarketPositioningBrief(
    input: MarketPositioningBriefInput
): Promise<MarketPositioningBriefResult | null> {
    if (input.competitors.length === 0) {
        return null;
    }

    const prompt = buildPrompt(input);
    const strictPrompt = [
        prompt,
        "",
        "IMPORTANT: Output ONLY raw JSON. No markdown, no code fences.",
    ].join("\n");

    const fallback: MarketPositioningBriefResult = {
        headline: `Positioning snapshot: ${input.businessName} vs ${input.competitors.length} tracked listings`,
        overview:
            "We only have public rating and review totals plus your own search-term impressions. Use Sync from Google to refresh competitor listing details, then regenerate this brief for richer context.",
        positioningBullets: input.competitors.slice(0, 3).map((c) => {
            const r = c.rating != null ? `${c.rating.toFixed(1)} stars` : "unknown rating";
            const n = c.reviewCount ?? "?";
            return `${c.name}: ${r}, ${n} reviews (public)${c.primaryCategory ? ` — ${c.primaryCategory}` : ""}`;
        }),
        opportunityActions: [
            {
                title: "Refresh competitor listing data",
                detail: "Run Sync from Google so categories and descriptions stay current for apples-to-apples comparison.",
            },
            {
                title: "Defend review velocity",
                detail: "Compare review count gaps and run a focused review request campaign where you trail peers.",
            },
        ],
        dataLimitations:
            "Competitors' private GBP search keywords and ads are not available through any API; this brief uses public listing fields and your own keyword data only.",
    };

    const tryOnce = async (p: string) => {
        const raw = await generateContentWithFallback(p, {
            requireJson: true,
            schema: marketBriefSchema,
            modelOverride: MODEL,
            maxOutputTokens: 900,
            temperature: 0.35,
        });
        return parseMarketPositioningBriefPayload(JSON.parse(raw));
    };

    try {
        return await tryOnce(prompt);
    } catch (e) {
        console.warn("[generateMarketPositioningBrief] primary failed:", e);
    }

    try {
        return await tryOnce(strictPrompt);
    } catch (e) {
        console.error("[generateMarketPositioningBrief] fallback text path:", e);
        return fallback;
    }
}
