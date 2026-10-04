import { describe, expect, it } from "vitest";

import { isNotificationRegistrationUnavailable } from "@/services/google/notifications";

describe("isNotificationRegistrationUnavailable", () => {
    it("treats account notification 403/404 as unavailable", () => {
        expect(
            isNotificationRegistrationUnavailable(
                new Error("Failed to register notifications: 404 Not Found")
            )
        ).toBe(true);
        expect(
            isNotificationRegistrationUnavailable(
                new Error("Failed to register notifications: 403 Forbidden")
            )
        ).toBe(true);
    });

    it("treats location notification 404 as unavailable", () => {
        expect(
            isNotificationRegistrationUnavailable(
                new Error("Failed to register location notifications: 404 Not Found")
            )
        ).toBe(true);
    });

    it("keeps other registration failures actionable", () => {
        expect(
            isNotificationRegistrationUnavailable(
                new Error("Failed to register notifications: 500 Internal Server Error")
            )
        ).toBe(false);
        expect(isNotificationRegistrationUnavailable(new Error("network down"))).toBe(false);
    });
});
