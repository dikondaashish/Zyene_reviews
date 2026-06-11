import type { Metadata } from "next";

/** Shared robots metadata for authenticated app, onboarding, and embed surfaces. */
export const NOINDEX_ROBOTS: NonNullable<Metadata["robots"]> = {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
};
