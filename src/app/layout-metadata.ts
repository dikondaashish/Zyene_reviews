import type { Metadata, Viewport } from "next";

import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";

/**
 * Root metadata, split out of layout.tsx so the layout stays a thin shell of
 * providers. Re-exported from `layout.tsx`; Next.js reads it from there.
 *
 * `title.template` is what lets every page set a bare title segment — pages
 * must NOT append "| Zyene Reviews" themselves.
 */
export const metadata: Metadata = {
    metadataBase: new URL(MARKETING_SITE_ORIGIN),
    title: {
        default: "Review Management for Local Businesses",
        template: "%s | Zyene Reviews",
    },
    description:
        "Monitor, respond to, and grow your Google reviews with AI. Zyene Reviews gives local businesses a full reputation management platform starting at $29.99/mo, with no annual contracts.",
    manifest: "/manifest.json",
    icons: {
        icon: [
            { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon_io/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
            { url: "/favicon_io/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: "/favicon_io/apple-touch-icon.png",
        shortcut: "/favicon_io/favicon.ico",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Zyene Reviews",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: MARKETING_SITE_ORIGIN,
        siteName: "Zyene Reviews",
        title: "Zyene Reviews, Review Management for Local Businesses",
        description:
            "Monitor, respond to, and grow your Google reviews with AI. Full reputation management platform starting at $29.99/mo, no annual contracts.",
        images: [
            {
                url: "/og/og-default.png",
                width: 1200,
                height: 630,
                alt: "Zyene Reviews — Reputation Management for Local Businesses",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Zyene Reviews, Review Management for Local Businesses",
        description:
            "Monitor, respond to, and grow your Google reviews with AI. Starting at $29.99/mo, no annual contracts.",
        images: ["/og/og-default.png"],
        site: "@zyenereviews",
    },
    keywords: [
        "review management",
        "reputation management",
        "google reviews",
        "local business reviews",
        "AI review replies",
        "review requests",
        "competitor tracking",
        "local SEO",
    ],
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#fffefb" },
        { media: "(prefers-color-scheme: dark)", color: "#201515" },
    ],
    width: "device-width",
    initialScale: 1,
};
