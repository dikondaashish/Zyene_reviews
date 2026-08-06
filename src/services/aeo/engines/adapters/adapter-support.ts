import type { EngineErrorKind, EngineSampleRequest } from "../engine-types";

/**
 * Shared helpers for live engine adapters.
 *
 * Extracted because three adapters were about to carry identical copies of the
 * same locale handling and status mapping. Duplicating those is not a style
 * problem: if one adapter's copy of `classifyHttpStatus` drifted, one engine
 * would start retrying auth failures forever while its neighbour did not, and
 * nothing would surface the divergence.
 */

/**
 * States the locale inside the prompt.
 *
 * None of the answer-engine APIs expose a locale parameter, so the alternative
 * is sampling whatever the vendor's default region is. Silently measuring US
 * results for a UK business is a WRONG measurement rather than a missing one,
 * and it would look perfectly healthy in the data.
 */
export function buildLocalePrompt(request: EngineSampleRequest): string {
    const { locale } = request;
    const where = [locale.city, locale.country].filter(Boolean).join(", ");
    if (!where) return request.prompt;
    return `${request.prompt}\n\n(Answer for someone located in ${where}, in ${locale.language}.)`;
}

/** Vendors that signal an empty balance inside a 429 rather than with 402. */
const QUOTA_EXHAUSTED_MARKERS =
    /insufficient_quota|no credits remaining|billing_not_active|exceeded your current quota|credit balance is too low/i;

/**
 * Maps an HTTP status to an error kind.
 *
 * Retryability is deliberately NOT decided here — `engineError` derives it from
 * the kind, so no adapter can mark a permanent failure retryable and spin a run
 * against a wall that will never move.
 *
 * `body` matters for exactly one case, and it is not a nicety. OpenAI returns
 * 429 for BOTH "slow down" and "you have no credits", and the two need opposite
 * handling: the first should retry, the second can never succeed. Classifying an
 * empty balance as `rate_limited` would burn every retry a dispatch has, on
 * every unit of every run, against an account that cannot pay.
 */
export function classifyHttpStatus(status: number, body?: string): EngineErrorKind {
    if (status === 429) {
        return body && QUOTA_EXHAUSTED_MARKERS.test(body) ? "quota_exhausted" : "rate_limited";
    }
    if (status === 401 || status === 403) return "auth";
    if (status === 402) return "quota_exhausted";
    if (status === 400 || status === 404 || status === 422) return "invalid_request";
    if (status >= 500) return "upstream_unavailable";
    return "unknown";
}

/** `Retry-After` in seconds, as milliseconds. Absent or malformed yields undefined. */
export function retryAfterMs(response: Response): number | undefined {
    const header = response.headers.get("retry-after");
    if (!header) return undefined;
    const seconds = Number(header);
    return Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000 : undefined;
}

/**
 * Fractional USD to integer micro-USD.
 *
 * Returns undefined for anything unusable rather than 0, because 0 means "the
 * vendor reported this call was free" and the ledger treats that as fact. A
 * garbled figure quietly becoming a free call would understate spend.
 */
export function usdToMicroUsd(usd: number | undefined): number | undefined {
    if (usd === undefined || !Number.isFinite(usd) || usd < 0) return undefined;
    return Math.round(usd * 1_000_000);
}

/** Spreads a reported cost only when there is one, keeping the field absent otherwise. */
export function reportedCost(micro: number | undefined): { reportedCostMicroUsd?: number } {
    return micro === undefined ? {} : { reportedCostMicroUsd: micro };
}
