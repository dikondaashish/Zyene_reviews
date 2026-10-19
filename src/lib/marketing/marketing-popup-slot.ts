/**
 * One interruptive marketing popup per session. The lead wizard and the exit-intent
 * offer both claim this slot before opening, so two popups never stack.
 */

export type MarketingPopupId = "lead_wizard" | "exit_intent";

const SLOT_KEY = "zyene-popup-slot";
let activeOwner: MarketingPopupId | null = null;

/** Pure rule: the slot is free when nobody owns it, or the requester already does. */
export function canClaimPopupSlot(owner: MarketingPopupId | null, requester: MarketingPopupId): boolean {
    return owner === null || owner === requester;
}

function readSessionOwner(): MarketingPopupId | null {
    try {
        const value = window.sessionStorage.getItem(SLOT_KEY);
        return value === "lead_wizard" || value === "exit_intent" ? value : null;
    } catch {
        return null;
    }
}

export function popupSlotOwner(): MarketingPopupId | null {
    return activeOwner ?? readSessionOwner();
}

/** Auto-triggered popups call this; `force` is for visitor-initiated opens (a button click). */
export function claimPopupSlot(id: MarketingPopupId, opts: { force?: boolean } = {}): boolean {
    if (!opts.force && !canClaimPopupSlot(popupSlotOwner(), id)) return false;
    activeOwner = id;
    try {
        window.sessionStorage.setItem(SLOT_KEY, id);
    } catch {
        // Still coordinated in memory for this page when storage is unavailable.
    }
    return true;
}

/** The popup closed: nothing is on screen, but the session record keeps others away. */
export function releasePopupSlot(id: MarketingPopupId): void {
    if (activeOwner === id) activeOwner = null;
}

export function isPopupOnScreen(): boolean {
    return activeOwner !== null;
}
