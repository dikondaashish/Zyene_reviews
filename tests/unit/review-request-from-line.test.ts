import { describe, expect, it } from "vitest";

import { mailboxLocalPart, reviewRequestFromLine } from "../../src/lib/email/review-request-from-line";

const collect = { kind: "collect" as const, from: "CollectRatings <hello@send.collectratings.com>" };
const primary = { kind: "primary" as const, from: "Zyene Reviews <hello@zyenereviews.com>" };

describe("reviewRequestFromLine", () => {
    it("sends as the business on the collect domain", () => {
        expect(reviewRequestFromLine(collect, "Willow Hair Studio", "Sam"))
            .toBe("Sam at Willow Hair Studio <willow-hair-studio@send.collectratings.com>");
        expect(reviewRequestFromLine(collect, "Café & Co", ""))
            .toBe("Café & Co <cafe-and-co@send.collectratings.com>");
    });

    it("falls back to the configured From line without a business name", () => {
        expect(reviewRequestFromLine(collect, "", "Sam")).toBe(collect.from);
    });

    it("keeps the shared mailbox on the primary account", () => {
        expect(reviewRequestFromLine(primary, "Wolfpack BBQ", "Sam")).toBe("Sam <hello@zyenereviews.com>");
        expect(reviewRequestFromLine(primary, "Wolfpack BBQ", null)).toBe("Wolfpack BBQ <hello@zyenereviews.com>");
        expect(reviewRequestFromLine(primary, "", "")).toBe(primary.from);
    });

    it("strips characters that would break the header", () => {
        expect(reviewRequestFromLine(primary, null, 'Sam "<x>"\r\nBcc: a@b.c'))
            .toBe('"Sam xBcc: a@b.c" <hello@zyenereviews.com>');
    });

    it("quotes business names that contain header specials", () => {
        expect(reviewRequestFromLine(collect, "Smith, Jones & Co", "Sam"))
            .toBe('"Sam at Smith, Jones & Co" <smith-jones-and-co@send.collectratings.com>');
        expect(reviewRequestFromLine(primary, "Smith, Jones & Co", null))
            .toBe('"Smith, Jones & Co" <hello@zyenereviews.com>');
    });
});

describe("mailboxLocalPart", () => {
    it("falls back to hello when nothing usable remains", () => {
        expect(mailboxLocalPart("!!!")).toBe("hello");
    });
});
