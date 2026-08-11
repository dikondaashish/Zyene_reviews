import { timingSafeEqual } from "node:crypto";

/**
 * Compare a caller-supplied secret against the expected one without leaking
 * how much of it matched through timing.
 *
 * `===` on strings short-circuits at the first differing byte, so the time it
 * takes to reject correlates with how many leading bytes were right. That is
 * the signal a timing attack walks a secret one byte at a time. Remote timing
 * over HTTP is noisy and this is not the likeliest way any of these endpoints
 * falls, but the fix costs nothing and the alternative is three hand-rolled
 * comparisons drifting apart.
 *
 * Length is compared before `timingSafeEqual` because that function throws on
 * mismatched buffer lengths. Length is not the secret; its contents are.
 */
export function secretsMatch(actual: string | null | undefined, expected: string | null | undefined): boolean {
    if (typeof actual !== "string" || typeof expected !== "string") return false;
    if (actual.length === 0 || expected.length === 0) return false;

    const actualBuf = Buffer.from(actual);
    const expectedBuf = Buffer.from(expected);
    return actualBuf.length === expectedBuf.length && timingSafeEqual(actualBuf, expectedBuf);
}

/** `Authorization: Bearer <secret>` compared in constant time. */
export function bearerMatches(authHeader: string | null | undefined, secret: string | null | undefined): boolean {
    if (typeof secret !== "string" || secret.length === 0) return false;
    return secretsMatch(authHeader, `Bearer ${secret}`);
}
