import { resolveReviewFlowTags } from "@/lib/review-flow/tag-display";
import type { PublicReviewFlowProps } from "./types";

export function resolveReviewFlowBrandColor(brandColor?: string): string {
    return typeof brandColor === "string" && brandColor.trim().length > 0 ? brandColor.trim() : "var(--primary)";
}

export function resolveReviewFlowPageBackdrop(reviewPageBackgroundColor?: string | null) {
    const pageBgHex = reviewPageBackgroundColor?.trim() ?? "";
    const useCustomPageBackdrop =
        pageBgHex.length > 0 && /^#([0-9A-F]{3}){1,2}$/i.test(pageBgHex);
    return { pageBgHex, useCustomPageBackdrop };
}

export function buildReviewFlowShellProps(
    props: PublicReviewFlowProps,
    mounted: boolean,
    useCustomPageBackdrop: boolean,
    pageBgHex: string
) {
    return {
        mounted,
        className: props.className,
        useCustomPageBackdrop,
        pageBgHex,
        hideBranding: props.hideBranding ?? false,
        footerLink: props.footerLink,
        footerLogoUrl: props.footerLogoUrl,
        footerCompanyName: props.footerCompanyName,
    };
}

export function buildReviewFlowDerived(
    props: PublicReviewFlowProps,
    selectedTags: string[],
    addedCustomTags: string[]
) {
    const categoryKey = props.businessCategory.toLowerCase();
    const tags = resolveReviewFlowTags(props.customTags, categoryKey);
    const initials = props.businessName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    const hasTagSelection = selectedTags.length > 0 || addedCustomTags.length > 0;

    return { categoryKey, tags, initials, hasTagSelection };
}
