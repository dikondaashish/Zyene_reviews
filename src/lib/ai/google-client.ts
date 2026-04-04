import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY || "";

/** Gemini 2.0 Flash — model id for Generative Language API. */
const DEFAULT_MODEL = "gemini-2.0-flash";

/** Optional override (e.g. Vercel): GOOGLE_AI_PRIMARY_MODEL */
const PRIMARY_MODEL = process.env.GOOGLE_AI_PRIMARY_MODEL?.trim() || DEFAULT_MODEL;
/** Optional second model if primary fails; defaults to same as primary (no duplicate call). */
const FALLBACK_MODEL = process.env.GOOGLE_AI_FALLBACK_MODEL?.trim() || DEFAULT_MODEL;

if (!apiKey) {
    console.warn("GOOGLE_API_KEY is missing. Google Generative AI functions will fail.");
}

export const genAI = new GoogleGenerativeAI(apiKey);

export async function generateContentWithFallback(prompt: string, requireJson = false): Promise<string> {
    const config = requireJson ? { responseMimeType: "application/json" as const } : undefined;

    try {
        const model = genAI.getGenerativeModel({
            model: PRIMARY_MODEL,
            generationConfig: config,
        });
        const response = await model.generateContent(prompt);
        return response.response.text();
    } catch (error) {
        if (FALLBACK_MODEL === PRIMARY_MODEL) {
            throw error;
        }
        console.warn(
            `Primary model '${PRIMARY_MODEL}' failed, falling back to '${FALLBACK_MODEL}'`,
            error
        );
        const backupModel = genAI.getGenerativeModel({
            model: FALLBACK_MODEL,
            generationConfig: config,
        });
        const backupResponse = await backupModel.generateContent(prompt);
        return backupResponse.response.text();
    }
}
