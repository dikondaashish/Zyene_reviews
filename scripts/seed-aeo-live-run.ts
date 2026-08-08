/**
 * Runs ONE real sampling cycle against the live vendors and LEAVES THE DATA.
 *
 *   pnpm exec tsx --env-file=.env.local scripts/seed-aeo-live-run.ts --business <uuid>
 *   (--engines gemini,perplexity narrows the engine set; default is all five)
 *   (add --confirm to actually spend; without it this prints the plan and exits)
 *
 * This is the deliberate opposite of scripts/smoke-aeo-dispatch.ts, which proves
 * the chain with a zero-cost fixture adapter and then deletes everything it
 * wrote. The dashboard cannot be built against that: fixtures never produce a
 * refused engine, an empty answer, a redirect citation, or a vendor that
 * reports tokens but no invoice. Those shapes have to be observed once, from
 * real engines, before any UI claims to render them.
 *
 * SPENDING. Every call here is billable and this script does not clean up.
 * Three protections, in order:
 *   1. --confirm is required; the default is a dry plan that calls nothing.
 *   2. MAX_SPEND_MICRO_USD aborts the loop the moment projected spend exceeds
 *      it, so a pricing mistake costs one unit, not a whole fan-out.
 *   3. Spend is reported from the ledger afterwards, not from the projection,
 *      because the projection is exactly the thing that could be wrong.
 */
import { createAdminClient } from "../src/lib/db/supabase/admin";
import { engineRegistry } from "../src/services/aeo/engines/engine-registry";
import { registerAeoAdapters } from "../src/services/aeo/engines/register-adapters";
import { getEngineDescriptor } from "../src/services/aeo/engines/engine-catalog";
import type { AnswerEngineId } from "../src/services/aeo/engines/engine-types";
import { planRun } from "../src/services/aeo/orchestration/run-plan";
import { dispatchUnit } from "../src/services/aeo/orchestration/dispatch-unit";
import { SupabaseReservationStore } from "../src/services/aeo/orchestration/supabase-reservation-store";
import { SupabaseRunStore } from "../src/services/aeo/orchestration/supabase-run-store";
import { SupabaseSampleStore } from "../src/services/aeo/orchestration/supabase-sample-store";
import { SupabaseAnswerStore } from "../src/services/aeo/orchestration/supabase-answer-store";
import { extractSample } from "../src/services/aeo/extraction/extract-sample";
import { SupabaseExtractionStore } from "../src/services/aeo/extraction/supabase-extraction-store";

/** Hard ceiling for one seeding run. Five engines × five prompts sits near $0.17. */
const MAX_SPEND_MICRO_USD = 500_000; // $0.50

const ALL_ENGINES: AnswerEngineId[] = [
    "gemini",
    "google_serp",
    "google_ai_overview",
    "perplexity",
    "chatgpt",
];

/**
 * Questions a real customer would ask, not questions engineered to name the
 * business. A prompt containing the brand name guarantees a mention and would
 * make the first dashboard look far better than the product actually is.
 */
const PROMPTS = [
    "best barbecue restaurant in Kansas City",
    "where to get burnt ends in Kansas City",
    "top rated bbq near downtown Kansas City",
    "family friendly barbecue restaurant Kansas City MO",
    "best burgers in Kansas City",
];

function arg(flag: string): string | null {
    const i = process.argv.indexOf(flag);
    return i >= 0 ? (process.argv[i + 1] ?? null) : null;
}

/**
 * `--engines gemini,perplexity` narrows the run. Unknown names are rejected
 * rather than skipped: a typo that silently sampled nothing would look exactly
 * like an engine that returned nothing.
 */
function requestedEngines(): AnswerEngineId[] {
    const raw = arg("--engines");
    if (!raw) return ALL_ENGINES;

    const asked = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const unknown = asked.filter((s) => !ALL_ENGINES.includes(s as AnswerEngineId));
    if (unknown.length > 0) {
        throw new Error(`unknown engine(s): ${unknown.join(", ")} — known: ${ALL_ENGINES.join(", ")}`);
    }
    return asked as AnswerEngineId[];
}

