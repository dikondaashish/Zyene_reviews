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
import { pickCloverOutboundChannel } from "@/services/clover/pick-channel";

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

    it("unwraps emailAddresses.elements / phoneNumbers.elements from customer API", () => {
        const contact = resolveContactFromCloverPayment({
            customer: {
                firstName: "Karthik",
                emailAddresses: {
                    elements: [{ emailAddress: "dikondaashish7@gmail.com" }],
                },
                phoneNumbers: {
                    elements: [{ phoneNumber: "(774) 525-9109" }],
                },
            },
        });
        expect(contact.email).toBe("dikondaashish7@gmail.com");
        expect(contact.phone).toBe("(774) 525-9109");
        expect(contact.name).toBe("Karthik");
    });

    it("extracts stub customer ids from payment order", () => {
        expect(
            extractCloverCustomerIds({
                order: { customers: { elements: [{ id: "HY2XZS8Z7WQGG" }] } },
            }),
        ).toEqual(["HY2XZS8Z7WQGG"]);
    });
});

describe("pickCloverOutboundChannel", () => {
    it("prefers email when both email and phone are present", () => {
        expect(
            pickCloverOutboundChannel({
                email: "a@b.com",
                phone: "+15551212",
                name: null,
            }),
        ).toBe("email");
    });

    it("returns email when only email", () => {
        expect(
            pickCloverOutboundChannel({
                email: "a@b.com",
                phone: null,
                name: null,
            }),
        ).toBe("email");
    });

    it("returns sms when only phone", () => {
        expect(
            pickCloverOutboundChannel({
                email: null,
                phone: "+15551212",
                name: null,
            }),
        ).toBe("sms");
    });

    it("returns null when neither", () => {
        expect(
            pickCloverOutboundChannel({
                email: null,
                phone: null,
                name: null,
            }),
        ).toBeNull();
    });
});

describe("cloverUnixSecondsToIso", () => {
    it("converts unix seconds to ISO", () => {
        expect(cloverUnixSecondsToIso(1709498373)).toBe("2024-03-03T20:39:33.000Z");
    });
});
