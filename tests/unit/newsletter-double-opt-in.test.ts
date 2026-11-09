import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    findByEmail: vi.fn(),
    findByToken: vi.fn(),
    insertPending: vi.fn(),
    resetToPending: vi.fn(),
    claimResend: vi.fn(),
    confirmByToken: vi.fn(),
    sendEmail: vi.fn(),
    sourceEvent: vi.fn(),
}));

vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: () => ({}) }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: mocks.sendEmail }));
vi.mock("@/lib/marketing/newsletter-source-events", () => ({ recordNewsletterSourceEvent: mocks.sourceEvent }));
vi.mock("@/lib/marketing/newsletter-subscriber-store", () => ({
    findSubscriberByEmail: mocks.findByEmail,
    findSubscriberByToken: mocks.findByToken,
    insertPendingSubscriber: mocks.insertPending,
    resetSubscriberToPending: mocks.resetToPending,
    claimConfirmationResend: mocks.claimResend,
    confirmSubscriberByToken: mocks.confirmByToken,
}));

import { processNewsletterSubscribe } from "@/lib/marketing/newsletter-subscribe";
import { confirmNewsletterSubscription } from "@/lib/marketing/newsletter-confirm";

const TOKEN = "11111111-1111-4111-8111-111111111111";

function row(overrides: Record<string, unknown> = {}) {
    return {
        id: "sub-1",
        email: "owner@example.com",
        source: "newsletter",
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        subscribed_at: new Date().toISOString(),
        unsubscribed_at: null,
        confirmed_at: null,
        confirmation_token: TOKEN,
        confirmation_sent_at: new Date().toISOString(),
        ...overrides,
    };
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

beforeEach(() => {
    vi.clearAllMocks();
    mocks.sendEmail.mockResolvedValue({ sent: true, id: "email-1" });
});

describe("public newsletter sign-up (double opt-in)", () => {
    it("stores a new address as pending and sends only a confirmation link", async () => {
        mocks.findByEmail.mockResolvedValue(null);
        mocks.insertPending.mockResolvedValue(row());

        const result = await processNewsletterSubscribe({ email: " Owner@Example.com ", source: "newsletter" });

        expect(result).toEqual({ ok: true, newLead: true });
        expect(mocks.insertPending).toHaveBeenCalledWith({}, expect.objectContaining({ email: "owner@example.com" }));
        expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
        const mail = mocks.sendEmail.mock.calls[0][0];
        expect(mail.stream).toBe("forms");
        expect(mail.subject).toBe("Confirm your email for Zyene Reviews");
        expect(mail.html).toContain(`/newsletter/confirm?token=${TOKEN}`);
    });

    it("sends nothing to an address that is already confirmed", async () => {
        mocks.findByEmail.mockResolvedValue(row({ confirmed_at: hoursAgo(100) }));
        const result = await processNewsletterSubscribe({ email: "owner@example.com" });
        expect(result).toEqual({ ok: true, newLead: false });
        expect(mocks.sendEmail).not.toHaveBeenCalled();
    });

    it("sends at most one confirmation a day to a pending address", async () => {
        mocks.findByEmail.mockResolvedValue(row({ confirmation_sent_at: hoursAgo(2) }));
        await processNewsletterSubscribe({ email: "owner@example.com" });
        expect(mocks.claimResend).not.toHaveBeenCalled();
        expect(mocks.sendEmail).not.toHaveBeenCalled();

        mocks.findByEmail.mockResolvedValue(row({ confirmation_sent_at: hoursAgo(25) }));
        mocks.claimResend.mockResolvedValue(row());
        await processNewsletterSubscribe({ email: "owner@example.com" });
        expect(mocks.claimResend).toHaveBeenCalledWith({}, "sub-1", expect.any(String));
        expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
    });

    it("still sends a confirmation when another lead form just refreshed the row", async () => {
        // A demo or free-tool form stored the address minutes ago, but no confirmation was ever sent.
        mocks.findByEmail.mockResolvedValue(row({ subscribed_at: hoursAgo(0.1), confirmation_sent_at: null }));
        mocks.claimResend.mockResolvedValue(row());
        await processNewsletterSubscribe({ email: "owner@example.com" });
        expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
    });

    it("sends nothing when a concurrent request already claimed the resend", async () => {
        mocks.findByEmail.mockResolvedValue(row({ confirmation_sent_at: null }));
        mocks.claimResend.mockResolvedValue(null);
        await processNewsletterSubscribe({ email: "owner@example.com" });
        expect(mocks.sendEmail).not.toHaveBeenCalled();
    });

    it("makes an unsubscribed address confirm again instead of reactivating it", async () => {
        mocks.findByEmail.mockResolvedValue(row({ unsubscribed_at: hoursAgo(5), confirmed_at: hoursAgo(500) }));
        mocks.resetToPending.mockResolvedValue(row());

        const result = await processNewsletterSubscribe({ email: "owner@example.com" });

        expect(result).toEqual({ ok: true, newLead: true });
        expect(mocks.resetToPending).toHaveBeenCalledWith({}, "sub-1", expect.objectContaining({ email: "owner@example.com" }));
        expect(mocks.sendEmail.mock.calls[0][0].subject).toBe("Confirm your email for Zyene Reviews");
    });

    it("rejects an invalid email without touching the database", async () => {
        const result = await processNewsletterSubscribe({ email: "not-an-email" });
        expect(result).toEqual({ ok: false, error: "Valid email is required", status: 400 });
        expect(mocks.findByEmail).not.toHaveBeenCalled();
    });
});

describe("confirming a newsletter sign-up", () => {
    it("sends only the welcome email once confirmed", async () => {
        mocks.confirmByToken.mockResolvedValue(row({ confirmed_at: new Date().toISOString() }));

        expect(await confirmNewsletterSubscription(TOKEN)).toBe("confirmed");
        expect(mocks.sendEmail.mock.calls[0][0]).toMatchObject({ stream: "marketing", to: "owner@example.com" });
        expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
        expect(mocks.sourceEvent).toHaveBeenCalledWith("newsletter", "subscribe_success", expect.anything());
    });

    it("sends the template pack for template-pack sign-ups", async () => {
        mocks.confirmByToken.mockResolvedValue(row({ source: "review_request_templates" }));
        await confirmNewsletterSubscription(TOKEN);
        expect(mocks.sendEmail.mock.calls[0][0].subject).toBe("Your Review Request Template Pack");
    });

    it("does not resend anything when the link is used twice", async () => {
        mocks.confirmByToken.mockResolvedValue(null);
        mocks.findByToken.mockResolvedValue(row({ confirmed_at: hoursAgo(1) }));
        expect(await confirmNewsletterSubscription(TOKEN)).toBe("already_confirmed");
        expect(mocks.sendEmail).not.toHaveBeenCalled();
    });

    it("treats malformed, unknown and unsubscribed tokens as invalid", async () => {
        expect(await confirmNewsletterSubscription("not-a-uuid")).toBe("invalid");
        expect(mocks.confirmByToken).not.toHaveBeenCalled();

        mocks.confirmByToken.mockResolvedValue(null);
        mocks.findByToken.mockResolvedValue(null);
        expect(await confirmNewsletterSubscription(TOKEN)).toBe("invalid");

        mocks.findByToken.mockResolvedValue(row({ confirmed_at: hoursAgo(1), unsubscribed_at: hoursAgo(0.5) }));
        expect(await confirmNewsletterSubscription(TOKEN)).toBe("invalid");
        expect(mocks.sendEmail).not.toHaveBeenCalled();
    });
});
