/** Browser memory for the lead wizard's adaptive frequency capping. Every access is wrapped: storage can throw. */

import {
    LEAD_WIZARD_GOAL_IDS,
    LEAD_WIZARD_INDUSTRY_IDS,
    type LeadWizardGoal,
    type LeadWizardIndustry,
} from "@/lib/marketing/lead-wizard-personalization";
import { EMPTY_MEMORY, type LeadWizardMemory } from "@/lib/marketing/lead-wizard-targeting";

const MEMORY_KEY = "zyene-lead-wizard";
const SESSION_KEY = "zyene-lead-wizard-shown";

const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);
const oneOf = <T extends string>(value: unknown, options: readonly T[]) =>
    (options as readonly unknown[]).includes(value) ? (value as T) : undefined;

export function parseLeadWizardMemory(raw: string | null): LeadWizardMemory {
    if (!raw) return { ...EMPTY_MEMORY };
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return { ...EMPTY_MEMORY };
        const r = parsed as Record<string, unknown>;
        return {
            dismissedAt: num(r.dismissedAt),
            convertedAt: num(r.convertedAt),
            // Records without a count still had one dismissal.
            dismissCount: num(r.dismissCount) ?? (num(r.dismissedAt) !== null ? 1 : 0),
            autoViews: num(r.autoViews) ?? 0,
            lastStep: r.lastStep === "questions" || r.lastStep === "email" ? r.lastStep : null,
            industry: oneOf<LeadWizardIndustry>(r.industry, LEAD_WIZARD_INDUSTRY_IDS),
            goal: oneOf<LeadWizardGoal>(r.goal, LEAD_WIZARD_GOAL_IDS),
        };
    } catch {
        return { ...EMPTY_MEMORY };
    }
}

export function readLeadWizardMemory(): LeadWizardMemory {
    try {
        return parseLeadWizardMemory(window.localStorage.getItem(MEMORY_KEY));
    } catch {
        return { ...EMPTY_MEMORY };
    }
}

function writeMemory(update: (memory: LeadWizardMemory) => Partial<LeadWizardMemory>) {
    try {
        const current = readLeadWizardMemory();
        window.localStorage.setItem(MEMORY_KEY, JSON.stringify({ ...current, ...update(current) }));
    } catch {
        // Capping falls back to the per-session rule when storage is unavailable.
    }
}

export function rememberAutoView() {
    writeMemory((m) => ({ autoViews: m.autoViews + 1 }));
}

export function rememberDismissed(
    details: { step: string; industry?: LeadWizardIndustry; goal?: LeadWizardGoal },
    now = Date.now(),
) {
    writeMemory((m) => ({
        dismissedAt: now,
        dismissCount: m.dismissCount + 1,
        lastStep: details.step === "email" ? "email" : "questions",
        industry: details.industry,
        goal: details.goal,
    }));
}

export function rememberConverted(now = Date.now()) {
    writeMemory(() => ({ convertedAt: now }));
}

export function wasShownThisSession(): boolean {
    try {
        return window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
        return false;
    }
}

export function markShownThisSession() {
    try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
        // Session cap is best-effort without storage.
    }
}
