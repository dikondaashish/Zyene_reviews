/**
 * Zyene Reviews: AI Analysis Test Script
 * 
 * This script tests the Sentiment Analysis & Categorization engine (Gemini 1.5 Flash).
 * It simulates three distinct review scenarios to verify accurate sentiment,
 * urgency scoring, and theme identification.
 * 
 * Run with: npx tsx scripts/test-analysis.ts
 */

import { generateContentWithFallback } from "../src/domains/ai/adapters/vertex-adapter";
import { BATCH_REVIEWS_PROMPT } from "../src/domains/ai/prompts";
import { batchAnalysisSchema } from "../src/domains/ai/schemas/response-schemas";
// Note: Environment variables are expected to be pre-loaded via Node.js native --env-file flag.


const TEST_REVIEWS = [
    {
        id: "test-pos-1",
        rating: 5,
        text: "Absolutely loved the atmosphere here. The pasta was cooked perfectly and our waiter, Marco, was so attentive. Will definitely be back!"
    },
    {
        id: "test-neg-1",
        rating: 2,
        text: "The wait time was over 45 minutes even though we had a reservation. Food was cold when it arrived. Very disappointing."
    },
    {
        id: "test-urgent-1",
        rating: 1,
        text: "DISGUSTING. I found a piece of plastic in my burger and the manager basically told me it was my fault. I'm reporting this to the health department immediately."
    }
];

async function runAnalysisTest() {
    console.log("🚀 Starting AI Analysis Test...\n");

    if (!process.env.GOOGLE_VERTEX_API_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.error("❌ Error: Missing Google Cloud credentials. Please check your .env.local file.");
        process.exit(1);
    }

    const prompt = BATCH_REVIEWS_PROMPT
        .replace(/\{count\}/g, TEST_REVIEWS.length.toString())
        .replace("{reviews_json}", JSON.stringify(TEST_REVIEWS, null, 2));

    try {
        console.log("📡 Sending batch to Gemini (via Vertex AI)...");
        const startTime = Date.now();
        
        const content = await generateContentWithFallback(prompt, { 
            requireJson: true, 
            schema: batchAnalysisSchema 
        });

        const latency = Date.now() - startTime;
        const results = JSON.parse(content);

        console.log(`✅ AI Response Received in ${latency}ms\n`);
        console.log("--- ANALYSIS RESULTS ---");

        results.forEach((res: any, index: number) => {
            const original = TEST_REVIEWS[index];
            console.log(`\n[Review ${index + 1}] ID: ${res.reviewId}`);
            console.log(`Input: "${original.text.substring(0, 60)}..."`);
            console.log(`Sentiment: ${res.sentiment.toUpperCase()}`);
            console.log(`Urgency: ${res.urgency}/10 ${res.urgency >= 7 ? "🚨 CRITICAL" : ""}`);
            console.log(`Themes: ${res.themes.join(", ")}`);
            console.log(`Summary: ${res.summary}`);
            console.log("-".repeat(30));
        });

        console.log("\n✨ Test completed successfully.");
    } catch (error) {
        console.error("\n❌ AI Analysis Failed:", error);
    }
}

runAnalysisTest();
