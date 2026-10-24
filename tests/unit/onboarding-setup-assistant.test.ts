import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { buildSetupAssistantInstruction } from "@/lib/support-chat/setup-assistant-prompt";
import { SETUP_STEP_GUIDE, setupAssistantStarters } from "@/lib/support-chat/setup-assistant-copy";
import { SYSTEM_PROMPT_CANARY } from "@/lib/support-chat/guardrails";
import { META_MARKER } from "@/lib/support-chat/reply-meta";

describe("Zyene AI setup assistant", () => {
    it("knows which step the owner is on and every step of setup", () => {
        const prompt = buildSetupAssistantInstruction(4);
        expect(prompt).toContain('They are on the "Plan" step right now.');
        for (const step of Object.values(SETUP_STEP_GUIDE)) expect(prompt).toContain(`- ${step.name}:`);
    });

    it("keeps the website chat's guardrails and output format, without demo or lead widgets", () => {
        const prompt = buildSetupAssistantInstruction(2);
        expect(prompt).toContain(SYSTEM_PROMPT_CANARY);
        expect(prompt).toContain(META_MARKER);
        expect(prompt).toContain('"actions":[],"open":null');
        expect(prompt).toContain("support@zyenereviews.com");
        expect(prompt).not.toMatch(/book or schedule a demo/);
    });

    it("has starter questions for every step", () => {
        for (const step of [1, 2, 3, 4, 5, 6, 7]) expect(setupAssistantStarters(step).length).toBeGreaterThan(0);
    });

    it("answers signed-in owners only, limited per account, with the step checked", () => {
        const api = readFileSync("src/services/support-chat/setup-assistant-api.ts", "utf8");
        expect(api).toContain("auth.getUser()");
        expect(api).toContain("step: z.number().int().min(1).max(7)");
        expect(api).toContain("`setup:${user.id}`");
        expect(api).toContain("looksLikePromptInjection(question)");
    });

    it("sits at the top of the Get help menu", () => {
        const help = readFileSync("src/components/onboarding/onboarding-help-button.tsx", "utf8");
        expect(help.indexOf("Ask Zyene AI")).toBeLessThan(help.indexOf("Email a person"));
    });
});
