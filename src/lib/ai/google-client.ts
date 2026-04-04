import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_API_KEY || '';

if (!apiKey) {
    console.warn("GOOGLE_API_KEY is missing. Google Generative AI functions will fail.");
}

export const genAI = new GoogleGenerativeAI(apiKey);

export async function generateContentWithFallback(prompt: string, requireJson = false): Promise<string> {
    const config = requireJson ? { responseMimeType: "application/json" } : undefined;
    
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash",
            generationConfig: config
        });
        const response = await model.generateContent(prompt);
        return response.response.text();
    } catch (error) {
        console.warn("Primary model 'gemini-3-flash' failed, falling back to backup model 'gemini-3.1-pro'", error);
        const backupModel = genAI.getGenerativeModel({
            model: "gemini-3.1-pro",
            generationConfig: config
        });
        const backupResponse = await backupModel.generateContent(prompt);
        return backupResponse.response.text();
    }
}
