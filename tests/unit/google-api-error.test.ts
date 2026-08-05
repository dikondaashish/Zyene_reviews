import { describe, expect, it } from "vitest";

import {
    createGoogleServiceError,
    isGoogleAccountStateError,
    isGoogleActionableFault,
    isGoogleConfigurationError,
} from "../../src/services/google/api-error";

describe("Google service error classification", () => {
    it("classifies disabled Performance API responses as configuration errors", () => {
        const error = createGoogleServiceError(
            "Business Profile Performance API",
            403,
            JSON.stringify({
                error: {
                    code: 403,
                    message: "Business Profile Performance API has not been used in project 123 before or it is disabled.",
                    status: "PERMISSION_DENIED",
                    details: [{ reason: "SERVICE_DISABLED" }],
                },
            })
        );

        expect(isGoogleConfigurationError(error)).toBe(true);
        expect(error.message).toContain("Enable Business Profile Performance API");
        expect(error.message).not.toContain("project 123");
    });

    it("does not hide a generic permission denial as project configuration", () => {
        const error = createGoogleServiceError(
            "Business Profile Performance API",
            403,
            JSON.stringify({
                error: {
                    code: 403,
                    message: "The caller does not have permission.",
                    status: "PERMISSION_DENIED",
                },
            })
        );

        expect(error.kind).toBe("permission_denied");
        expect(isGoogleConfigurationError(error)).toBe(false);
    });

    it("keeps Place Actions INVALID_ARGUMENT observable", () => {
        const error = createGoogleServiceError(
            "My Business Place Actions API",
            400,
            JSON.stringify({
                error: {
                    code: 400,
                    message: "Request contains an invalid argument.",
                    status: "INVALID_ARGUMENT",
                },
            })
        );

        expect(error.kind).toBe("invalid_argument");
        expect(isGoogleConfigurationError(error)).toBe(false);
    });
});

describe("Google account-state errors (customer action, not our fault)", () => {
    it("classifies an unverified location as its own kind, not invalid_argument", () => {
        const error = createGoogleServiceError(
            "My Business Place Actions API",
            400,
            JSON.stringify({
                error: {
                    code: 400,
                    message: "Request contains an invalid argument.",
                    status: "INVALID_ARGUMENT",
                    details: [{ reason: "UNVERIFIED_LOCATION" }],
                },
            }),
        );

        expect(error.kind).toBe("unverified_location");
        expect(isGoogleAccountStateError(error)).toBe(true);
        expect(isGoogleConfigurationError(error)).toBe(false);
        expect(isGoogleActionableFault(error)).toBe(false);
        expect(error.message).toMatch(/verified Google Business Profile location/);
    });

    it("treats a Performance API permission denial as account state", () => {
        const error = createGoogleServiceError(
            "Business Profile Performance API",
            403,
            JSON.stringify({
                error: {
                    code: 403,
                    message: "The caller does not have permission for this location.",
                    status: "PERMISSION_DENIED",
                },
            }),
        );

        expect(error.kind).toBe("permission_denied");
        expect(isGoogleAccountStateError(error)).toBe(true);
        expect(isGoogleActionableFault(error)).toBe(false);
    });

    it("still reports a genuine invalid argument as an actionable fault", () => {
        const error = createGoogleServiceError(
            "My Business Place Actions API",
            400,
            JSON.stringify({
                error: {
                    code: 400,
                    message: "Invalid readMask supplied.",
                    status: "INVALID_ARGUMENT",
                },
            }),
        );

        expect(error.kind).toBe("invalid_argument");
        expect(isGoogleAccountStateError(error)).toBe(false);
        expect(isGoogleActionableFault(error)).toBe(true);
    });

    it("still reports server errors and rate limits as actionable faults", () => {
        const serverError = createGoogleServiceError("Performance API", 503, "upstream unavailable");
        const rateLimited = createGoogleServiceError("Performance API", 429, "slow down");

        expect(serverError.kind).toBe("server_error");
        expect(rateLimited.kind).toBe("rate_limited");
        expect(isGoogleActionableFault(serverError)).toBe(true);
        expect(isGoogleActionableFault(rateLimited)).toBe(true);
    });

    it("keeps a disabled API classified as configuration, not account state", () => {
        const error = createGoogleServiceError(
            "My Business Place Actions API",
            403,
            JSON.stringify({
                error: {
                    message: "API has not been used in project 123 before or it is disabled.",
                    status: "PERMISSION_DENIED",
                    details: [{ reason: "SERVICE_DISABLED" }],
                },
            }),
        );

        expect(error.kind).toBe("api_disabled");
        expect(isGoogleConfigurationError(error)).toBe(true);
        expect(isGoogleAccountStateError(error)).toBe(false);
    });
});
