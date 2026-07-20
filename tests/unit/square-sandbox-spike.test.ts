import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import {
    parseSquareWebhook,
    shouldProcessSquarePaymentEvent,
} from "@/services/square/webhook-parse";
import {
    extractSquareCustomerId,
    resolveContactFromSquareCustomer,
    resolveContactFromSquarePayment,
} from "@/services/square/resolve-contact";
import { verifySquareWebhookSignature } from "@/services/square/verify-signature";

describe("parseSquareWebhook", () => {
    it("parses payment.created", () => {
        const { payment, revoke } = parseSquareWebhook({
            merchant_id: "ML123",
            type: "payment.created",
            event_id: "evt-1",
            data: { type: "payment", id: "pay-abc" },
        });
        expect(revoke).toBeNull();
        expect(payment).toEqual({
            merchantId: "ML123",
            paymentId: "pay-abc",
            eventType: "payment.created",
            eventId: "evt-1",
        });
    });

    it("parses oauth.authorization.revoked", () => {
        const { payment, revoke } = parseSquareWebhook({
            merchant_id: "ML123",
            type: "oauth.authorization.revoked",
            event_id: "evt-2",
        });
        expect(payment).toBeNull();
        expect(revoke).toEqual({ merchantId: "ML123", eventId: "evt-2" });
    });
});

describe("shouldProcessSquarePaymentEvent", () => {
    it("allows created and updated", () => {
        expect(shouldProcessSquarePaymentEvent("payment.created")).toBe(true);
        expect(shouldProcessSquarePaymentEvent("payment.updated")).toBe(true);
    });
});

describe("resolveContactFromSquarePayment", () => {
    it("reads embedded customer", () => {
        const contact = resolveContactFromSquarePayment({
            customer: {
                given_name: "Ada",
                family_name: "Lovelace",
                email_address: " ada@example.com ",
                phone_number: "+15551212",
            },
        });
        expect(contact).toEqual({
            email: "ada@example.com",
            phone: "+15551212",
            name: "Ada Lovelace",
        });
    });

    it("reads buyer_email_address on payment", () => {
        const contact = resolveContactFromSquarePayment({
            buyer_email_address: "buyer@link.test",
        });
        expect(contact.email).toBe("buyer@link.test");
    });

    it("extracts customer_id and resolves from Customers API shape", () => {
        expect(extractSquareCustomerId({ customer_id: "CUST1" })).toBe("CUST1");
        const contact = resolveContactFromSquareCustomer({
            given_name: "Karthik",
            email_address: "k@example.com",
        });
        expect(contact.email).toBe("k@example.com");
        expect(contact.name).toBe("Karthik");
    });
});

describe("verifySquareWebhookSignature", () => {
    it("validates HMAC of notificationUrl + body", () => {
        const key = "test-signature-key";
        const url = "https://app.zyenereviews.com/api/webhooks/square";
        const body = '{"type":"payment.created"}';
        const signature = createHmac("sha256", key)
            .update(url + body)
            .digest("base64");

        expect(
            verifySquareWebhookSignature({
                rawBody: body,
                signatureHeader: signature,
                signatureKey: key,
                notificationUrl: url,
            }),
        ).toBe(true);

        expect(
            verifySquareWebhookSignature({
                rawBody: body,
                signatureHeader: "bad",
                signatureKey: key,
                notificationUrl: url,
            }),
        ).toBe(false);
    });
});
