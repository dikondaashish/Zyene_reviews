import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { smsLabel } from "@/lib/security/sms-label";
import { dashboardRequestSms } from "@/lib/review-requests/dashboard-request-message";
import { recoveryEmailPlainText, recoveryEmailTemplate } from "@/services/resend/templates/recovery-email";
import { EMAIL_BRAND } from "@/lib/email/email-brand";

describe("review request output encoding", () => {
    it("keeps customer and business labels on one SMS line without URL injection", () => {
        const payload = "Ash\nReply STOP\nhttps://evil.example/a";
        const message = dashboardRequestSms(payload, "Shop\r\nClick https://evil.example", "https://good.example/r");
        expect(message).not.toContain("\nReply STOP\nhttps://evil.example");
        expect(message).not.toContain("https://evil.example");
        expect(message).toContain("https://good.example/r");
        expect(message.split("\n")).toHaveLength(2);
        expect(smsLabel("José & Co.", "us")).toBe("José & Co.");
        expect(smsLabel("Click evil.example/path", "there")).not.toContain("evil.example");
        expect(smsLabel("www.evil.example", "there")).toBe("there");
    });

    it("escapes untrusted business and customer names in recovery HTML", () => {
        const html = recoveryEmailTemplate({
            businessName: "<img src=x onerror=alert(1)>",
            customerName: "<script>alert(1)</script>",
        });
        expect(html).not.toContain("<script>");
        expect(html).not.toContain("<img src=x");
        expect(html).toContain("&lt;script&gt;");
        expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    });

    it("writes the recovery letter as the business, without Zyene branding", () => {
        const props = { businessName: "Willow Hair Studio", customerName: "Linda Smith", senderName: "Sam" };
        const html = recoveryEmailTemplate(props);
        expect(html).not.toContain(EMAIL_BRAND.logo);
        expect(html).not.toContain(EMAIL_BRAND.address);
        expect(html).not.toContain("Zyene");
        expect(recoveryEmailPlainText(props)).toContain("Hi Linda,");
        expect(recoveryEmailPlainText(props)).toContain("Sam, Willow Hair Studio");
        expect(recoveryEmailPlainText({ businessName: "Willow Hair Studio" })).toContain("The Willow Hair Studio team");
    });

    it("uses the safe label at every customer-name SMS interpolation", () => {
        for (const path of [
            "src/lib/review-requests/send-outbound-dispatch.ts",
            // Bulk sends use the dashboard SMS copy (dashboardRequestSms), which applies smsLabel.
            "src/lib/review-requests/dashboard-request-message.ts",
            "src/lib/notifications/review-request.ts",
        ]) {
            const source = readFileSync(join(process.cwd(), path), "utf8");
            expect(source, path).toContain("smsLabel(");
        }
    });
});
