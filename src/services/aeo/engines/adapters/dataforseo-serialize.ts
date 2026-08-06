import type { DataForSeoItem } from "./dataforseo-client";

/**
 * Turning a ranked SERP into text the brand matcher can read.
 *
 * This is the one place a search surface is made to fit the answer-engine
 * contract, so the rules are worth stating:
 *
 * 1. Only what DataForSEO returned goes in, in the order it returned it. No
 *    scoring, no summarising, no inference. The serialisation is EVIDENCE — a
 *    human reading a stored sample sees the SERP as it was.
 * 2. The local pack comes before organic results, because that is the order
 *    Google presents them and prominence is measured by position.
 * 3. Nothing here decides whether a brand is visible. That stays in E-6, for
 *    the same reason it does for every other engine.
 */

export type SerializedSurface = {
    text: string;
    sources: { url: string; title: string | null }[];
};

/** Local pack entries have no URL, so their name carries the brand signal. */
function localPackLine(item: DataForSeoItem, index: number): string | null {
    const title = item.title?.trim();
    if (!title) return null;
    const rating = item.rating?.value;
    const votes = item.rating?.votes_count;
    const suffix =
        rating !== undefined ? ` — ${rating}★${votes !== undefined ? ` (${votes} reviews)` : ""}` : "";
    return `${index}. ${title}${suffix}`;
}

function organicLine(item: DataForSeoItem, index: number): string | null {
    const title = item.title?.trim();
    if (!title) return null;
    const snippet = (item.description ?? item.snippet ?? "").trim();
    const domain = item.domain?.trim();
    return [
        `${index}. ${title}`,
        domain ? ` [${domain}]` : "",
        snippet ? ` — ${snippet}` : "",
    ].join("");
}

export function serializeSerp(items: readonly DataForSeoItem[]): SerializedSurface {
    const localPack = items.filter((i) => i.type === "local_pack");
    const organic = items.filter((i) => i.type === "organic");

    const sections: string[] = [];
    const sources: { url: string; title: string | null }[] = [];

    if (localPack.length > 0) {
        const lines = localPack
            .map((item, i) => localPackLine(item, i + 1))
            .filter((line): line is string => line !== null);
        if (lines.length > 0) sections.push(`Local pack:\n${lines.join("\n")}`);

        // Local pack entries sometimes carry a URL; when they do it is the
        // business's own site, which is exactly what citation attribution wants.
        for (const item of localPack) {
            if (item.url) sources.push({ url: item.url, title: item.title?.trim() || null });
        }
    }

    if (organic.length > 0) {
        const lines = organic
            .map((item, i) => organicLine(item, i + 1))
            .filter((line): line is string => line !== null);
        if (lines.length > 0) sections.push(`Organic results:\n${lines.join("\n")}`);

        for (const item of organic) {
            if (item.url) sources.push({ url: item.url, title: item.title?.trim() || null });
        }
    }

    return { text: sections.join("\n\n"), sources };
}

/**
 * AI Overview text lives in nested `items`, and its sources in `references`.
 *
 * References are the honest citation list here: they are what Google said the
 * overview was built from. Organic results on the same page are NOT folded in —
 * appearing below an overview is not the same as being cited by it, and merging
 * them would inflate citation share.
 */
export function serializeAiOverview(overview: DataForSeoItem): SerializedSurface {
    const text = (overview.items ?? [])
        .map((part) => part.text?.trim())
        .filter((part): part is string => Boolean(part))
        .join("\n\n");

    const sources = (overview.references ?? [])
        .map((ref) => ({
            url: ref.url?.trim() ?? "",
            title: ref.title?.trim() || ref.source?.trim() || null,
        }))
        .filter((ref) => ref.url.length > 0);

    return { text: text || (overview.text?.trim() ?? ""), sources };
}
