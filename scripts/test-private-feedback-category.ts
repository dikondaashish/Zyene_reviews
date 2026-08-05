/**
 * Smoke-test private-feedback AI categorization (gemini-3.1-flash-lite via AiAnalysisService).
 *
 * Run: pnpm exec tsx --env-file=.env.local scripts/test-private-feedback-category.ts
 */

import { categorizePrivateFeedback } from "../src/domains/ai/services/ai-analysis-service";

const SAMPLES = [
    "The cashier was rude and ignored us for ten minutes.",
    "Pizza was cold and the crust was burnt.",
    "Prices went up again — feels like a ripoff now.",
    "",
    "   ",
];

async function main() {
    if (!process.env.GOOGLE_VERTEX_API_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.error("Missing GOOGLE_VERTEX_API_KEY or GOOGLE_APPLICATION_CREDENTIALS (.env.local).");
        process.exit(1);
    }

    const model =
        process.env.GOOGLE_AI_LITE_MODEL?.trim() || "gemini-3.1-flash-lite-preview";
    console.log("Using model (from code/env):", model);
    console.log("---\n");

    for (const text of SAMPLES) {
        const label = text === "" ? "(empty)" : text === "   " ? "(whitespace only)" : text.slice(0, 80);
        const category = await categorizePrivateFeedback(text);
        console.log("Input:", JSON.stringify(label));
        console.log("Category:", category);
        console.log("");
    }

    console.log("Done.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
