import { generateContentWithFallback } from "@/domains/ai/adapters/vertex-adapter";
import type { GoogleServiceItem } from "@/services/google/listing-information";
import { listAllLocalPosts, PUBLISHED_POST_STATES } from "@/services/google/local-posts";
import { serviceDescription, serviceDisplayName } from "@/services/aeo/technical-audit/gbp-audit-signals";
import {
    buildPostDraftsPrompt,
    buildServiceDescriptionsPrompt,
    postDraftsSchema,
    serviceDescriptionsSchema,
} from "./gbp-content-prompts";

/**
 * F6.6 generation, split from the HTTP handler so the part that decides what
 * reaches a customer's Google listing is testable without a request.
 */

export type GbpContext = { businessName: string; category: string; city: string | null };

export type ServiceDraft = { name: string; description: string };
export type PostDraft = { topicType: string; summary: string; rationale: string };

/** Google's own cap on a service description. */
const SERVICE_DESCRIPTION_MAX = 300;

/** Bounded so one click cannot turn into an unbounded generation. */
const MAX_SERVICES_PER_RUN = 12;

function parseJson<T>(raw: string): T | null {
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

/**
 * Describes services the merchant already lists. Never proposes new ones — a
 * service invented here would be published to a public listing as a claim the
 * business offers something it does not.
 */
export async function generateServiceDescriptions(
    items: GoogleServiceItem[],
    context: GbpContext
): Promise<{ services: ServiceDraft[] } | { error: string }> {
    const undescribed = items
        .map((item) => ({
            name: serviceDisplayName(item) || item.structuredServiceItem?.serviceTypeId || "",
            described: serviceDescription(item).length > 0,
        }))
        .filter((s) => s.name && !s.described)
        .map((s) => s.name)
        .slice(0, MAX_SERVICES_PER_RUN);

    if (undescribed.length === 0) {
        return {
            error:
                items.length === 0
                    ? "No services are listed on your Google Business Profile yet. Add them on Google first, then come back."
                    : "Every service on your profile already has a description.",
        };
    }

    const raw = await generateContentWithFallback(
        buildServiceDescriptionsPrompt({ ...context, serviceNames: undescribed }),
        { schema: serviceDescriptionsSchema, requireJson: true, maxOutputTokens: 2048, temperature: 0.5 }
    );

    const payload = parseJson<{ services?: { name?: string; description?: string }[] }>(raw);
    const requested = new Set(undescribed);

    const services = (payload?.services ?? [])
        .filter((s): s is ServiceDraft => Boolean(s.name && s.description))
        // Only names we actually asked about: a hallucinated service must not
        // reach the merchant, even as a suggestion.
        .filter((s) => requested.has(s.name))
        .map((s) => ({ ...s, description: s.description.slice(0, SERVICE_DESCRIPTION_MAX) }));

    if (services.length === 0) {
        return { error: "The model returned no usable service descriptions. Please try again." };
    }
    return { services };
}

/** Drafts posts, informed by what the business has already published. */
export async function generatePostDrafts(
    google: { accessToken: string; accountId: string | null; locationId: string },
    context: GbpContext,
    topKeywords: string[]
): Promise<{ posts: PostDraft[] } | { error: string }> {
    let recentSummaries: string[] = [];
    if (google.accountId) {
        const posts = await listAllLocalPosts(google.accessToken, google.accountId, google.locationId);
        recentSummaries = posts
            .filter((p) => PUBLISHED_POST_STATES.has(p.state ?? ""))
            .map((p) => p.summary ?? "")
            .filter(Boolean)
            .slice(0, 8);
    }

    const keywords = topKeywords.map((k) => k.trim()).filter(Boolean).slice(0, 8);

    const raw = await generateContentWithFallback(
        buildPostDraftsPrompt({ ...context, recentSummaries, keywords }),
        { schema: postDraftsSchema, requireJson: true, maxOutputTokens: 2048, temperature: 0.7 }
    );

    const payload = parseJson<{ posts?: { topicType?: string; summary?: string; rationale?: string }[] }>(raw);
    const posts = (payload?.posts ?? [])
        .filter((p): p is PostDraft => Boolean(p.topicType && p.summary && p.rationale))
        .slice(0, 3);

    if (posts.length === 0) return { error: "The model returned no usable post drafts. Please try again." };
    return { posts };
}
