"use client";

import { useEffect, useState } from "react";

export type ReviewLinkStatus = "unchanged" | "invalid" | "checking" | "available" | "taken";

/** Lowercase letters, numbers and single dashes, as the link is typed. */
export function cleanReviewLink(raw: string): string {
    return raw.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").slice(0, 60);
}

/** The owner's edit of their review link: checked as they type, saved only when they continue. */
export function useReviewLinkDraft(businessId: string, initialSlug: string) {
    const [value, setValue] = useState(initialSlug);
    const [checked, setChecked] = useState<{ slug: string; available: boolean } | null>(null);
    const trimmed = value.replace(/^-+|-+$/g, "");
    const valid = trimmed.length >= 3;

    useEffect(() => {
        if (!valid || trimmed === initialSlug) return;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            fetch(`/api/businesses/check-slug?slug=${encodeURIComponent(trimmed)}&businessId=${encodeURIComponent(businessId)}`, { signal: controller.signal })
                .then((res) => res.json())
                .then((body: { available?: boolean }) => setChecked({ slug: trimmed, available: body.available === true }))
                .catch(() => {});
        }, 400);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [trimmed, valid, initialSlug, businessId]);

    const status: ReviewLinkStatus = trimmed === initialSlug ? "unchanged" : !valid ? "invalid"
        : checked?.slug === trimmed ? (checked.available ? "available" : "taken") : "checking";

    /** True when there is nothing to save or the new link saved; false keeps the owner on the step. */
    const save = async (): Promise<{ ok: boolean; slug: string; error?: string }> => {
        if (status === "unchanged") return { ok: true, slug: initialSlug };
        if (status !== "available") return { ok: false, slug: initialSlug, error: status === "taken" ? "That link is taken. Try another." : "Use at least 3 letters or numbers." };
        const res = await fetch(`/api/businesses/${businessId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug: trimmed }),
        }).catch(() => null);
        const body = (await res?.json().catch(() => null)) as { error?: string } | null;
        if (!res?.ok) {
            if (res?.status === 409) setChecked({ slug: trimmed, available: false });
            return { ok: false, slug: initialSlug, error: body?.error || "We couldn't save your link. Try again." };
        }
        return { ok: true, slug: trimmed };
    };

    return { value, setValue: (raw: string) => setValue(cleanReviewLink(raw)), status, save };
}
