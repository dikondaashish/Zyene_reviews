/**
 * Zyene Reviews: Model Availability Test
 * 
 * This script tests if the stable model names (gemini-3-flash, gemini-3.1-pro)
 * are available in the current Vertex AI environment.
 */

import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const projectId = process.env.GCP_PROJECT_ID || "zyene-reviews";
const location = process.env.GCP_REGION || "global";
const apiKey = process.env.GOOGLE_VERTEX_API_KEY;

const client = new GoogleGenAI(
    apiKey
        ? { apiKey }
        : {
            vertexai: true,
            project: projectId,
            location: location
        }
);

async function testModel(modelName: string) {
    console.log(`Checking [${modelName}]...`);
    try {
        const response = await client.models.generateContent({
            model: modelName,
            contents: [{ role: "user", parts: [{ text: "echo 'hello'" }] }],
        });
        console.log(`✅ [${modelName}] is available.`);
        return true;
    } catch (error: any) {
        console.error(`❌ [${modelName}] failed:`, error.message || error);
        return false;
    }
}

async function run() {
    console.log("🚀 Verifying Stable Gemini 3 Model Availability...\n");

    const flashAvailable = await testModel("gemini-3-flash");
    const proAvailable = await testModel("gemini-3.1-pro");

    console.log("\n--- Summary ---");
    console.log(`Stable Flash: ${flashAvailable ? "READY" : "UNAVAILABLE"}`);
    console.log(`Stable Pro:   ${proAvailable ? "READY" : "UNAVAILABLE"}`);

    if (flashAvailable && proAvailable) {
        console.log("\n✨ Both stable models are available. Proceeding with upgrade.");
    } else {
        console.log("\n⚠️ One or more stable models are unavailable. Sticking with preview names.");
    }
}

run();
