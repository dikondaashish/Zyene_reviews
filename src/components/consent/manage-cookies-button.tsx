"use client";

import { openCookiePreferences } from "@/lib/consent/consent-store";

/** Footer link that reopens cookie settings so a choice can be changed or withdrawn at any time. */
export function ManageCookiesButton({ className }: { className?: string }) {
    return (
        <button type="button" onClick={openCookiePreferences} className={className}>
            Manage cookies
        </button>
    );
}
