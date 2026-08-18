import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { mapPromptToPage, type CrawledPageSummary } from "./prompt-page-mapping";
import { fetchCitedSource } from "./fetch-cited-source";
import { analyzeCitationGap, type OwnPageStructure } from "./analyze-citation-gap";
import { generateContentBrief } from "./generate-content-brief";
import { buildFaqJsonLdScriptTag, buildFaqHtml } from "./build-faq-schema";
import { buildSchemaPatchScriptTag, schemaPatchHasPlaceholders, type BusinessSchemaFacts } from "./build-schema-patch";
import { computeAnswerabilitySignals } from "../crawler/answerability";
import { validateSchemaBlocks } from "../crawler/schema-validator";
import { isIdentityType } from "../crawler/schema-validator";
import { SupabaseBriefStore } from "./supabase-brief-store";
import { mineReviewThemes } from "./review-mining";

type Admin = SupabaseClient<Database>;

/** Real citations only, deduped, capped — each one is a real outbound fetch that costs time and (via Gemini) money. */
const MAX_CITED_SOURCES = 5;

export type GenerateBriefResult =
    | { ok: false; reason: "prompt_not_found" | "business_not_found" | "generation_failed" }
    | { ok: true; briefId: string };

export async function generateAndStoreBrief(
    db: Admin,
    input: { businessId: string; promptId: string }
): Promise<GenerateBriefResult> {
    const { data: prompt } = await db
        .from("aeo_prompts")
        .select("id, prompt_text")
        .eq("id", input.promptId)
        .eq("business_id", input.businessId)
        .maybeSingle();
    if (!prompt) return { ok: false, reason: "prompt_not_found" };

    const { data: business } = await db
        .from("businesses")
        .select("name, address_line1, city, state, phone, website")
        .eq("id", input.businessId)
        .maybeSingle();
    if (!business) return { ok: false, reason: "business_not_found" };

    const store = new SupabaseBriefStore(db);

    // --- F6.2: which page owns this prompt, if any ---
    const { data: latestRun } = await db
        .from("crawl_runs")
        .select("id")
        .eq("business_id", input.businessId)
        .in("status", ["success", "partial"])
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    const { data: pageRows } = latestRun
        ? await db
              .from("crawl_pages")
              .select("url, title, content_storage_path")
              .eq("crawl_run_id", latestRun.id)
        : { data: [] };

    const pageSummaries: CrawledPageSummary[] = (pageRows ?? []).map((p) => ({
        url: p.url,
        title: p.title,
        contentExcerpt: "", // title-only ranking — see prompt-page-mapping.ts's doc comment.
    }));
    const mapping = mapPromptToPage(prompt.prompt_text, pageSummaries);

    let ownStructure: OwnPageStructure = null;
    let ownPageExcerpt: string | null = null;
    if (mapping.hasOwner) {
        const matchedRow = (pageRows ?? []).find((p) => p.url === mapping.url);
        const html = matchedRow?.content_storage_path ? await store.loadPageHtml(matchedRow.content_storage_path) : null;
        if (html) {
            ownPageExcerpt = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1200) || null;
            const answerability = computeAnswerabilitySignals(html);
            const schema = validateSchemaBlocks(html);
            ownStructure = {
                hasFaqSchema: schema.entitiesFound.some((e) => e.type === "FAQPage"),
                hasQuestionHeadings: answerability.questionHeadingCount > 0,
                hasDirectAnswer: answerability.hasDirectAnswerParagraph,
                hasLocalBusinessSchema: schema.entitiesFound.some((e) => isIdentityType(e.type)),
            };
        }
    }

    // --- F6.1: fetch and structure what actually gets cited for this prompt ---
    const { data: sampleRows } = await db
        .from("aeo_samples")
        .select("id")
        .eq("business_id", input.businessId)
        .eq("prompt_id", input.promptId)
        .eq("status", "ok");

    const sampleIds = (sampleRows ?? []).map((s) => s.id);
    const { data: citationRows } = sampleIds.length
        ? await db
              .from("aeo_citations")
              .select("url")
              .eq("business_id", input.businessId)
              .neq("classification", "own")
              .in("sample_id", sampleIds)
        : { data: [] };

    const citedUrls = [...new Set((citationRows ?? []).map((c) => c.url))].slice(0, MAX_CITED_SOURCES);
    const citedResults = await Promise.all(citedUrls.map((url) => fetchCitedSource(url)));
    const citedForGap = citedResults.map((r) => (r.ok ? { ok: true as const, structure: r.structure } : { ok: false as const }));

    const gap = analyzeCitationGap(ownStructure, citedForGap);
    const { data: reviewRows } = await db.from("reviews").select("text").eq("business_id", input.businessId)
        .not("text", "is", null).order("review_date", { ascending: false }).limit(200);
    const reviewInsights = mineReviewThemes((reviewRows ?? []).flatMap((row) => typeof row.text === "string" ? [row.text] : []));

    // --- Gemini: the qualitative edit checklist + FAQ copy ---
    let generated;
    try {
        generated = await generateContentBrief({
            promptText: prompt.prompt_text,
            businessName: business.name ?? "this business",
            gap,
            citedSources: citedForGap,
            ownPageExcerpt,
            reviewInsights,
        });
    } catch {
        return { ok: false, reason: "generation_failed" };
    }

    // --- Deterministic outputs: never AI-generated, built from real data or explicit placeholders ---
    const faqJsonLd = buildFaqJsonLdScriptTag(generated.faqItems);
    const faqHtml = buildFaqHtml(generated.faqItems);
    const facts: BusinessSchemaFacts = {
        name: business.name,
        addressLine: business.address_line1,
        locality: business.city,
        region: business.state,
        phone: business.phone,
        website: business.website,
    };
    const schemaPatchJsonLd = buildSchemaPatchScriptTag(facts);

    const result = await store.persist({
        businessId: input.businessId,
        promptId: input.promptId,
        targetPageUrl: mapping.hasOwner ? mapping.url : null,
        hasOwningPage: mapping.hasOwner,
        editItems: generated.editItems,
        faqItems: generated.faqItems,
        faqJsonLd,
        faqHtml,
        schemaPatchJsonLd,
        schemaPatchHasPlaceholders: schemaPatchHasPlaceholders(facts),
        confidence: gap.allSourcesUnreachable ? "low" : "high",
        citedSourceCount: citedUrls.length,
        rewriteBefore: generated.rewriteBefore,
        rewriteAfter: generated.rewriteAfter,
        reviewInsights,
    });

    return { ok: true, briefId: result.id };
}
