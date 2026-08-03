import { fetchWithRetry } from "./business-profile";
import type { Json } from "@/lib/db/supabase/database.types";
import { requireGoogleLocationId } from "./location-id";

const BASE = "https://mybusinessqanda.googleapis.com/v1";

export interface GbpAuthor {
    displayName?: string;
    profilePhotoUri?: string;
    type?: string;
}

export interface GbpAnswer {
    name?: string;
    author?: GbpAuthor;
    upvoteCount?: number;
    text?: string;
    createTime?: string;
    updateTime?: string;
}

export interface GbpQuestion {
    name?: string;
    author?: GbpAuthor;
    upvoteCount?: number;
    text?: string;
    createTime?: string;
    updateTime?: string;
    topAnswers?: GbpAnswer[];
    totalAnswerCount?: number;
}

export interface ListQuestionsResponse {
    questions?: GbpQuestion[];
    nextPageToken?: string;
    totalSize?: number;
}

/**
 * GET locations/{locationId}/questions
 */
export async function listQuestionsPage(
    accessToken: string,
    googleLocationId: string,
    pageToken?: string
): Promise<ListQuestionsResponse> {
    const locationId = requireGoogleLocationId(googleLocationId, "My Business Q&A API");
    const params = new URLSearchParams();
    params.set("pageSize", "10");
    params.set("answersPerQuestion", "10");
    params.set("orderBy", "updateTime desc");
    if (pageToken) {
        params.set("pageToken", pageToken);
    }

    const url = `${BASE}/locations/${encodeURIComponent(locationId)}/questions?${params.toString()}`;

    const response = await fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Q&A listQuestions ${response.status}: ${body}`);
    }

    return response.json() as Promise<ListQuestionsResponse>;
}

export async function listAllQuestions(
    accessToken: string,
    googleLocationId: string
): Promise<GbpQuestion[]> {
    const all: GbpQuestion[] = [];
    let token: string | undefined;
    do {
        const page = await listQuestionsPage(accessToken, googleLocationId, token);
        if (page.questions?.length) {
            all.push(...page.questions);
        }
        token = page.nextPageToken;
    } while (token);
    return all;
}

function hasMerchantAnswer(q: GbpQuestion): boolean {
    const answers = q.topAnswers || [];
    return answers.some((a) => a.author?.type === "MERCHANT");
}

export function questionToRow(
    q: GbpQuestion,
    reviewPlatformId: string,
    businessId: string
): {
    review_platform_id: string;
    business_id: string;
    google_question_name: string;
    question_text: string;
    author_display_name: string | null;
    author_type: string | null;
    upvote_count: number;
    google_create_time: string | null;
    google_update_time: string | null;
    total_answer_count: number;
    has_merchant_answer: boolean;
    top_answers: Json;
    updated_at: string;
} {
    const name = q.name || "";
    return {
        review_platform_id: reviewPlatformId,
        business_id: businessId,
        google_question_name: name,
        question_text: q.text || "",
        author_display_name: q.author?.displayName ?? null,
        author_type: q.author?.type ?? null,
        upvote_count: q.upvoteCount ?? 0,
        google_create_time: q.createTime ? new Date(q.createTime).toISOString() : null,
        google_update_time: q.updateTime ? new Date(q.updateTime).toISOString() : null,
        total_answer_count: q.totalAnswerCount ?? (q.topAnswers?.length ?? 0),
        has_merchant_answer: hasMerchantAnswer(q),
        top_answers: (q.topAnswers ?? []) as Json,
        updated_at: new Date().toISOString(),
    };
}

/**
 * POST .../locations/{loc}/questions/{q}/answers:upsert — parent is full question name.
 */
export async function upsertQuestionAnswer(
    accessToken: string,
    questionResourceName: string,
    answerText: string
): Promise<GbpAnswer> {
    const url = `${BASE}/${questionResourceName}/answers:upsert`;

    const response = await fetchWithRetry(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            answer: { text: answerText },
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Q&A upsertAnswer ${response.status}: ${body}`);
    }

    return response.json() as Promise<GbpAnswer>;
}
