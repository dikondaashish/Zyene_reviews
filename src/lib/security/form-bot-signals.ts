import { z } from "zod";

/** Faster than a person can read a form and type a name, an email and a sentence. */
export const MIN_HUMAN_SUBMIT_MS = 3000;

/**
 * Fields a public form posts alongside its real ones so the server can tell a
 * script from a person. Deliberately loose (no length caps, any type coerced):
 * a bot stuffing the honeypot must reach `looksAutomated`, not a 400 that tells
 * it which field to leave alone.
 */
export const formBotSignalFields = {
    /** Honeypot: hidden from people, so only a bot fills it. */
    website: z.unknown().optional(),
    /** Milliseconds between the form appearing and the submit. */
    elapsedMs: z.unknown().optional(),
};

export type FormBotVerdict = "human" | "honeypot" | "too_fast" | "no_timing";

/**
 * `no_timing` means the form's own JavaScript did not produce the request -
 * either a script posting straight to the endpoint, or a visitor on a page
 * cached from before the field existed. Callers should answer that one with a
 * visible "refresh and retry" rather than a silent drop, so a real person is
 * never told their message was sent when it was not.
 */
export function formBotVerdict(signals: { website?: unknown; elapsedMs?: unknown }): FormBotVerdict {
    if (typeof signals.website === "string" ? signals.website.trim() !== "" : signals.website != null) {
        return "honeypot";
    }
    const elapsed = signals.elapsedMs;
    if (typeof elapsed !== "number" || !Number.isFinite(elapsed)) return "no_timing";
    if (elapsed < MIN_HUMAN_SUBMIT_MS) return "too_fast";
    return "human";
}
