/**
 * Verifies the AEO vendor credentials with the smallest possible real call.
 *
 *   pnpm exec tsx --env-file=.env.local scripts/verify-aeo-credentials.ts
 *
 * OpenAI is checked for PRESENCE ONLY and never called — it is the most
 * expensive engine per sample and is being saved for real traffic.
 *
 * Prints statuses and costs, never key material.
 */
import { GoogleGenAI } from "@google/genai";

type Check = {
    vendor: string;
    ok: boolean;
    detail: string;
    /** What this verification itself cost, as best we can state it. */
    cost: string;
};

const checks: Check[] = [];
const TIMEOUT_MS = 30_000;

function present(name: string): string | null {
    const v = process.env[name]?.trim();
    return v ? v : null;
}

async function withTimeout<T>(p: Promise<T>, label: string): Promise<T> {
    return Promise.race([
        p,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`${label} timed out after ${TIMEOUT_MS}ms`)), TIMEOUT_MS)
        ),
    ]);
}

/** Free: returns account info and balance without consuming credit. */
async function checkDataForSeo() {
    const login = present("DATAFORSEO_LOGIN");
    const password = present("DATAFORSEO_PASSWORD");
    if (!login || !password) {
        checks.push({ vendor: "DataForSEO", ok: false, detail: "DATAFORSEO_LOGIN/PASSWORD not set", cost: "-" });
        return;
    }
    // Built at call time rather than stored pre-encoded, so there is one fewer
    // secret to rotate and it cannot drift from the two it derives from.
    const basic = Buffer.from(`${login}:${password}`).toString("base64");
    try {
        const res = await withTimeout(
            fetch("https://api.dataforseo.com/v3/appendix/user_data", {
                headers: { Authorization: `Basic ${basic}` },
            }),
            "DataForSEO"
        );
        const body = (await res.json()) as {
            status_code?: number;
            status_message?: string;
            tasks?: { result?: { money?: { balance?: number }; rates?: unknown }[] }[];
        };
        const balance = body.tasks?.[0]?.result?.[0]?.money?.balance;
        const ok = res.ok && body.status_code === 20000;
        checks.push({
            vendor: "DataForSEO",
            ok,
            detail: ok
                ? `authenticated · balance $${balance ?? "?"}`
                : `HTTP ${res.status} · ${body.status_message ?? "unknown"}`,
            cost: "$0.00 (user_data is free)",
        });
    } catch (e) {
        checks.push({ vendor: "DataForSEO", ok: false, detail: String(e), cost: "$0.00" });
    }
}

async function checkPerplexity() {
    const key = present("PERPLEXITY_API_KEY");
    if (!key) {
        checks.push({ vendor: "Perplexity", ok: false, detail: "PERPLEXITY_API_KEY not set", cost: "-" });
        return;
    }
    try {
        const res = await withTimeout(
            fetch("https://api.perplexity.ai/search", {
                method: "POST",
                headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
                // Smallest legal request: one result, tiny page budget.
                body: JSON.stringify({ query: "Zyene Reviews", max_results: 1, max_tokens_per_page: 128 }),
            }),
            "Perplexity"
        );
        const text = await res.text();
        if (!res.ok) {
            checks.push({
                vendor: "Perplexity",
                ok: false,
                detail: `HTTP ${res.status} · ${text.slice(0, 160)}`,
                cost: "$0.00 (rejected)",
            });
            return;
        }
        const body = JSON.parse(text) as { results?: { title?: string; url?: string }[] };
        const n = body.results?.length ?? 0;
        checks.push({
            vendor: "Perplexity",
            ok: n > 0,
            detail: n > 0 ? `${n} result(s) · first: ${body.results?.[0]?.url ?? "?"}` : "no results returned",
            cost: "~$0.005 (1 search request)",
        });
    } catch (e) {
        checks.push({ vendor: "Perplexity", ok: false, detail: String(e), cost: "unknown" });
    }
}

async function checkGemini() {
    const key = present("AEO_GEMINI_API_KEY");
    if (!key) {
        checks.push({ vendor: "Gemini", ok: false, detail: "AEO_GEMINI_API_KEY not set", cost: "-" });
        return;
    }
    const ai = new GoogleGenAI({ apiKey: key });

    // 1. Plain call: proves auth and that the PINNED model is reachable on this
    //    key. Token-only, fractions of a cent.
    try {
        const res = await withTimeout(
            ai.models.generateContent({
                model: "gemini-2.5-pro",
                contents: "Reply with the single word: ready",
                config: { maxOutputTokens: 2000 },
            }),
            "Gemini"
        );
        const text = res.text?.trim() ?? "";
        checks.push({
            vendor: "Gemini (gemini-2.5-pro)",
            ok: text.length > 0,
            detail: text.length > 0 ? `replied: "${text.slice(0, 40)}"` : "empty response",
            cost: "<$0.01 (tokens only, no grounding)",
        });
    } catch (e) {
        const msg = String(e);
        checks.push({
            vendor: "Gemini (gemini-2.5-pro)",
            ok: false,
            // A 404 here usually means the key's project lacks 2.5 Pro access,
            // which matters: the cost model is pinned to that exact model.
            detail: msg.slice(0, 200),
            cost: "$0.00 (rejected)",
        });
        return;
    }

    // 2. Grounded call: this is what AEO actually issues, and it is the thing
    //    the 10,000/day free allowance is denominated in. Verifying it now is
    //    what makes the ledger's cost model trustworthy rather than assumed.
    try {
        const res = await withTimeout(
            ai.models.generateContent({
                model: "gemini-2.5-pro",
                contents: "Who is the best rated plumber in Austin, Texas?",
                config: { tools: [{ googleSearch: {} }], maxOutputTokens: 2000 },
            }),
            "Gemini grounding"
        );
        const meta = res.candidates?.[0]?.groundingMetadata;
        const chunks = meta?.groundingChunks?.length ?? 0;
        checks.push({
            vendor: "Gemini grounding",
            ok: Boolean(meta),
            detail: meta
                ? `grounded · ${chunks} source chunk(s) — citations available`
                : "no groundingMetadata returned (search tool may be unavailable on this key)",
            cost: "1 of 10,000 free grounding prompts today",
        });
    } catch (e) {
        checks.push({
            vendor: "Gemini grounding",
            ok: false,
            detail: String(e).slice(0, 200),
            cost: "$0.00 (rejected)",
        });
    }
}

function checkOpenAiPresenceOnly() {
    const key = present("OPENAI_API_KEY");
    checks.push({
        vendor: "OpenAI",
        ok: Boolean(key),
        detail: key ? "key present — NOT called (saved for real traffic)" : "OPENAI_API_KEY not set",
        cost: "$0.00 (deliberately not called)",
    });
}

async function main() {
    checkOpenAiPresenceOnly();
    await Promise.all([checkDataForSeo(), checkPerplexity()]);
    await checkGemini(); // sequential: two calls on one key

    console.log("");
    for (const c of checks) {
        console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.vendor}`);
        console.log(`      ${c.detail}`);
        console.log(`      cost: ${c.cost}`);
    }
    const failed = checks.filter((c) => !c.ok);
    console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
    if (failed.length > 0) process.exit(1);
}

main().catch((e) => {
    console.error("verification crashed:", e);
    process.exit(1);
});
