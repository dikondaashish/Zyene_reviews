import { describe, expect, it } from "vitest";
import { parseGenericWebhookBody } from "@/services/webhooks/generic-webhook-body";

describe("parseGenericWebhookBody", () => {
    it("parses snake_case and camelCase contact fields", () => {
        const result = parseGenericWebhookBody({
            first_name: "Ada",
            last_name: "Lovelace",
            customer_email: "ada@example.com",
            customerPhone: "+15551234567",
            channel: "both",
        });

        expect(result).toEqual({
            customerName: "Ada Lovelace",
            customerEmail: "ada@example.com",
            customerPhone: "+15551234567",
            channel: "both",
        });
    });

    it("prefers explicit name over first/last parts", () => {
        const result = parseGenericWebhookBody({
            name: "Grace Hopper",
            firstName: "Ignored",
            lastName: "Name",
            email: "grace@example.com",
        });

        expect(result.customerName).toBe("Grace Hopper");
        expect(result.channel).toBe("email");
    });

    it("auto-selects channel from available contacts", () => {
        expect(parseGenericWebhookBody({ phone: "+15550001111" }).channel).toBe("sms");
        expect(parseGenericWebhookBody({ email: "a@b.com" }).channel).toBe("email");
        expect(
            parseGenericWebhookBody({ phone: "+15550001111", email: "a@b.com" }).channel,
        ).toBe("both");
        expect(parseGenericWebhookBody({}).channel).toBe("link");
    });

    it("rejects invalid channel values", () => {
        expect(parseGenericWebhookBody({ channel: "fax", email: "a@b.com" }).channel).toBeNull();
    });
});
