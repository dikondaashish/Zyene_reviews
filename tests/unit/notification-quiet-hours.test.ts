import { expect, it } from "vitest";
import { isInQuietHours } from "@/lib/notifications/quiet-hours";
import { notificationFormSchema } from "@/components/settings/notification-form-schema";
it("uses business local time across midnight and daylight saving", () => {
    expect(isInQuietHours(new Date("2026-07-01T03:00:00Z"), "22:00", "08:00", "America/New_York")).toBe(true);
    expect(isInQuietHours(new Date("2026-07-01T14:00:00Z"), "22:00", "08:00", "America/New_York")).toBe(false);
    expect(isInQuietHours(new Date("2026-01-01T13:00:00Z"), "22:00", "08:00", "America/New_York")).toBe(false);
});
it("requires a phone for SMS but permits email-only alerts", () => {
    const input = { sms_enabled: true, phone_number: "", email_enabled: true, digest_enabled: true, min_urgency_score: "7" };
    expect(notificationFormSchema.safeParse(input).success).toBe(false);
    expect(notificationFormSchema.safeParse({ ...input, sms_enabled: false }).success).toBe(true);
    expect(notificationFormSchema.safeParse({ ...input, phone_number: "+1 (212) 555-0123" }).success).toBe(true);
});
