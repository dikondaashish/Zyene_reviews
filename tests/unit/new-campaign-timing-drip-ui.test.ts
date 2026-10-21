import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NewCampaignTimingStep } from "@/app/(dashboard)/campaigns/new/new-campaign-timing-step";
import type { CampaignForm } from "@/app/(dashboard)/campaigns/new/new-campaign-form-types";

const baseForm: CampaignForm = {
    name: "Test",
    channel: "email",
    trigger_type: "manual_batch",
    sms_template: "",
    email_subject: "s",
    email_template: "b",
    delay_minutes: 0,
    follow_up_enabled: true,
    follow_up_delay_hours: 72,
    stop_on_click: true,
    follow_up_template: "Step2 body",
    drip_step3_template: "",
};

const render = (form: CampaignForm) =>
    renderToStaticMarkup(createElement(NewCampaignTimingStep, { form, updateForm: () => {} }));

describe("NewCampaignTimingStep reminder settings", () => {
    it("shows the configured reminder delay instead of a fixed 7-day schedule", () => {
        const html = render(baseForm);
        expect(html).toContain("Send reminders");
        expect(html).toContain("Up to 2 reminders, 3 days apart");
        expect(html).toContain("Reminder 1 (after 3 days)");
        expect(html).toContain("Reminder 2 (after 6 days)");
        expect(html).toContain("Time between reminders");
        expect(html).not.toContain("Day 0");
    });

    it("explains that opening the link is not proof of a review and offers the stop-on-click switch", () => {
        const html = render(baseForm);
        expect(html).toContain("Stop reminders after the customer opens the link");
        expect(html).toContain("does not prove a review was posted");
        expect(html).toMatch(/id="stop-on-click"[^>]*aria-checked="true"|aria-checked="true"[^>]*id="stop-on-click"/);
    });

    it("explains how delay changes affect already-queued contacts", () => {
        const html = render(baseForm);
        expect(html).toContain("already-queued contacts keep their original delay");
        expect(html).toContain("Applies to reminders not yet sent");
    });

    it("hides reminder details when reminders are off", () => {
        const html = render({ ...baseForm, follow_up_enabled: false });
        expect(html).not.toContain("Time between reminders");
    });
});
