/**
 * Thin DataForSEO transport, shared by the SERP and AI Overview adapters.
 *
 * Separated from the adapters because the auth, the envelope and the cost
 * reporting are identical across every DataForSEO endpoint, while what each
 * adapter does with `items` is not.
 */

const API_BASE = "https://api.dataforseo.com/v3";

export type DataForSeoItem = {
    type?: string;
    rank_absolute?: number;
    rank_group?: number;
    title?: string;
    description?: string;
    snippet?: string;
    url?: string;
    domain?: string;
    place_id?: string;
    /** local_pack entries carry these instead of url/domain. */
    rating?: { value?: number; votes_count?: number };
    /** ai_overview carries nested items and references. */
    items?: DataForSeoItem[];
    references?: { url?: string; title?: string; domain?: string; source?: string }[];
    text?: string;
    asynchronous_ai_overview?: boolean;
};

export type DataForSeoResult = {
    keyword?: string;
    items?: DataForSeoItem[];
    items_count?: number;
};

export type DataForSeoCall = {
    ok: boolean;
    /** Top-level HTTP status, or 0 when the request never completed. */
    httpStatus: number;
    /** DataForSEO's own status code. 20000 is success. */
    statusCode?: number;
    statusMessage?: string;
    /** Per-task status; a 200 envelope can still carry a failed task. */
    taskStatusCode?: number;
    taskStatusMessage?: string;
    result?: DataForSeoResult;
    /**
     * What DataForSEO says this call cost, in USD. Reported on the envelope, so
     * the ledger reconciles against an invoice rather than a catalog estimate —
     * same as Perplexity, unlike OpenAI.
     */
    costUsd?: number;
    error?: string;
};

export function dataForSeoAuthHeader(login: string, password: string): string {
    // Built at call time rather than storing a pre-encoded Base64 secret: one
    // fewer credential to rotate, and it cannot drift from the two it derives
    // from.
    return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
}

export async function callDataForSeo(
    path: string,
    payload: Record<string, unknown>,
    auth: { login: string; password: string },
    signal: AbortSignal
): Promise<DataForSeoCall> {
    let response: Response;
    try {
        response = await fetch(`${API_BASE}${path}`, {
            method: "POST",
            headers: {
                Authorization: dataForSeoAuthHeader(auth.login, auth.password),
                "Content-Type": "application/json",
            },
            // The API always takes an ARRAY of tasks, even for one.
            body: JSON.stringify([payload]),
            signal,
        });
    } catch (error) {
        return {
            ok: false,
            httpStatus: 0,
            error: error instanceof Error ? error.message : String(error),
        };
    }

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        return { ok: false, httpStatus: response.status, error: body.slice(0, 300) };
    }

    let envelope: {
        status_code?: number;
        status_message?: string;
        cost?: number;
        tasks?: {
            status_code?: number;
            status_message?: string;
            result?: DataForSeoResult[];
        }[];
    };
    try {
        envelope = await response.json();
    } catch {
        return { ok: false, httpStatus: response.status, error: "response was not valid JSON" };
    }

    const task = envelope.tasks?.[0];

    return {
        // Both levels must be healthy. A 200 with a failed task is the shape
        // that would otherwise be read as an empty-but-successful result — and
        // an empty result means "brand not found", which is exactly the
        // misreading this contract exists to prevent.
        ok: envelope.status_code === 20000 && task?.status_code === 20000,
        httpStatus: response.status,
        statusCode: envelope.status_code,
        statusMessage: envelope.status_message,
        taskStatusCode: task?.status_code,
        taskStatusMessage: task?.status_message,
        result: task?.result?.[0],
        costUsd: envelope.cost,
    };
}

/**
 * Maps DataForSEO's own status codes to our error kinds.
 *
 * Their 401xx family is auth/payment, 402xx is rate/limits, 5xxxx is upstream.
 * Anything unrecognised stays `unknown` rather than being guessed at, because
 * the kind decides retryability.
 */
export function classifyDataForSeoStatus(code: number | undefined): {
    kind: "auth" | "quota_exhausted" | "rate_limited" | "invalid_request" | "upstream_unavailable" | "unknown";
} {
    if (code === undefined) return { kind: "unknown" };
    if (code === 40100 || code === 40101 || code === 40200) return { kind: "auth" };
    // 40202 is "insufficient funds" — permanent until someone tops up, so it
    // must not be retryable or every dispatch burns its budget on a wall.
    if (code === 40202 || code === 40203) return { kind: "quota_exhausted" };
    if (code === 40201 || code === 40204) return { kind: "rate_limited" };
    if (code >= 40400 && code < 40600) return { kind: "invalid_request" };
    if (code >= 50000) return { kind: "upstream_unavailable" };
    if (code >= 40000 && code < 40500) return { kind: "invalid_request" };
    return { kind: "unknown" };
}
