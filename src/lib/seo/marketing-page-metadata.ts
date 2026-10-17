import type { Metadata } from "next";
import { marketingCanonicalUrl } from "@/lib/seo/marketing-site-url";

export const MARKETING_OG_IMAGE = {
    url: "/og/og-default.png",
    width: 1200,
    height: 630,
    alt: "Zyene Reviews - Reputation Management for Local Businesses",
} as const;

export const MARKETING_TWITTER_IMAGE = "/og/og-default.png";

export const MARKETING_SITE_NAME = "Zyene Reviews";
export const MARKETING_TWITTER_HANDLE = "@zyenereviews";

/** Root `title.template` suffix (see `src/app/layout-metadata.ts`). */
const TITLE_TEMPLATE_SUFFIX = ` | ${MARKETING_SITE_NAME}`;
const MAX_TITLE_LENGTH = 60;

/**
 * Keeps the rendered `<title>` within 60 characters. When the page segment plus
 * the " | Zyene Reviews" template would overflow, the segment is used as an
 * absolute title so Google does not truncate the keyword-bearing part.
 */
export function fitMarketingTitle(title: Metadata["title"]): Metadata["title"] {
    if (typeof title !== "string") return title;
    if (title.length + TITLE_TEMPLATE_SUFFIX.length <= MAX_TITLE_LENGTH) return title;
    return { absolute: title };
}

/**
 * Ensures marketing pages always ship OG/Twitter images, site name, locale, and
 * Twitter handle. Next.js replaces (not merges) `openGraph`/`twitter` per page,
 * so root-layout values like `siteName` are lost unless re-applied here.
 */
export function mergeMarketingSocial(metadata: Metadata): Metadata {
    const og = metadata.openGraph;
    const ogImages =
        og && "images" in og && og.images && (Array.isArray(og.images) ? og.images.length > 0 : true)
            ? og.images
            : [MARKETING_OG_IMAGE];

    const twitter =
        metadata.twitter && typeof metadata.twitter === "object"
            ? {
                  card: "summary_large_image" as const,
                  site: MARKETING_TWITTER_HANDLE,
                  ...metadata.twitter,
                  images:
                      "images" in metadata.twitter &&
                      metadata.twitter.images &&
                      (Array.isArray(metadata.twitter.images) ? metadata.twitter.images.length > 0 : true)
                          ? metadata.twitter.images
                          : [MARKETING_TWITTER_IMAGE],
              }
            : {
                  card: "summary_large_image" as const,
                  site: MARKETING_TWITTER_HANDLE,
                  images: [MARKETING_TWITTER_IMAGE],
              };

    const ogSiteDefaults = { siteName: MARKETING_SITE_NAME, locale: "en_US" };

    return {
        ...metadata,
        title: fitMarketingTitle(metadata.title),
        openGraph: og
            ? { ...ogSiteDefaults, ...og, images: ogImages }
            : { ...ogSiteDefaults, images: [MARKETING_OG_IMAGE] },
        twitter,
    };
}

type MarketingMetadataInput = {
    title: string;
    description: string;
    path: string;
    alternates?: Metadata["alternates"];
    keywords?: Metadata["keywords"];
    openGraph?: {
        title?: string;
        description?: string;
        type?: "website" | "article";
        publishedTime?: string;
        authors?: string[];
    };
    twitter?: {
        title?: string;
        description?: string;
    };
};

/** Build static marketing page metadata with canonical, OG, and Twitter defaults. */
export function buildMarketingMetadata(input: MarketingMetadataInput): Metadata {
    const canonical = marketingCanonicalUrl(input.path);
    const ogTitle = input.openGraph?.title ?? input.title;
    const ogDescription = input.openGraph?.description ?? input.description;
    const twitterTitle = input.twitter?.title ?? ogTitle;
    const twitterDescription = input.twitter?.description ?? input.description;

    return mergeMarketingSocial({
        title: input.title,
        description: input.description,
        keywords: input.keywords,
        alternates: { canonical, ...input.alternates },
        openGraph: {
            title: ogTitle,
            description: ogDescription,
            url: canonical,
            type: input.openGraph?.type ?? "website",
            ...(input.openGraph?.publishedTime ? { publishedTime: input.openGraph.publishedTime } : {}),
            ...(input.openGraph?.authors ? { authors: input.openGraph.authors } : {}),
        },
        twitter: {
            title: twitterTitle,
            description: twitterDescription,
        },
    });
}
