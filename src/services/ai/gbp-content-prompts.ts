import { Schema, Type as SchemaType } from "@google/genai";

/**
 * F6.6 — prompts and response schemas for the services and posts optimizers.
 *
 * Kept separate from the API handler so the wording a customer's Google
 * listing ends up carrying is reviewable on its own, next to the schema that
 * constrains it.
 *
 * Every prompt here inherits the anti-fabrication rule the content briefs
 * established: the model may only rephrase and structure what it was given.
 * A specific it was not handed — a price, a guarantee, a certification, an
 * opening time — must come back as a `{{placeholder}}` for the merchant to
 * fill, never as an invented fact published to their public listing.
 */

const NO_FABRICATION = [
    "Never state a price, discount, guarantee, award, certification, years in business,",
    "staff count, or opening time unless it appears verbatim in the data above.",
    "Where such a specific would strengthen the text, emit a placeholder in double",
    "curly braces, for example {{insert your weekend hours}}, and keep going.",
    "Never invent a service the business does not offer.",
    "No emojis. No hype superlatives. No claims about being the best or number one.",
].join(" ");

export const serviceDescriptionsSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        services: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING, description: "The service name, copied exactly from the input." },
                    description: {
                        type: SchemaType.STRING,
                        description: "A 250-300 character description of this service.",
                    },
                },
                required: ["name", "description"],
            },
        },
    },
    required: ["services"],
};

export const postDraftsSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        posts: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    topicType: {
                        type: SchemaType.STRING,
                        description: "One of: STANDARD, EVENT, OFFER.",
                    },
                    summary: {
                        type: SchemaType.STRING,
                        description: "The post body, 150-300 characters.",
                    },
                    rationale: {
                        type: SchemaType.STRING,
                        description: "One sentence on why this post is worth publishing now.",
                    },
                },
                required: ["topicType", "summary", "rationale"],
            },
        },
    },
    required: ["posts"],
};

export function buildServiceDescriptionsPrompt(input: {
    businessName: string;
    category: string;
    city: string | null;
    /** Services the merchant genuinely lists on Google, and which lack copy. */
    serviceNames: string[];
}): string {
    return [
        "You are a local SEO and AEO copywriter writing Google Business Profile service descriptions.",
        "",
        `Business: ${input.businessName}`,
        `Primary category: ${input.category}`,
        `Location: ${input.city ?? "Not provided"}`,
        "",
        "Write one description for EACH of these services, and only these services:",
        ...input.serviceNames.map((name) => `- ${name}`),
        "",
        "Requirements:",
        "- Google's limit is 300 characters per description. Stay between 250 and 300.",
        "- Lead with what the customer gets, not with the business name.",
        "- Include the service term naturally so answer engines can match it to a question.",
        `- ${NO_FABRICATION}`,
        "- Copy each service name back exactly as given so the output can be matched to the input.",
    ].join("\n");
}

export function buildPostDraftsPrompt(input: {
    businessName: string;
    category: string;
    city: string | null;
    /** Real recent post bodies, so drafts do not repeat what is already live. */
    recentSummaries: string[];
    /** Tracked search keywords worth working in naturally. */
    keywords: string[];
}): string {
    return [
        "You are a local SEO and AEO copywriter drafting Google Business Profile posts.",
        "",
        `Business: ${input.businessName}`,
        `Primary category: ${input.category}`,
        `Location: ${input.city ?? "Not provided"}`,
        `Keywords worth covering: ${input.keywords.length ? input.keywords.join(", ") : "None tracked yet"}`,
        "",
        input.recentSummaries.length
            ? `Recently published posts — do NOT repeat these themes:\n${input.recentSummaries
                  .map((s) => `- ${s.slice(0, 200)}`)
                  .join("\n")}`
            : "This business has not posted recently.",
        "",
        "Write 3 distinct post drafts.",
        "",
        "Requirements:",
        "- 150 to 300 characters each.",
        "- Use topicType STANDARD unless the post is genuinely an event or an offer.",
        "- An OFFER post must express the offer itself as a placeholder, since we cannot know the terms.",
        `- ${NO_FABRICATION}`,
    ].join("\n");
}
