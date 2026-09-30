import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/lib/security/html-escape";
import { reviewAlertEmail } from "@/services/resend/templates/review-alert-email";
import { weeklyDigestEmail } from "@/services/resend/templates/weekly-digest-email";
import { teamInviteEmail } from "@/services/resend/templates/team-invite-email";

const payload = '<a href="https://attacker.example.test/">Verify billing</a><img src=x onerror=alert(1)>';
const alert = { businessName: "Synthetic Business", rating: 2, authorName: "Customer", reviewText: "Feedback",
    urgencyScore: 8, dashboardUrl: "https://app.example.test/dashboard", settingsUrl: "https://app.example.test/settings" };
const digest = { businessName: "Synthetic Business", reviews: [{ rating: 2, authorName: "Customer", text: "Feedback" }],
    totalNew: 1, avgRating: 2, pendingCount: 1, dashboardUrl: alert.dashboardUrl, settingsUrl: alert.settingsUrl };

describe("transactional email HTML encoding", () => {
    it.each(["businessName", "authorName", "reviewText", "customerPhone"] as const)(
        "renders alert %s as text, never reviewer-authored markup", field => {
            const html = reviewAlertEmail({ ...alert, [field]: payload });
            expect(html).not.toContain(payload);
            expect(html).toContain(escapeHtml(payload));
        },
    );
    it.each(["authorName", "text"] as const)("encodes digest review %s after truncation", field => {
        const html = weeklyDigestEmail({ ...digest, reviews: [{ ...digest.reviews[0], [field]: payload }] });
        expect(html).not.toContain('<a href="https://attacker.example.test/">');
        expect(html).toContain(escapeHtml(payload.slice(0, field === "text" ? 100 : undefined)));
    });
    it("encodes business names in digest headings", () => {
        expect(weeklyDigestEmail({ ...digest, businessName: payload })).toContain(escapeHtml(payload));
    });
    it.each(["inviter", "organization"] as const)("encodes invitation %s names", field => {
        const html = teamInviteEmail("https://auth.example.test/signup?invite=synthetic", field === "inviter" ? payload : "Owner", field === "organization" ? payload : "Organization");
        expect(html).not.toContain(payload);
        expect(html).toContain(escapeHtml(payload));
    });
    it("keeps reply recipient and author text inside their mailto URI components", () => {
        const email = 'customer"@example.test?cc=attacker@example.test';
        const name = 'Customer&cc=attacker@example.test" onclick="alert(1)';
        const html = reviewAlertEmail({ ...alert, authorName: name, customerEmail: email });
        const href = html.match(/href="(mailto:[^"]+)"/)?.[1].replaceAll("&amp;", "&");
        expect(href).toBeDefined();
        const parsed = new URL(href!);
        expect(decodeURIComponent(parsed.pathname)).toBe(email);
        expect(parsed.searchParams.get("cc")).toBeNull();
        expect(parsed.searchParams.get("body")).toContain(name);
        expect(html).not.toContain('" onclick="');
    });
    it("preserves normal contact links and plaintext ampersands", () => {
        const html = reviewAlertEmail({ ...alert, authorName: "A & B", customerEmail: "customer@example.test", customerPhone: "+1 (555) 0100" });
        expect(html).toContain("A &amp; B");
        expect(html).toContain('href="tel:+15550100"');
        const href = html.match(/href="(mailto:[^"]+)"/)?.[1].replaceAll("&amp;", "&");
        const parsed = new URL(href!);
        expect(decodeURIComponent(parsed.pathname)).toBe("customer@example.test");
        expect(parsed.searchParams.get("subject")).toBe("Regarding your recent feedback");
        expect(parsed.searchParams.get("body")).toContain("Hi A & B,");
    });
    it("encodes all template href attribute boundaries without changing server-created links", () => {
        const url = 'https://app.example.test/path?q=" onclick="alert(1)&token=synthetic';
        for (const html of [reviewAlertEmail({ ...alert, dashboardUrl: url, settingsUrl: url }),
            weeklyDigestEmail({ ...digest, dashboardUrl: url, settingsUrl: url }), teamInviteEmail(url, "Owner", "Org")]) {
            expect(html).not.toContain('" onclick="');
            expect(html).toContain(escapeHtml(url));
        }
    });
});
