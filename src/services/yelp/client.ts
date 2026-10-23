import { fetchWithTimeout } from "@/lib/http/fetch-with-timeout";
import { logger } from "@/lib/logger";
const YELP_BASE_URL = "https://api.yelp.com/v3";

/** A non-2xx Yelp response; `status` lets callers tell plan limits (404) from outages. */
export class YelpApiError extends Error {
    constructor(readonly status: number, statusText: string) {
        super(`Yelp API error: ${status} ${statusText}`);
        this.name = "YelpApiError";
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
        if (options.expectedStatuses?.includes(response.status)) {
            logger.info({ status: response.status, path: options.path }, "[Yelp API] expected non-2xx response");
        } else {
            logger.error(`[Yelp API] ${response.status}: ${errorBody}`);
        }
        throw new YelpApiError(response.status, response.statusText);
    }

    return response.json() as Promise<T>;
}
