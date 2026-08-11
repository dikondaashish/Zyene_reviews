import { MIN_OBSERVATIONS } from "./visibility-metrics";

/**
 * F3.2: SoV = our mentions / total tracked-brand mentions. "Tracked" means
 * the business's own configured competitor set (competitors table), not open
 * brand extraction — see supabase-extraction-store.ts's loadBrandContext.
 * That is a real, honest SoV among the brands this business chose to track,
 * not the PRD's aspirational "every brand named, fuzzy-matched into an
 * emerging-competitor bucket" — that extraction does not exist yet, and this
 * module must not imply it does.
 */

/** PRD-3 edge case: "Only 1 competitor configured... below 3, the metric misleads." */
export const MIN_COMPETITORS_FOR_SOV = 3;

export type BrandMentionFact = {
    sampleId: string;
    brandKind: "own" | "competitor";
    competitorId: string | null;
    brandLabel: string;
};

export type BrandShare = {
    competitorId: string | null;
    label: string;
    mentions: number;
    share: number;
};

export type ShareOfVoiceResult =
    | { suppressed: true; reason: "insufficient_competitors"; competitorCount: number; required: number }
    | { suppressed: true; reason: "insufficient_observations"; observations: number; required: number }
    | { suppressed: true; reason: "no_brands_named"; observations: number }
    | {
          suppressed: false;
          observations: number;
          totalTrackedMentions: number;
          /** Observations where no tracked brand (own or competitor) was named at all — its own signal, per PRD-3. */
          noBrandNamedCount: number;
          ownShare: number;
          ranking: BrandShare[];
      };

export function computeShareOfVoice(input: {
    observationSampleIds: readonly string[];
    mentions: readonly BrandMentionFact[];
    competitorCount: number;
}): ShareOfVoiceResult {
    const observations = input.observationSampleIds.length;

    if (input.competitorCount < MIN_COMPETITORS_FOR_SOV) {
        return { suppressed: true, reason: "insufficient_competitors", competitorCount: input.competitorCount, required: MIN_COMPETITORS_FOR_SOV };
    }
    if (observations < MIN_OBSERVATIONS) {
        return { suppressed: true, reason: "insufficient_observations", observations, required: MIN_OBSERVATIONS };
    }

    const byBrand = new Map<string, BrandShare>();
    const samplesWithMention = new Set<string>();

    for (const m of input.mentions) {
        samplesWithMention.add(m.sampleId);
        const key = m.competitorId ?? "own";
        const existing = byBrand.get(key);
        if (existing) {
            existing.mentions += 1;
        } else {
            byBrand.set(key, { competitorId: m.competitorId, label: m.brandLabel, mentions: 1, share: 0 });
        }
    }

    const totalTrackedMentions = [...byBrand.values()].reduce((sum, b) => sum + b.mentions, 0);
    const noBrandNamedCount = observations - samplesWithMention.size;

    if (totalTrackedMentions === 0) {
        return { suppressed: true, reason: "no_brands_named", observations };
    }

    const ranking = [...byBrand.values()]
        .map((b) => ({ ...b, share: b.mentions / totalTrackedMentions }))
        .sort((a, b) => b.mentions - a.mentions);

    const own = byBrand.get("own");

    return {
        suppressed: false,
        observations,
        totalTrackedMentions,
        noBrandNamedCount,
        ownShare: own ? own.mentions / totalTrackedMentions : 0,
        ranking,
    };
}
