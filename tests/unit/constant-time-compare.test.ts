import { describe, expect, it } from "vitest";

import { bearerMatches, secretsMatch } from "../../src/lib/auth/constant-time-compare";

describe("secretsMatch", () => {
    it("accepts an exact match", () => {
        expect(secretsMatch("s3cret", "s3cret")).toBe(true);
    });

    it("rejects a different value of the same length", () => {
        expect(secretsMatch("s3cret", "s3crEt")).toBe(false);
    });

    it("rejects a different length without throwing — timingSafeEqual would", () => {
        expect(secretsMatch("short", "muchlongersecret")).toBe(false);
        expect(secretsMatch("muchlongersecret", "short")).toBe(false);
    });

    it("rejects a correct prefix, so a partial guess is never a partial success", () => {
        expect(secretsMatch("s3c", "s3cret")).toBe(false);
    });

    it("rejects empty and non-string inputs rather than treating them as a match", () => {
        expect(secretsMatch("", "")).toBe(false);
        expect(secretsMatch(null, null)).toBe(false);
        expect(secretsMatch(undefined, "s3cret")).toBe(false);
        expect(secretsMatch("s3cret", undefined)).toBe(false);
    });
});

describe("bearerMatches", () => {
    it("accepts a correctly formed bearer header", () => {
        expect(bearerMatches("Bearer s3cret", "s3cret")).toBe(true);
    });

    it("rejects the raw secret without the Bearer prefix", () => {
        expect(bearerMatches("s3cret", "s3cret")).toBe(false);
    });

    it("rejects a wrong secret", () => {
        expect(bearerMatches("Bearer wrong", "s3cret")).toBe(false);
    });

    it("rejects when the configured secret is missing or empty — never open by default", () => {
        expect(bearerMatches("Bearer s3cret", undefined)).toBe(false);
        expect(bearerMatches("Bearer s3cret", "")).toBe(false);
        expect(bearerMatches("Bearer ", "")).toBe(false);
    });

    it("rejects a missing header", () => {
        expect(bearerMatches(null, "s3cret")).toBe(false);
    });

    it("is case-sensitive on the scheme, matching what the callers document", () => {
        expect(bearerMatches("bearer s3cret", "s3cret")).toBe(false);
    });
});
