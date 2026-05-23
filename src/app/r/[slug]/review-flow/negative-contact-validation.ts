import type { PrivateFeedbackContactMode } from "./types";

export function emailLooksValid(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function phoneLooksValid(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) return false;
    return /^[\d+][\d\s().-]{6,31}$/.test(trimmed) && trimmed.replace(/\D/g, "").length >= 7;
}

export function negativeContactValid(
    customerEmail: string,
    customerPhone: string,
    privateFeedbackEmailMode: PrivateFeedbackContactMode,
    privateFeedbackPhoneMode: PrivateFeedbackContactMode
): boolean {
    if (privateFeedbackEmailMode === "required" && !emailLooksValid(customerEmail)) return false;
    if (privateFeedbackEmailMode === "optional" && customerEmail.trim() && !emailLooksValid(customerEmail)) {
        return false;
    }
    if (privateFeedbackPhoneMode === "required" && !phoneLooksValid(customerPhone)) return false;
    if (privateFeedbackPhoneMode === "optional" && customerPhone.trim() && !phoneLooksValid(customerPhone)) {
        return false;
    }
    return true;
}
