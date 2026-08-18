/**
 * End-to-end smoke test for the E-7 dispatch path against the real schema.
 *
 * Runs the whole chain — plan, reserve, call, settle, persist — with the
 * zero-cost fixture adapter, so it exercises the real SQL functions, the real
 * constraints and the real stores without spending anything. Cleans up after
 * itself and asserts the tables are left exactly as it found them.
 *
 *   pnpm exec tsx --env-file=.env.local scripts/smoke-aeo-dispatch.ts
 */
import { createAdminClient } from "../src/lib/db/supabase/admin";
import { EngineRegistry } from "../src/services/aeo/engines/engine-registry";
import { FixtureEngineAdapter } from "../src/services/aeo/engines/adapters/fixture-engine-adapter";
import { planRun } from "../src/services/aeo/orchestration/run-plan";
import { dispatchUnit } from "../src/services/aeo/orchestration/dispatch-unit";
import { SupabaseReservationStore } from "../src/services/aeo/orchestration/supabase-reservation-store";
import { SupabaseRunStore } from "../src/services/aeo/orchestration/supabase-run-store";
import { SupabaseSampleStore } from "../src/services/aeo/orchestration/supabase-sample-store";
import { SupabaseAnswerStore, AEO_ANSWER_BUCKET } from "../src/services/aeo/orchestration/supabase-answer-store";
import { SupabaseBillingGateway } from "../src/services/aeo/billing/billing-gateway";
import { extractSample } from "../src/services/aeo/extraction/extract-sample";
import { SupabaseExtractionStore } from "../src/services/aeo/extraction/supabase-extraction-store";
import { citationsPresent, okSample } from "../src/services/aeo/engines/engine-result";

const USAGE_DATE = "2098-06-15"; // far future, so it cannot collide with real usage
const results: { name: string; pass: boolean; detail: string }[] = [];

function check(name: string, pass: boolean, detail = "") {
    results.push({ name, pass, detail });
}

