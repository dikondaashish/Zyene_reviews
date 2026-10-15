"use client";

import { openPrivacySettings } from "@/lib/privacy/privacy-store";

/**
 * Persistent footer control that reopens privacy settings in every region,
 * whatever was chosen before. One label everywhere keeps static pages
 * hydration-safe (the region is only known in the browser).
 */
export function PrivacyChoicesButton({ className }: { className?: string }) {
    return (
        <button type="button" onClick={openPrivacySettings} className={className} aria-haspopup="dialog">
            Privacy choices
        </button>
    );
}
