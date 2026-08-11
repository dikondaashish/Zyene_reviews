import { serializeJsonLd } from "@/lib/seo/serialize-json-ld";

/**
 * F6.5: the exact LocalBusiness JSON-LD to paste, built only from real,
 * verified business data (businesses table / GBP fetch — never invented).
 * A field we do not actually have a real value for becomes a placeholder
 * token, per PRD-7's explicit edge case: "AI proposes factual claims about
 * the business we cannot verify → briefs must use placeholders rather than
 * invented specifics." This module never calls an AI at all — there is
 * nothing here for a model to hallucinate into.
 */
export type BusinessSchemaFacts = {
    name: string | null;
    addressLine: string | null;
    locality: string | null;
    region: string | null;
    phone: string | null;
    website: string | null;
};

const PLACEHOLDER: Record<string, string> = {
    name: "{{insert your business name}}",
    address: "{{insert your business address}}",
    telephone: "{{insert your business phone number}}",
    url: "{{insert your website URL}}",
};

export function buildLocalBusinessSchemaPatch(facts: BusinessSchemaFacts): Record<string, unknown> {
    const address =
        facts.addressLine || facts.locality || facts.region
            ? {
                  "@type": "PostalAddress",
                  streetAddress: facts.addressLine || PLACEHOLDER.address,
                  addressLocality: facts.locality || PLACEHOLDER.address,
                  addressRegion: facts.region || PLACEHOLDER.address,
              }
            : PLACEHOLDER.address;

    return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: facts.name || PLACEHOLDER.name,
        address,
        telephone: facts.phone || PLACEHOLDER.telephone,
        url: facts.website || PLACEHOLDER.url,
    };
}

export function buildSchemaPatchScriptTag(facts: BusinessSchemaFacts): string {
    return `<script type="application/ld+json">${serializeJsonLd(buildLocalBusinessSchemaPatch(facts))}</script>`;
}

/** True when the patch contains at least one placeholder — the brief must disclose this rather than present it as ready to paste as-is. */
export function schemaPatchHasPlaceholders(facts: BusinessSchemaFacts): boolean {
    return !facts.name || !facts.phone || !facts.website || (!facts.addressLine && !facts.locality && !facts.region);
}
