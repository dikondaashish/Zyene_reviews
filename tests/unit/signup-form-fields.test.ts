import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const source = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");
const hook = source("src/app/(auth)/signup/use-signup-form.ts");
const fields = source("src/app/(auth)/signup/signup-form-fields.tsx");
const phone = source("src/app/(auth)/signup/signup-form-phone-fields.tsx");

describe("signup form", () => {
    it("requires a mobile number for new owners but not for invited team members", () => {
        expect(hook).toContain("const phoneRequired = !inviteToken;");
        expect(hook).toContain("if (phoneRequired && !phoneTrimmed)");
        expect(phone).toContain("required={phoneRequired}");
        expect(phone).not.toContain("<details");
    });

    it("keeps SMS consent optional and unticked", () => {
        expect(hook).toContain("useState(false);");
        expect(phone).toContain("Consent is not required to use the");
        expect(phone).not.toMatch(/id="smsReviewAlertsConsent"[^>]*required/);
    });

    it("asks for the password twice and blocks a mismatch before anything is sent", () => {
        expect(fields).toContain('id="confirmPassword"');
        expect(hook.indexOf("password !== confirmPassword")).toBeLessThan(hook.indexOf("supabase.auth.signUp"));
    });

    it("uses one 8-character minimum, matching the strength checklist", () => {
        expect(hook).toContain("password.length < 8");
        expect(fields).toContain('placeholder="At least 8 characters"');
        expect(source("src/app/(auth)/reset-password/use-reset-password-form.ts")).toContain("password.length < 8");
    });
});
