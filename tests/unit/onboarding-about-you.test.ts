import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const source = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");
const action = source("src/app/actions/onboarding/about-you.ts");
const step = source("src/components/onboarding/step-about-you.tsx");

describe("About you step", () => {
    it("requires a mobile number when none is saved, checked on the server too", () => {
        expect(action).toContain("if (!savedPhone && !newPhone)");
        expect(action).toContain("isPlausibleMobileNumber(newPhone)");
        expect(step).toContain("{!hasPhone && (");
    });

    it("keeps SMS alerts optional and only texts with consent", () => {
        expect(step).toContain("useState(false)");
        expect(step).toContain("Consent is not required to use the");
        expect(action).toContain("sms_phone_number: smsConsent ? mobile : null");
    });

    it("lets only the organization owner set business or agency", () => {
        expect(action).toContain('accountType: z.enum(["business", "agency"])');
        expect(action).toContain("isOrganizationOwnerRole(member.role)");
    });

    it("moves on to Connect once saved", () => {
        expect(action).toContain("onboarding_step: 2");
    });
});
