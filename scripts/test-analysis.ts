/**
 * Zyene Reviews: AI Analysis Test Script
 *
 * Exercises batch review analysis via Vertex AI Search (Discovery Engine grounded summary).
 *
 * Run with: npx tsx --env-file=.env.local scripts/test-analysis.ts
 */

import {
    generateContentWithFallback,
    ingestReviewDocuments,
} from "../src/domains/ai/adapters/VertexAdapter";
import { BATCH_REVIEWS_PROMPT } from "../src/domains/ai/prompts";

const TEST_REVIEWS = [
    {
        id: "test-pos-1",
        rating: 5,
        text: "Absolutely loved the atmosphere here. The pasta was cooked perfectly and our waiter, Marco, was so attentive. Will definitely be back!",
    },
    {
        id: "test-neg-1",
        rating: 2,
        text: "The wait time was over 45 minutes even though we had a reservation. Food was cold when it arrived. Very disappointing.",
    },
    {
        id: "test-urgent-1",
        rating: 1,
        text: "DISGUSTING. I found a piece of plastic in my burger and the manager basically told me it was my fault. I'm reporting this to the health department immediately.",
    },
];

async function runAnalysisTest() {
    console.log("🚀 Starting AI Analysis Test (Vertex AI Search)...\n");

    if (!process.env.DISCOVERY_ENGINE_DATA_STORE_ID) {
        console.error("❌ Set DISCOVERY_ENGINE_DATA_STORE_ID.");
        process.exit(1);
    }

    const hasAdc =
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        process.env.GOOGLE_VERTEX_CREDENTIALS;
    if (!hasAdc) {
        console.error(
            "❌ Set GCP auth: GOOGLE_APPLICATION_CREDENTIALS (path to JSON) or GOOGLE_VERTEX_CREDENTIALS (JSON string / base64), and GCP_PROJECT_ID."
        );
        process.exit(1);
    }

    const reviewsForAi = TEST_REVIEWS.map((r) => ({
        reviewId: r.id,
        rating: r.rating,
        text: r.text,
    }));

    const prompt = BATCH_REVIEWS_PROMPT.replace(/\{count\}/g, reviewsForAi.length.toString()).replace(
        "{reviews_json}",
        JSON.stringify(reviewsForAi, null, 2)
    );

    let rawAiOutput = "";
    try {
        console.log("📥 Ingesting test documents...");
        await ingestReviewDocuments(
            reviewsForAi.map((r) => ({
                documentId: `review_${r.reviewId.replace(/-/g, "_")}`,
                payload: { kind: "review", reviewId: r.reviewId, rating: r.rating, text: r.text },
            }))
        );

        const waitMs = Number(process.env.DISCOVERY_TEST_POST_INGEST_WAIT_MS || 0);
        if (waitMs > 0) {
            console.log(`⏳ Waiting ${waitMs}ms for indexing (DISCOVERY_TEST_POST_INGEST_WAIT_MS)...`);
            await new Promise((r) => setTimeout(r, waitMs));
        }

        console.log("📡 Querying data store (generative summary)...");
        const startTime = Date.now();

        rawAiOutput = await generateContentWithFallback(prompt, {
            requireJson: true,
        });

        const latency = Date.now() - startTime;
        const results = JSON.parse(rawAiOutput);

        console.log(`✅ AI Response Received in ${latency}ms\n`);
        console.log("--- ANALYSIS RESULTS ---");

        results.forEach((res: any, index: number) => {
            const original = TEST_REVIEWS[index];
            console.log(`\n[Review ${index + 1}] ID: ${res.reviewId}`);
            console.log(`Input: "${original.text.substring(0, 60)}..."`);
            console.log(`Sentiment: ${String(res.sentiment).toUpperCase()}`);
            console.log(`Urgency: ${res.urgency}/10 ${res.urgency >= 7 ? "🚨 CRITICAL" : ""}`);
            console.log(`Themes: ${(res.themes || []).join(", ")}`);
            console.log(`Summary: ${res.summary}`);
            console.log("-".repeat(30));
        });

        console.log("\n✨ Test completed successfully.");
    } catch (error) {
        if (rawAiOutput) {
            console.error("\n--- Raw model output (first 1200 chars) ---\n");
            console.error(rawAiOutput.slice(0, 1200));
            console.error("\n--- end raw output ---");
            if (/no results/i.test(rawAiOutput)) {
                console.error(
                    "\nTip: Retrieval returned no hits yet. Wait a few minutes after ingest, or run with DISCOVERY_TEST_POST_INGEST_WAIT_MS=45000"
                );
            }
        }
        console.error("\n❌ AI Analysis Failed:", error);
    }
}

void runAnalysisTest();