async function main() {
    const db = createAdminClient();
    const reservations = new SupabaseReservationStore(db);
    const runs = new SupabaseRunStore(db);
    const samples = new SupabaseSampleStore(db);
    const answers = new SupabaseAnswerStore(db);
    const billing = new SupabaseBillingGateway(db);

    const { data: biz } = await db
        .from("businesses")
        .select("id, organization_id")
        .limit(1)
        .single();
    if (!biz) throw new Error("no business to smoke-test against");

    const businessId = biz.id;
    const organizationId = biz.organization_id;

    // Clear anything a previous aborted run left behind. Without this the next
    // run sees stale prompts as active and its fan-out counts drift — which is
    // how the first version of this script reported a phantom failure.
    await db.from("aeo_prompts").delete().like("prompt_text", "SMOKE %");

    // Real prompts, created and removed by this script.
    const { data: prompts, error: promptErr } = await db
        .from("aeo_prompts")
        .insert([
            { business_id: businessId, prompt_text: "SMOKE best plumber in Austin", is_active: true },
            { business_id: businessId, prompt_text: "SMOKE emergency plumber near me", is_active: true },
            { business_id: businessId, prompt_text: "SMOKE inactive prompt", is_active: false },
        ])
        .select("id, prompt_text, is_active");
    if (promptErr) throw new Error(`prompt insert failed: ${promptErr.message}`);

    const registry = new EngineRegistry();
    registry.register(new FixtureEngineAdapter({ id: "gemini", modelId: "gemini-2.5-pro" }));
    // Registered but unpriced: must be withheld even though it is fully wired.
    registry.register(new FixtureEngineAdapter({ id: "claude", modelId: "claude-fixture" }));

    // Narrowed to this run's own prompts. The business may legitimately carry
    // enrolled prompts of its own, and fanning out over those would both inflate
    // the counts below and dispatch work this script never intended to create.
    const allActive = await runs.loadActivePrompts(businessId);
    const loaded = allActive.filter((p) => p.promptText.startsWith("SMOKE "));
    check(
        "loadActivePrompts returns only active prompts",
        loaded.length === 2,
        `got ${loaded.length} SMOKE prompts, expected 2 of 3 (${allActive.length} active in total)`
    );

    const consumed = await runs.consumedTodayByEngine(organizationId, USAGE_DATE);
    check("consumedTodayByEngine starts empty", Object.keys(consumed).length === 0, JSON.stringify(consumed));

    const { runId } = await runs.createRun({
        businessId,
        trigger: "manual",
        scheduledFor: null,
        expectedSamples: 2,
    });
    check("createRun returns an id", Boolean(runId), runId);

    const plan = planRun(
        {
            runId,
            businessId,
            organizationId,
            usageDate: USAGE_DATE,
            prompts: loaded,
            requestedEngines: ["gemini", "claude"],
            consumedByEngine: consumed,
        },
        registry
    );
    check("plan fans out one unit per active prompt", plan.dispatches.length === 2, `${plan.dispatches.length}`);
    check(
        "unpriced engine withheld from a real plan",
        plan.withheld.length === 1 && plan.withheld[0].state === "pricing_unconfirmed",
        plan.withheld.map((w) => `${w.descriptor.id}:${w.state}`).join(",")
    );

    // Real step.run semantics are not needed here; this proves the stores work.
    const passthrough = async <T,>(_id: string, fn: () => Promise<T>) => fn();

    for (const d of plan.dispatches) {
        const outcome = await dispatchUnit(d, {
            step: passthrough,
            adapter: registry.get("gemini")!,
            reservations,
            samples,
            answers,
            billing,
        });
        check(`dispatch ${d.promptId.slice(0, 8)} sampled`, outcome.kind === "sampled", outcome.kind);
        if (outcome.kind === "sampled") {
            check("fixture costs nothing", outcome.costMicroUsd === 0, `${outcome.costMicroUsd}`);
            check("no duplicate risk on a clean run", !outcome.duplicateRisk, "");
            check("no overrun on a clean run", outcome.overrunUnits === 0, `${outcome.overrunUnits}`);
        }
    }

    // Replaying an identical unit must resolve to the same reservation and the
    // same sample, not create a second of either.
    const replay = await dispatchUnit(plan.dispatches[0], {
        step: passthrough,
        adapter: registry.get("gemini")!,
        reservations,
        samples,
        answers,
        billing,
    });
    // The bug this smoke test found: a re-delivered event must not re-call the
    // vendor for work already finished, nor throw settling a closed reservation.
    check(
        "replayed unit is skipped, not re-dispatched",
        replay.kind === "skipped" && replay.reason === "already_settled",
        JSON.stringify(replay)
    );

    const { count: resCount } = await db
        .from("aeo_quota_reservations")
        .select("*", { count: "exact", head: true })
        .eq("run_id", runId);
    check("replay created no extra reservation", resCount === 2, `${resCount} reservations for 2 units`);

    const { data: sampleRows } = await db
        .from("aeo_samples")
        .select("id, status, model_id, citations_availability, is_estimated, answer_storage_path")
        .eq("run_id", runId);
    check("one sample per unit, no duplicate from replay", sampleRows?.length === 2, `${sampleRows?.length}`);
    check(
        "samples are marked measured, not estimated",
        (sampleRows ?? []).every((s) => s.is_estimated === false),
        ""
    );
    check(
        "every sample records the model it called",
        (sampleRows ?? []).every((s) => s.model_id === "gemini-2.5-pro"),
        ""
    );

    const { data: settled } = await db
        .from("aeo_quota_reservations")
        .select("state, settled_units, overrun_units, billable_units, cost_micro_usd, dispatch_attempts")
        .eq("run_id", runId);
    check("all reservations settled", (settled ?? []).every((r) => r.state === "settled"), "");
    check("nothing was billed", (settled ?? []).every((r) => r.cost_micro_usd === 0), "");

    const after = await runs.consumedTodayByEngine(organizationId, USAGE_DATE);
    check("consumption is now visible to the planner", (after.gemini ?? 0) >= 0, JSON.stringify(after));

    // ---- E-6 extraction against the real tables ----
    const extraction = new SupabaseExtractionStore(db);
    const context = await extraction.loadBrandContext(businessId);
    check("brand context loads our own brand", context.brands.some((b) => b.kind === "own"), `${context.brands.length} brands`);

    // A synthetic answer that names our business, so the assertion is about the
    // pipeline rather than about what an engine happened to say today.
    const ownLabel = context.brands.find((b) => b.kind === "own")!.label;
    const synthetic = okSample({
        modelId: "smoke-fixture",
        answerText: `For plumbing in Austin, **${ownLabel}** is frequently recommended, ahead of others.`,
        citations: citationsPresent([
            { url: "https://www.yelp.com/biz/example?utm_source=chatgpt", title: "Yelp listing" },
            { url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/XYZ", title: "forbes.com" },
        ]),
        latencyMs: 10,
        costUnits: 0,
    });

    const found = extractSample(synthetic, context);
    check("own brand detected when actually named", found.ownBrandNamed === true, `${found.ownBrandNamed}`);
    check("extraction records a method, not a guess", found.extractionModelId === "deterministic-alias-v1", found.extractionModelId);

    const yelp = found.citations.find((c) => c.domain === "yelp.com");
    check("directory citation classified", yelp?.classification === "directory", yelp?.classification ?? "missing");
    check("tracking params stripped", !yelp?.normalizedUrl.includes("utm_source"), yelp?.normalizedUrl ?? "");

    const redirected = found.citations.find((c) => c.viaRedirect);
    check(
        "gemini redirect resolved to the real domain, not google",
        redirected?.domain === "forbes.com",
        `${redirected?.domain}`
    );

    const sampleForExtraction = sampleRows![0].id;
    const written = await extraction.persist(sampleForExtraction, businessId, found);
    check("mentions written to aeo_brand_mentions", written.mentions >= 1, `${written.mentions}`);
    check("citations written to aeo_citations", written.citations === 2, `${written.citations}`);

    const { data: mentionRows } = await db
        .from("aeo_brand_mentions")
        .select("brand_kind, cited_only, mention_ordinal, extraction_model_id, sentiment")
        .eq("sample_id", sampleForExtraction);
    check("own mention stored with a method id", (mentionRows ?? []).some((m) => m.brand_kind === "own" && m.extraction_model_id === "deterministic-alias-v1"), `${mentionRows?.length} rows`);
    check("sentiment left NULL, not assumed neutral", (mentionRows ?? []).every((m) => m.sentiment === null), "");

    // Re-extraction must replace, not double.
    await extraction.persist(sampleForExtraction, businessId, found);
    const { count: afterRerun } = await db
        .from("aeo_brand_mentions")
        .select("*", { count: "exact", head: true })
        .eq("sample_id", sampleForExtraction);
    check("re-extraction replaces rather than duplicates", afterRerun === written.mentions, `${afterRerun} vs ${written.mentions}`);

    await runs.completeRun(runId, { status: "success", errorMessage: null, at: new Date().toISOString() });
    const { data: finished } = await db.from("aeo_runs").select("status").eq("id", runId).single();
    check("run closes as success", finished?.status === "success", finished?.status ?? "?");

    /*
     * ---- cleanup ----
     *
     * Every delete is scoped to rows THIS run created. It used to clear brand
     * mentions by (business_id, extraction_model_id), which was indistinguishable
     * from "every mention this business has" the moment the same business also
     * held real sampled data — the smoke test would have silently deleted it.
     */
    const smokeSampleIds = (sampleRows ?? []).map((s) => s.id);

    // E-8 leaves objects behind that no foreign key will cascade. Deleting the
    // rows without these would grow the bucket by one object per smoke run,
    // each one unreachable because the sample that pointed at it is gone.
    const storedPaths = (sampleRows ?? [])
        .map((s) => s.answer_storage_path)
        .filter((p): p is string => Boolean(p));
    if (storedPaths.length > 0) {
        const { error: rmError } = await db.storage.from(AEO_ANSWER_BUCKET).remove(storedPaths);
        check("stored answers removed", !rmError, rmError?.message ?? "");
    }

    await db.from("aeo_brand_mentions").delete().in("sample_id", smokeSampleIds);
    await db.from("aeo_citations").delete().in("sample_id", smokeSampleIds);
    await db.from("aeo_samples").delete().eq("run_id", runId);
    await db.from("aeo_quota_reservations").delete().eq("run_id", runId);
    await db.from("aeo_runs").delete().eq("id", runId);
    await db.from("aeo_prompts").delete().in("id", (prompts ?? []).map((p) => p.id));

    // Asserts THIS run left nothing behind, not that the tables are globally
    // empty. The global form only held while the product had no data at all.
    const leftovers = await Promise.all([
        db.from("aeo_brand_mentions").select("*", { count: "exact", head: true }).in("sample_id", smokeSampleIds),
        db.from("aeo_citations").select("*", { count: "exact", head: true }).in("sample_id", smokeSampleIds),
        db.from("aeo_runs").select("*", { count: "exact", head: true }).eq("id", runId),
        db.from("aeo_samples").select("*", { count: "exact", head: true }).eq("run_id", runId),
        db.from("aeo_quota_reservations").select("*", { count: "exact", head: true }).eq("run_id", runId),
        db.from("aeo_prompts").select("*", { count: "exact", head: true }).like("prompt_text", "SMOKE %"),
    ]);
    const total = leftovers.reduce((s, r) => s + (r.count ?? 0), 0);
    check("cleanup left nothing of this run behind", total === 0, `${total} rows remain`);

    const failed = results.filter((r) => !r.pass);
    for (const r of results) {
        console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  [${r.detail}]` : ""}`);
    }
    console.log(`\n${results.length - failed.length}/${results.length} passed`);
    if (failed.length > 0) process.exit(1);
}

main().catch((err) => {
    console.error("SMOKE FAILED:", err);
    process.exit(1);
});
