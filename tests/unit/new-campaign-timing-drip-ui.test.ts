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
    follow_up_delay_hours: 168,
    follow_up_template: "Step2 body",
    drip_step3_template: "",
};

describe("NewCampaignTimingStep Phase 1 drip UI", () => {
    it("shows drip copy, reminder toggle label, optional step 3, no delay chips", () => {
        const html = renderToStaticMarkup(
            createElement(NewCampaignTimingStep, {
                form: baseForm,
                updateForm: () => {},
            }),
        );
        expect(html).toContain("Enable reminder drip");
        expect(html).toContain("Day 0");
        expect(html).toContain("Day 7");
        expect(html).toContain("Day 14");
        expect(html).toContain("Step 2 message (Day 7)");
        expect(html).toContain("Step 3 message (Day 14)");
        expect(html).toContain("optional");
        expect(html).toContain("Falls back to the Step 2 message if left blank");
        expect(html).not.toContain("24 hours");
        expect(html).not.toContain("48 hours");
        expect(html).not.toContain("72 hours");
        expect(html).not.toContain("Follow-up Delay");
    });
});
