import type { Metadata } from "next";
import { marketingCanonicalUrl } from "@/lib/seo/marketing-site-url";

/** Branded fallback card for routes without their own `opengraph-image.tsx`. */
export const MARKETING_SHARE_IMAGE = {
    url: "/og/zyene-reviews-share.jpg",
    width: 1200,
    height: 630,
    alt: "Zyene Reviews: review management software for local businesses",
} as const;

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

const hasImages = (images: unknown) => Boolean(images) && (Array.isArray(images) ? images.length > 0 : true);

/**
 * Re-applies site name, locale and the X handle on every marketing page. Next.js replaces
 * (not merges) `openGraph`/`twitter` per page, so root-layout values are lost otherwise.
 *
 * Share images: a page's own images win. Routes with an `opengraph-image.tsx` (built with
 * `@/lib/seo/og-card`) pass `ownShareImage` so config does not override that file; every other
 * route gets the branded fallback card. (A page's `openGraph` replaces its parents', so a parent
 * route's image file is not inherited.)
 */
export function mergeMarketingSocial(metadata: Metadata, { ownShareImage = false }: { ownShareImage?: boolean } = {}): Metadata {
    const og = metadata.openGraph;
    const ogSiteDefaults = { siteName: MARKETING_SITE_NAME, locale: "en_US" };
    const twitterInput = metadata.twitter && typeof metadata.twitter === "object" ? metadata.twitter : {};
    const ogImages = og && "images" in og && hasImages(og.images) ? og.images : ownShareImage ? undefined : [MARKETING_SHARE_IMAGE];
    const twitterImages =
        "images" in twitterInput && hasImages(twitterInput.images)
            ? { images: twitterInput.images }
            : ownShareImage ? {} : { images: [MARKETING_SHARE_IMAGE.url] };

    return {
        ...metadata,
        title: fitMarketingTitle(metadata.title),
        openGraph: { ...ogSiteDefaults, ...og, ...(ogImages ? { images: ogImages } : {}) },
        twitter: { card: "summary_large_image", site: MARKETING_TWITTER_HANDLE, ...twitterInput, ...twitterImages },
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
