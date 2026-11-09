import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ optOuts: { data: [] as unknown[], error: null as unknown }, create: vi.fn() }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("@/services/twilio/client", () => ({
    getTwilioClient: () => ({ messages: { create: m.create } }),
    TWILIO_MESSAGING_SERVICE_SID: "MG123", TWILIO_PHONE_NUMBER: null,
}));
vi.mock("@/lib/db/supabase/admin", () => ({
    createAdminClient: () => ({
        from: () => ({ select: () => ({ eq: () => ({ limit: async () => m.optOuts }) }) }),
    }),
}));

import { sendSMS } from "@/services/twilio/send-sms";

describe("sendSMS final opt-out check", () => {
    beforeEach(() => {
        m.create.mockReset().mockResolvedValue({ sid: "SM1" });
        m.optOuts = { data: [], error: null };
    });

    it("sends when the number has not opted out", async () => {
        await expect(sendSMS("+15551234567", "Hi")).resolves.toMatchObject({ sent: true, sid: "SM1" });
    });

    it("blocks a number with duplicate opt-out rows (single() used to error and let it through)", async () => {
        m.optOuts = { data: [{ phone_number: "+15551234567" }], error: null };
        await expect(sendSMS("+15551234567", "Hi")).resolves.toMatchObject({ sent: false });
        expect(m.create).not.toHaveBeenCalled();
    });

    it("does not send when the opt-out list cannot be read", async () => {
        m.optOuts = { data: null as never, error: { message: "db down" } };
        await expect(sendSMS("+15551234567", "Hi")).resolves.toMatchObject({ sent: false });
        expect(m.create).not.toHaveBeenCalled();
    });
});
