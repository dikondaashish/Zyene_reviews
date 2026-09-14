import { beforeEach, describe, expect, it, vi } from "vitest";
import twilio from "twilio";
import { POST } from "@/app/api/webhooks/twilio/route";

const db = vi.hoisted(() => ({
    upsert: vi.fn(), delete: vi.fn(), eq: vi.fn(), from: vi.fn(),
}));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: () => ({ from: db.from }) }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
const url = "https://app.zyenereviews.com/api/webhooks/twilio";
const token = "test-auth-token";

function request(params: Record<string, string>, signed = true) {
    return new Request(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            ...(signed ? { "x-twilio-signature": twilio.getExpectedTwilioSignature(token, url, params) } : {}),
        },
        body: new URLSearchParams(params),
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TWILIO_AUTH_TOKEN", token);
    vi.stubEnv("TWILIO_WEBHOOK_URL", url);
    db.from.mockReturnValue(db);
    db.delete.mockReturnValue(db);
    db.eq.mockResolvedValue({ error: null });
    db.upsert.mockResolvedValue({ error: null });
});

describe("Twilio inbound messaging", () => {
    it("rejects unsigned requests before accessing data", async () => {
        expect((await POST(request({ From: "+15005550006", Body: "STOP" }, false))).status).toBe(401);
        expect(db.from).not.toHaveBeenCalled();
    });
    it("returns support instructions for HELP", async () => {
        const response = await POST(request({ From: "+15005550006", Body: "help" }));
        expect(await response.text()).toContain("support@zyenereviews.com");
        expect(db.upsert).not.toHaveBeenCalled();
    });
    it("honors Twilio's classified opt-out without sending a duplicate reply", async () => {
        const response = await POST(request({ From: "+15005550006", Body: "custom stop", OptOutType: "STOP" }));
        expect(db.upsert).toHaveBeenCalledWith({ phone_number: "+15005550006" });
        expect(await response.text()).not.toContain("<Message>");
    });
    it.each(["REVOKE", "OPTOUT", "STOP"])("records %s opt-outs", async (Body) => {
        await POST(request({ From: "+15005550006", Body }));
        expect(db.upsert).toHaveBeenCalledWith({ phone_number: "+15005550006" });
    });
    it("returns an error when persisting an opt-out fails", async () => {
        db.upsert.mockResolvedValue({ error: { message: "database unavailable" } });
        const response = await POST(request({ From: "+15005550006", Body: "STOP" }));
        expect(response.status).toBe(500);
    });
    it("processes START events and suppresses Twilio's duplicate reply", async () => {
        const response = await POST(request({ From: "+15005550006", Body: "START", OptOutType: "START" }));
        expect(db.eq).toHaveBeenCalledWith("phone_number", "+15005550006");
        expect(await response.text()).not.toContain("<Message>");
    });
});
