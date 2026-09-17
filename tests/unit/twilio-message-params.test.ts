import { describe, expect, it } from "vitest";
import { buildTwilioMessageParams, ensureSmsOptOutText } from "@/services/twilio/message-params";

describe("buildTwilioMessageParams", () => {
    it("uses the Messaging Service when configured", () => {
        expect(
            buildTwilioMessageParams("+15551234567", "Hello", {
                messagingServiceSid: "MG123",
                phoneNumber: "+15557654321",
            }),
        ).toEqual({ body: "Hello", messagingServiceSid: "MG123", to: "+15551234567" });
    });

    it("falls back to the configured phone number", () => {
        expect(
            buildTwilioMessageParams("+15551234567", "Hello", {
                messagingServiceSid: undefined,
                phoneNumber: "+15557654321",
            }),
        ).toEqual({ body: "Hello", from: "+15557654321", to: "+15551234567" });
    });

    it("returns no send parameters when no sender is configured", () => {
        expect(
            buildTwilioMessageParams("+15551234567", "Hello", {
                messagingServiceSid: undefined,
                phoneNumber: undefined,
            }),
        ).toBeNull();
    });
});

describe("ensureSmsOptOutText", () => {
    it("adds a STOP instruction when the message does not include one", () => {
        expect(ensureSmsOptOutText("Hello")).toBe("Hello\nReply STOP to opt out.");
    });

    it("does not duplicate an existing STOP instruction", () => {
        expect(ensureSmsOptOutText("Hello. Reply STOP to unsubscribe.")).toBe(
            "Hello. Reply STOP to unsubscribe.",
        );
    });
});
