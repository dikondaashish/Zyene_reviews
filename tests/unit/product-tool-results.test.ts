import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ metrics: vi.fn(), lead: vi.fn(), send: vi.fn() }));
vi.mock("@/lib/free-tools/places-public", () => ({ fetchPublicPlaceMetrics: mocks.metrics }));
vi.mock("@/lib/free-tools/capture-tool-lead", () => ({ captureToolLead: mocks.lead }));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: mocks.send }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
import { handlePlaceTool } from "@/lib/free-tools/place-tool-handler";
import { isBusinessWebsitePage } from "@/services/aeo/content-briefs/owned-page";
import { renderCampaignPreview } from "@/lib/campaigns/preview";
const request = (body: unknown) => new Request("https://example.test", { method: "POST", body: JSON.stringify(body) });
beforeEach(() => {
    vi.clearAllMocks();
    mocks.metrics.mockResolvedValue({ name: "My Business", totalReviews: 12, averageRating: 4.5, reviewLink: "https://google.test/review" });
    mocks.lead.mockResolvedValue({ ok: true });
    mocks.send.mockResolvedValue({ sent: false });
});
describe("public tool evidence", () => {
    it("returns a usable review link without collecting an email", async () => {
        const response = await handlePlaceTool(request({ placeId: "ChIJ_test" }), "review-link");
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ reviewLink: "https://google.test/review", emailSent: false });
        expect(mocks.lead).not.toHaveBeenCalled();
        expect(mocks.send).not.toHaveBeenCalled();
    });
    it("keeps the public result when email delivery fails and does not claim success", async () => {
        const result = await (await handlePlaceTool(request({ placeId: "ChIJ_test", email: "owner@example.test" }), "reputation-score")).json();
        expect(result).toMatchObject({ emailSent: false, fullReport: false, preview: { totalReviews: 12 } });
        expect(result.preview).not.toHaveProperty("estimatedResponseRatePct");
        expect(result.emailWarning).toBeTruthy();
    });
    it("keeps the result if the optional email service throws", async () => {
        mocks.send.mockRejectedValueOnce(new Error("Email unavailable"));
        const response = await handlePlaceTool(request({ placeId: "ChIJ_test", email: "owner@example.test" }), "review-link");
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ reviewLink: "https://google.test/review", emailSent: false });
    });
    it("rejects malformed typed input before external work", async () => {
        const response = await handlePlaceTool(request({ placeId: { attack: true } }), "review-link");
        expect(response.status).toBe(400);
        expect(mocks.metrics).not.toHaveBeenCalled();
    });
});
it("only recommends pages on the business website", () => {
    expect(isBusinessWebsitePage("https://www.example.com/menu", "example.com")).toBe(true);
    for (const url of ["https://competitor.com/menu", "https://example.com.evil.test", "https://example.com@evil.test", "javascript:alert(1)"]) {
        expect(isBusinessWebsitePage(url, "https://example.com")).toBe(false);
    }
    expect(isBusinessWebsitePage("https://example.com", null)).toBe(false);
});
it("uses the active business and preserves replacement characters in its name", () => {
    const preview = renderCampaignPreview("Hi {customer_name}: {business_name} {review_link}", { businessName: "A $& B", slug: "real-business", timezone: "America/New_York" });
    expect(preview).toContain("Sample customer: A $& B");
    expect(preview).toContain("/real-business");
    expect(preview).not.toContain("Sunrise");
});
