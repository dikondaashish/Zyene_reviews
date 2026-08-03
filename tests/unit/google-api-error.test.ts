import { describe, expect, it } from "vitest";

import {
    createGoogleServiceError,
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
