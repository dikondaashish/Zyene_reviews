import type { Metadata } from "next";
import { DOC_NAV_GROUPS } from "@/lib/docs/doc-nav";
import { buildMarketingMetadata } from "@/lib/seo/marketing-page-metadata";
import { marketingCanonicalUrl } from "@/lib/seo/marketing-site-url";

export type DocsPath =
    | "/docs"
    | "/docs/quickstart"
    | "/docs/install"
    | "/docs/how-it-works"
    | "/docs/graph"
    | "/docs/content-types"
    | "/docs/sync"
    | "/docs/api"
    | "/docs/cookbook"
    | "/docs/plugins"
    | "/docs/changelog";

type DocsPageSeo = {
    /** Keyword `<title>` segment; `fitMarketingTitle` keeps the rendered title ≤60. */
    title: string;
    description: string;
    /** Shorter social title (no brand suffix is appended by OG/Twitter). */
    socialTitle: string;
};

/** Single source of truth for developer-docs titles, descriptions, and schema. */
export const DOCS_PAGE_SEO: Record<DocsPath, DocsPageSeo> = {
    "/docs": {
        title: "Review Management API & Developer Docs",
        description: "Developer docs for Zyene Reviews: connect Google Business Profile, read reviews, send review requests via REST API, and embed review widgets.",
        socialTitle: "Zyene Reviews Developer Docs",
    },
    "/docs/quickstart": {
        title: "Review Management API Quickstart Guide",
        description: "Create a Zyene Reviews API key and list your reviews with a working curl request in minutes: prerequisites, key setup, and first API call.",
        socialTitle: "Zyene Reviews API Quickstart",
    },
    "/docs/install": {
        title: "Use the Review API with Cursor & AI Coding Tools",
        description: "Give Cursor, Copilot, and other AI coding assistants the Zyene Reviews doc URLs, a ready prompt, and safe API key handling to build integrations.",
        socialTitle: "Use the Zyene Reviews API with AI Coding Tools",
    },
    "/docs/how-it-works": {
        title: "How Zyene Syncs & Normalizes Your Reviews",
        description: "How Zyene Reviews ingests reviews through OAuth connectors and webhooks, normalizes them across platforms, and delivers them to the dashboard and API.",
        socialTitle: "How Zyene Reviews Works",
    },
    "/docs/graph": {
        title: "Review Data Model: Businesses, Platforms & Reviews",
        description: "The Zyene Reviews review graph: how organizations, businesses, platform connections, reviews, replies, and review requests link over time.",
        socialTitle: "Zyene Reviews Data Model",
    },
    "/docs/content-types": {
        title: "Review API Objects & Content Types Reference",
        description: "Reference for core Zyene Reviews API objects: reviews and their response states, SMS and email review requests, and public replies.",
        socialTitle: "Zyene Reviews API Content Types",
    },
    "/docs/sync": {
        title: "Google, Yelp & Facebook Review Sync Docs",
        description: "How Zyene Reviews syncs reviews from Google Business Profile, Yelp, and Facebook: OAuth scopes, sync frequency, reliability, and troubleshooting.",
        socialTitle: "Review Sync for Google, Yelp & Facebook",
    },
    "/docs/api": {
        title: "Review Management REST API Reference",
        description: "Zyene Reviews REST API reference: authenticate with API keys, list reviews, send review requests, read analytics, and handle errors.",
        socialTitle: "Zyene Reviews REST API Reference",
    },
    "/docs/cookbook": {
        title: "Review API Code Examples & Webhook Recipes",
        description: "Copy-paste curl recipes for the Zyene Reviews API: send review requests, use the generic webhook, read reviews, and pull analytics.",
        socialTitle: "Zyene Reviews API Cookbook",
    },
    "/docs/plugins": {
        title: "Embed Review Widgets on Your Website",
        description: "Embed a review carousel or rating badge on your website with Zyene Reviews iframe widgets, and automate with webhooks. Copy-paste setup.",
        socialTitle: "Embed Zyene Review Widgets on Your Site",
    },
    "/docs/changelog": {
        title: "Product Changelog & API Release Notes",
        description: "Zyene Reviews changelog: new features, improvements, API changes, and bug fixes listed by release month.",
        socialTitle: "Zyene Reviews Changelog",
    },
};

/** Sidebar group (`articleSection`) and nav label (breadcrumb name) for a docs path. */
export function docsNavFor(path: DocsPath): { section?: string; label?: string } {
    for (const group of DOC_NAV_GROUPS) {
        const item = group.items.find((i) => i.href === path);
        if (item) return { section: group.title, label: item.title };
    }
    return {};
}

export function docsPageMetadata(path: DocsPath): Metadata {
    const seo = DOCS_PAGE_SEO[path];
    return buildMarketingMetadata({
        title: seo.title,
        description: seo.description,
        path,
        openGraph: { title: seo.socialTitle, type: "article" },
    });
}

export function docsCanonicalUrl(path: DocsPath): string {
    return marketingCanonicalUrl(path);
}
