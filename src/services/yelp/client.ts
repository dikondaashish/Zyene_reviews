import { fetchWithTimeout } from "@/lib/http/fetch-with-timeout";
import { logger } from "@/lib/logger";
const YELP_BASE_URL = "https://api.yelp.com/v3";

/** Yelp error codes meaning our API key itself is unusable (expired trial, revoked or missing token). */
const ACCOUNT_ERROR_CODES = new Set([
    "TRIAL_EXPIRED",
    "TOKEN_INVALID",
    "TOKEN_MISSING",
    "UNAUTHORIZED_ACCESS_TOKEN",
    "AUTHORIZATION_ERROR",
]);

/** A non-2xx Yelp response; `status` lets callers tell plan limits (404) from outages. */
export class YelpApiError extends Error {
    constructor(readonly status: number, statusText: string, readonly code?: string) {
        super(`Yelp API error: ${status} ${statusText}${code ? ` (${code})` : ""}`);
        this.name = "YelpApiError";
    }

    /** The key is rejected for every request: retrying cannot help until the Yelp account is fixed. */
    get isAccountError(): boolean {
        return this.status === 401 || this.status === 403 || (!!this.code && ACCOUNT_ERROR_CODES.has(this.code));
    }
}

function parseYelpErrorCode(body: string): string | undefined {
    try {
        const code = (JSON.parse(body) as { error?: { code?: unknown } }).error?.code;
        return typeof code === "string" ? code : undefined;
    } catch {
        return undefined;
    }
}

function getApiKey(): string {
    const key = process.env.YELP_API_KEY;
    if (!key) {
        throw new Error("YELP_API_KEY environment variable is not set");
    }
    return key;
}

interface YelpRequestOptions {
    path: string;
    params?: Record<string, string>;
    /** Statuses the caller handles (e.g. 404 on plans without reviews): logged at info, still thrown. */
    expectedStatuses?: number[];
}

export async function yelpFetch<T>(options: YelpRequestOptions): Promise<T> {
    const apiKey = getApiKey();

    const url = new URL(`${YELP_BASE_URL}${options.path}`);
    if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    const response = await fetchWithTimeout(url.toString(), {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        const error = new YelpApiError(response.status, response.statusText, parseYelpErrorCode(errorBody));
        if (options.expectedStatuses?.includes(response.status)) {
            logger.info({ status: response.status, path: options.path }, "[Yelp API] expected non-2xx response");
        } else if (error.isAccountError) {
            // The sync reports this once per platform; logging every request here would duplicate it.
            logger.warn({ status: response.status, code: error.code, path: options.path }, "[Yelp API] API key rejected");
        } else {
            logger.error(`[Yelp API] ${response.status}: ${errorBody}`);
        }
        throw error;
    }

    return response.json() as Promise<T>;
}
