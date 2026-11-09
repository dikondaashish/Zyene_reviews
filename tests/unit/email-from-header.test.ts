import { describe, expect, it } from "vitest";
import { formatFromAddress } from "@/lib/email/from-header";
import { collectratingsFromLine } from "@/services/resend/send-review-request-email";

describe("formatFromAddress", () => {
    it("leaves plain names unquoted", () => {
        expect(formatFromAddress("Willow Hair Studio", "hi@x.com")).toBe("Willow Hair Studio <hi@x.com>");
    });

    it.each([
        ["Smith, Jones and Co"],
        ["Bistro (Main St)"],
        ["Salon: Studio 7"],
    ])("quotes %s so the comma/paren/colon cannot break the header", (name) => {
        expect(formatFromAddress(name, "hi@x.com")).toBe(`"${name}" <hi@x.com>`);
    });

    it("leaves names with only periods unquoted, as before", () => {
        expect(formatFromAddress("Café Olé & Co.", "hi@x.com")).toBe("Café Olé & Co. <hi@x.com>");
    });

    it("escapes backslashes and strips line breaks", () => {
        expect(formatFromAddress("A\\B, Co\r\nBcc: evil@x.com", "hi@x.com"))
            .toBe('"A\\\\B, Co  Bcc: evil@x.com" <hi@x.com>');
    });

    it("falls back to the bare mailbox for an empty name", () => {
        expect(formatFromAddress("   ", "hi@x.com")).toBe("hi@x.com");
    });
});

describe("review request From line", () => {
    it("quotes a business name with a comma on the CollectRatings sender", () => {
        expect(collectratingsFromLine("Smith, Jones & Co", "Sam"))
            .toBe('"Sam at Smith, Jones & Co" <smith-jones-and-co@send.collectratings.com>');
    });
});
