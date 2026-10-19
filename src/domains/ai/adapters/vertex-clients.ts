import { GoogleGenAI } from "@google/genai";

const projectId = process.env.GCP_PROJECT_ID || "zyene-reviews";
const location = process.env.GCP_REGION || "global";
const apiKey = process.env.GOOGLE_VERTEX_API_KEY;

/** Default: Gemini 3.1 Flash-Lite (fast, cost-efficient). Override with GOOGLE_AI_PRIMARY_MODEL. */
export const DEFAULT_PRIMARY_MODEL = process.env.GOOGLE_AI_PRIMARY_MODEL || "gemini-3.1-flash-lite";
/** Default: Gemini 3.5 Flash (quality fallback). Override with GOOGLE_AI_FALLBACK_MODEL. */
export const DEFAULT_FALLBACK_MODEL = process.env.GOOGLE_AI_FALLBACK_MODEL || "gemini-3.5-flash";

/**
 * Initialize the GoogleGenAI client.
 * Priority: 
 * 1. API Key (Express Mode for Vertex AI)
 * 2. Service Account (Standard Vertex AI Mode via ADC)
 */
export const apiKeyClient = apiKey ? new GoogleGenAI({ apiKey }) : null;
export const vertexClient = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location
});

export function isBlockedApiKeyError(error: unknown): boolean {
    const msg = error instanceof Error ? error.message : String(error);
    return msg.includes("API_KEY_SERVICE_BLOCKED") || msg.includes("generativelanguage.googleapis.com");
}
