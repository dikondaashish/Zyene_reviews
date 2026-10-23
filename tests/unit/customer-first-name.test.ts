import { describe, expect, it } from "vitest";
import { customerFirstName, fillSubjectFirstName } from "@/lib/email/customer-first-name";
import { renderCampaignSubject } from "@/lib/notifications/review-request";
import { reviewRequestEmail, reviewRequestEmailPlainText } from "@/services/resend/templates/review-request-email";

describe("customerFirstName", () => {
    it.each([
        ["ashish dikonda", "Ashish"],
        ["  Maria  Lopez ", "Maria"],
        ["O'Neil", "O'Neil"],
        ["", ""],
        ["Customer", ""],
        ["john123", ""],
        ["test@example.com", ""],
    ])("%s -> %s", (input, expected) => {
        expect(customerFirstName(input)).toBe(expected);
    });
});

describe("{first_name} in subjects", () => {
    it("fills the first name", () => {
        expect(fillSubjectFirstName("{first_name}, how was your meal?", "maria lopez")).toBe("Maria, how was your meal?");
    });

    it("leaves subjects without {first_name} exactly as written", () => {
        expect(fillSubjectFirstName("thanks for visiting", "")).toBe("thanks for visiting");
    });

    it("drops the name and its comma when there is no usable name", () => {
        expect(fillSubjectFirstName("{first_name}, how was your meal?", "")).toBe("How was your meal?");
        expect(renderCampaignSubject("{first_name}, welcome to {business_name}", "Customer", "Sunrise")).toBe("Welcome to Sunrise");
    });
});

describe("{first_name} in email bodies", () => {
    const props = { customerName: "maria lopez", businessName: "Sunrise", reviewLink: "https://collectratings.com/x", template: "Hi {first_name},\n\nThanks.\n\n{review_link}\n\nThank you,\n{business_name}" };

    it("greets by first name in the text and HTML versions", () => {
        expect(reviewRequestEmailPlainText(props)).toContain("Hi Maria,");
        const html = reviewRequestEmail(props);
        expect(html).toContain("Hi Maria,");
        expect(html).not.toContain("{first_name}");
    });

    it("falls back to 'there' without a usable name", () => {
        expect(reviewRequestEmailPlainText({ ...props, customerName: "" })).toContain("Hi there,");
    });
});
