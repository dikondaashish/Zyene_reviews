import { describe, expect, it } from "vitest";

import { aeoAlertDigestEmail } from "../../src/services/resend/templates/aeo-alert-digest-email";

describe("aeoAlertDigestEmail", () => {
    it("links every alert to its specific evidence", () => {
        const html = aeoAlertDigestEmail({
            businessName: "Acme",
            alerts: [{
                severity: "high",
                title: "Visibility dropped",
                detail: "ChatGPT stopped naming the business.",
                evidenceUrl: "https://app.example.com/google-seo-aeo/prompts/prompt-1#engine-chatgpt",
            }],
            totalCount: 1,
            dashboardUrl: "https://app.example.com/google-seo-aeo",
            settingsUrl: "https://app.example.com/settings/notifications",
        });

        expect(html).toContain(
            'href="https://app.example.com/google-seo-aeo/prompts/prompt-1#engine-chatgpt"'
        );
        expect(html).toContain("View evidence");
    });
});
