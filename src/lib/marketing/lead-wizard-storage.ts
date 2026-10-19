/** Browser memory for the lead wizard's frequency capping. Every access is wrapped: storage can throw. */

import type { LeadWizardMemory } from "@/lib/marketing/lead-wizard-targeting";

const MEMORY_KEY = "zyene-lead-wizard";
const SESSION_KEY = "zyene-lead-wizard-shown";

export function parseLeadWizardMemory(raw: string | null): LeadWizardMemory {
    const empty: LeadWizardMemory = { dismissedAt: null, convertedAt: null };
    if (!raw) return empty;
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return empty;
        const record = parsed as Record<string, unknown>;
        const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);
        return { dismissedAt: num(record.dismissedAt), convertedAt: num(record.convertedAt) };
    } catch {
        return empty;
    }
}

export function readLeadWizardMemory(): LeadWizardMemory {
    try {
        return parseLeadWizardMemory(window.localStorage.getItem(MEMORY_KEY));
    } catch {
        return parseLeadWizardMemory(null);
    }
}

function writeMemory(patch: Partial<LeadWizardMemory>) {
    try {
        window.localStorage.setItem(MEMORY_KEY, JSON.stringify({ ...readLeadWizardMemory(), ...patch }));
    } catch {
        // Capping falls back to the per-session rule when storage is unavailable.
    }
}

export function rememberDismissed(now = Date.now()) {
    writeMemory({ dismissedAt: now });
}

export function rememberConverted(now = Date.now()) {
    writeMemory({ convertedAt: now });
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