async function main() {
    const businessId = arg("--business");
    const confirmed = process.argv.includes("--confirm");
    if (!businessId) throw new Error("--business <uuid> is required");
    const engines = requestedEngines();

    const db = createAdminClient();
    const runs = new SupabaseRunStore(db);
    const reservations = new SupabaseReservationStore(db);
    const samples = new SupabaseSampleStore(db);
    const answers = new SupabaseAnswerStore(db);
    const extraction = new SupabaseExtractionStore(db);

    const { data: biz, error: bizErr } = await db
        .from("businesses")
        .select("id, name, city, state, organization_id")
        .eq("id", businessId)
        .single();
    if (bizErr || !biz) throw new Error(`business not found: ${bizErr?.message}`);

    console.log(`\nBusiness : ${biz.name} — ${biz.city ?? "?"}, ${biz.state ?? "?"}`);
    console.log(`Org      : ${biz.organization_id}`);

    registerAeoAdapters();

    // Enrol the prompts idempotently: re-running must not double the library.
    const existing = await db
        .from("aeo_prompts")
        .select("id, prompt_text")
        .eq("business_id", businessId)
        .in("prompt_text", PROMPTS);
    const have = new Set((existing.data ?? []).map((p) => p.prompt_text));
    const toInsert = PROMPTS.filter((p) => !have.has(p)).map((prompt_text) => ({
        business_id: businessId,
        prompt_text,
        source: "manual",
        locale_country: "US",
        locale_language: "en",
        locale_city: biz.city,
        is_active: true,
    }));
    if (toInsert.length > 0) {
        const { error } = await db.from("aeo_prompts").insert(toInsert);
        if (error) throw new Error(`prompt insert failed: ${error.message}`);
    }
    console.log(`Prompts  : ${PROMPTS.length} enrolled (${toInsert.length} new)`);
    console.log(`Engines  : ${engines.join(", ")}`);

    const usageDate = new Date().toISOString().slice(0, 10);
    const prompts = await runs.loadActivePrompts(businessId);
    const consumed = await runs.consumedTodayByEngine(biz.organization_id, usageDate);

    // Plan against a throwaway run id first, so a dry run leaves no aeo_runs row.
    const { runId } = confirmed
        ? await runs.createRun({ businessId, trigger: "manual", scheduledFor: null })
        : { runId: "00000000-0000-0000-0000-000000000000" };

    const plan = planRun(
        {
            runId,
            businessId,
            organizationId: biz.organization_id,
            usageDate,
            prompts,
            requestedEngines: engines,
            consumedByEngine: consumed,
        },
        engineRegistry
    );

    for (const w of plan.withheld) {
        console.log(`WITHHELD ${w.descriptor.id.padEnd(20)} ${w.state}`);
    }

    // Projection only. The binding number is read from the ledger at the end.
    let projected = 0;
    for (const d of plan.dispatches) {
        const c = getEngineDescriptor(d.engineId).cost;
        const free = Math.max(0, c.freePerDay - (consumed[d.engineId] ?? 0));
        projected += free > 0 ? 0 : c.overageMicroUsd;
    }
    console.log(`\nUnits    : ${plan.dispatches.length}`);
    console.log(`Projected: $${(projected / 1_000_000).toFixed(4)} (cap $${(MAX_SPEND_MICRO_USD / 1_000_000).toFixed(2)})`);

    if (projected > MAX_SPEND_MICRO_USD) {
        throw new Error("projected spend exceeds the cap — refusing to dispatch");
    }
    if (!confirmed) {
        // Precise about what a dry run did do: the prompts above are already
        // enrolled. Saying "nothing written" would be the same overclaim this
        // module exists to remove — it is just pointed at our own output.
        console.log("\nDRY RUN — no engine called, no spend. Prompts ARE enrolled.");
        console.log("Re-run with --confirm to sample.\n");
        return;
    }

    const passthrough = async <T,>(_id: string, fn: () => Promise<T>) => fn();
    const context = await extraction.loadBrandContext(businessId);
    console.log(`Brands   : ${context.brands.map((b) => `${b.label}(${b.kind})`).join(", ")}\n`);

    let spent = 0;
    let ok = 0;
    let failed = 0;

    for (const d of plan.dispatches) {
        const adapter = engineRegistry.get(d.engineId);
        if (!adapter) continue;

        if (spent > MAX_SPEND_MICRO_USD) {
            console.log("SPEND CAP REACHED — stopping dispatch loop");
            break;
        }

        const outcome = await dispatchUnit(d, { step: passthrough, adapter, reservations, samples, answers });

        if (outcome.kind !== "sampled") {
            console.log(`${d.engineId.padEnd(20)} ${outcome.kind}`);
            continue;
        }
        spent += outcome.costMicroUsd;

        const found = extractSample(outcome.result, context);
        await extraction.persist(outcome.sampleId, businessId, found);

        const status = outcome.result.status;
        if (status === "ok") ok += 1;
        else failed += 1;

        // ownBrandNamed is tri-state: null means the sample carried no answer to
        // read, which is not the same as the brand being absent.
        const named = found.ownBrandNamed === null ? "n/a" : found.ownBrandNamed ? "YES" : "no";
        console.log(
            `${d.engineId.padEnd(20)} ${status.padEnd(10)} named=${named.padEnd(4)} ` +
                `cites=${found.citations.length} cost=$${(outcome.costMicroUsd / 1_000_000).toFixed(4)}`
        );
    }

    await runs.completeRun(runId, {
        status: failed === 0 ? "success" : ok > 0 ? "partial" : "failed",
        errorMessage: null,
        at: new Date().toISOString(),
    });

    // Truth comes from the ledger, not from the loop's own arithmetic.
    const { data: ledger } = await db
        .from("aeo_quota_reservations")
        .select("engine_id, state, billable_units, overrun_units, cost_micro_usd")
        .eq("run_id", runId);

    const invoiced = (ledger ?? []).reduce((s, r) => s + (r.cost_micro_usd ?? 0), 0);
    const overrun = (ledger ?? []).reduce((s, r) => s + (r.overrun_units ?? 0), 0);

    console.log(`\nrun_id       : ${runId}`);
    console.log(`samples ok   : ${ok}   failed: ${failed}`);
    console.log(`ledger cost  : $${(invoiced / 1_000_000).toFixed(4)}`);
    console.log(`overrun units: ${overrun}${overrun > 0 ? "  (cost above is a floor)" : ""}`);
    console.log("\nData left in place for the dashboard.\n");
}

main().catch((err) => {
    console.error("SEED FAILED:", err);
    process.exit(1);
});
