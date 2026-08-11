"use server";

import { createClient } from "@/lib/db/supabase/server";
import { AEO_ANSWER_BUCKET } from "@/services/aeo/orchestration/supabase-answer-store";

export type StoredAnswer = {
    engineId: string;
    modelId: string | null;
    prompt: string;
    answerText: string;
    citations: unknown;
    sampledAt: string;
};

export type ViewAnswerResult = { ok: true; answer: StoredAnswer } | { ok: false; error: string };

/**
 * F3.6 evidence viewer. Reads through the caller's RLS-scoped client on BOTH
 * calls: the aeo_samples row confirms this sample belongs to a business the
 * caller can see, and the storage bucket's own SELECT policy (path-prefixed
 * by organization id) is what actually gates the download — this function
 * does not grant access, it only refuses to ask for a path the caller
 * couldn't already reach on their own.
 */
export async function viewStoredAnswer(sampleId: string): Promise<ViewAnswerResult> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Unauthorized" };

    const { data: sample } = await supabase
        .from("aeo_samples")
        .select("id, answer_storage_path")
        .eq("id", sampleId)
        .maybeSingle();

    if (!sample?.answer_storage_path) {
        return { ok: false, error: "No stored answer for this sample." };
    }

    const { data: file, error } = await supabase.storage
        .from(AEO_ANSWER_BUCKET)
        .download(sample.answer_storage_path);

    if (error || !file) {
        return { ok: false, error: "Could not retrieve the stored answer." };
    }

    try {
        const envelope = JSON.parse(await file.text()) as StoredAnswer;
        return { ok: true, answer: envelope };
    } catch {
        return { ok: false, error: "Stored answer is unreadable." };
    }
}
