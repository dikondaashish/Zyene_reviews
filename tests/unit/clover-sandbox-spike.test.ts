import { describe, expect, it } from "vitest";
import {
    isCloverVerificationPayload,
    parseCloverPaymentEvents,
} from "@/services/clover/webhook-parse";
import {
    extractCloverCustomerIds,
    resolveContactFromCloverPayment,
} from "@/services/clover/resolve-contact";
import { cloverUnixSecondsToIso } from "@/services/clover/config";

describe("parseCloverPaymentEvents", () => {
    it("extracts payment IDs from P: objectIds", () => {
        const events = parseCloverPaymentEvents({
            appId: "APP",
            merchants: {
                M1: [
                    { objectId: "P:PAY123", type: "CREATE", ts: 1 },
                    { objectId: "O:ORD1", type: "UPDATE", ts: 2 },
                    { objectId: "P:", type: "CREATE", ts: 3 },
                ],
            },
        });
        expect(events).toEqual([
            { merchantId: "M1", paymentId: "PAY123", eventType: "CREATE", ts: 1 },
        ]);
    });

    it("detects verification payloads", () => {
        expect(isCloverVerificationPayload({ verificationCode: "abc" })).toBe(true);
        expect(isCloverVerificationPayload({ merchants: {} })).toBe(false);
    });
});

describe("resolveContactFromCloverPayment", () => {
    it("reads email and phone from expanded customer", () => {
        const contact = resolveContactFromCloverPayment({
            customer: {
                firstName: "Ada",
                lastName: "Lovelace",
                emailAddresses: [{ emailAddress: " ada@example.com " }],
                phoneNumbers: [{ phoneNumber: "+15551212" }],
            },
        });
        expect(contact).toEqual({
            email: "ada@example.com",
            phone: "+15551212",
            name: "Ada Lovelace",
        });
    });

    it("reads customers.elements on an order", () => {
        const contact = resolveContactFromCloverPayment({
            order: {
                customers: {
                    elements: [
                        {
                            emailAddresses: [{ emailAddress: "b@ex.com" }],
                            phoneNumbers: [],
                        },
                    ],
                },
            },
        });
        expect(contact.email).toBe("b@ex.com");
        expect(contact.phone).toBeNull();
    });

    it("extracts stub customer ids from payment order", () => {
        expect(
            extractCloverCustomerIds({
                order: { customers: { elements: [{ id: "HY2XZS8Z7WQGG" }] } },
            }),
        ).toEqual(["HY2XZS8Z7WQGG"]);
    });
});

describe("cloverUnixSecondsToIso", () => {
    it("converts unix seconds to ISO", () => {
        expect(cloverUnixSecondsToIso(1709498373)).toBe("2024-03-03T20:39:33.000Z");
    });
});
