
import { createAdminClient } from "@/lib/db/supabase/admin";
import { notFound } from "next/navigation";
import { PublicReviewFlow } from "./review-flow";
import { Metadata } from "next";
import { z } from "zod";

/** Always read latest rating_style / copy from DB (no stale static cache after settings save). */
export const dynamic = "force-dynamic";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;

    return {
        title: "Share Your Experience",
        description: "We'd love to hear about your experience. Your feedback helps us improve.",
        alternates: {
            canonical: `https://collectratings.com/${slug}`,
        },
    };
}

import { AccessError } from "@/components/public/access-error";
import { planAllowsPublicReviewWidget } from "@/services/stripe/plans";
import { recordReviewRequestOpenForRef } from "@/lib/review-requests/record-review-request-open";

export default async function RequestPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ ref?: string }>;
}) {
    const supabase = await createAdminClient();
    const { ref: requestId } = await searchParams;
    const { slug } = await params;

    // 1. Look up business by slug + check subscription
    const { data: business, error } = await supabase
        .from("businesses")
        .select(`
            id, 
            name, 
            slug, 
            category,
            logo_url,
            brand_color,
            review_page_background_color,
            min_stars_for_google,
            welcome_message,
            apology_message,
            rating_subtitle,
            tags_heading,
            tags_subheading,
            custom_tags,
            google_heading,
            google_subheading,
            google_button_text,
            google_review_url,
            negative_subheading,
            negative_textarea_placeholder,
            negative_button_text,
            private_feedback_email_mode,
            private_feedback_phone_mode,
            private_feedback_offer_mode,
            private_feedback_offer_message,
            thank_you_heading,
            thank_you_message,
            footer_text,
            footer_company_name,
            footer_link,
            footer_logo_url,
            hide_branding,
            enable_staff_selection,
            staff_names,
            rating_style,
            organization:organizations (
                plan,
                plan_status
            )
        `)
        .eq("slug", slug)
        .single();

    if (error || !business) {
        return notFound();
    }

    // Access Control 1: Subscription Check (Stripe plan ids like starter_monthly, not display names)
    const org = business.organization as { plan?: string | null; plan_status?: string | null };

    if (!planAllowsPublicReviewWidget(org?.plan ?? null, org?.plan_status ?? null)) {
        return <AccessError type="subscription" businessName={business.name} />;
    }

    // 2. Look up Google Review Platform
    const { data: platform, error: platformError } = await supabase
        .from("review_platforms")
        .select("external_url")
        .eq("business_id", business.id)
        .eq("platform", "google")
        .maybeSingle(); // Don't throw if not found

    // Access Control 2: Google Profile Connected
    if (!platform || platformError) {
        return <AccessError type="platform" businessName={business.name} />;
    }

    // Record email-link opens on the server so clicks are not lost when client JS never runs
    // (RSC prefetch, iOS quirks) or when the client effect fails once and previously could not retry.
    const resolvedRequestId = requestId;
    if (resolvedRequestId) {
        const refParse = z.string().uuid().safeParse(resolvedRequestId.trim());
        if (refParse.success) {
            const tracked = await recordReviewRequestOpenForRef({
                businessId: business.id,
                requestId: refParse.data,
            });
            if (!tracked.ok) {
                console.error("[Review Flow] server open tracking failed", tracked);
            }
        }
    }

    const rawPageBg = (business as { review_page_background_color?: string | null })
        .review_page_background_color;
    const reviewPageBackgroundColor =
        typeof rawPageBg === "string" && /^#([0-9A-F]{3}){1,2}$/i.test(rawPageBg)
            ? rawPageBg
            : undefined;

    const ratingStyleRaw = (business as { rating_style?: string | null }).rating_style;
    const ratingStyle =
        ratingStyleRaw === "stars" ||
        ratingStyleRaw === "number" ||
        ratingStyleRaw === "slider" ||
        ratingStyleRaw === "radio"
            ? ratingStyleRaw
            : "emoji";

    return (
        <div className="review-page-wrapper">
            <PublicReviewFlow
                businessId={business.id}
                businessName={business.name}
                businessCategory={business.category || "other"}
                requestId={resolvedRequestId}
                googleUrl={business.google_review_url ?? platform?.external_url ?? undefined}
                logoUrl={business.logo_url ?? undefined}
                brandColor={business.brand_color ?? undefined}
                reviewPageBackgroundColor={reviewPageBackgroundColor}
                minStars={business.min_stars_for_google ?? undefined}
                ratingStyle={ratingStyle}
                welcomeMsg={business.welcome_message ?? undefined}
                apologyMsg={business.apology_message ?? undefined}
                ratingSubtitle={business.rating_subtitle ?? undefined}
                tagsHeading={business.tags_heading ?? undefined}
                tagsSubheading={business.tags_subheading ?? undefined}
                customTags={business.custom_tags ?? undefined}
                googleHeading={business.google_heading ?? undefined}
                googleSubheading={business.google_subheading ?? undefined}
                googleButtonText={business.google_button_text ?? undefined}
                negativeSubheading={business.negative_subheading ?? undefined}
                negativeTextareaPlaceholder={business.negative_textarea_placeholder ?? undefined}
                negativeButtonText={business.negative_button_text ?? undefined}
                privateFeedbackEmailMode={
                    business.private_feedback_email_mode === "hidden" ||
                    business.private_feedback_email_mode === "optional" ||
                    business.private_feedback_email_mode === "required"
                        ? business.private_feedback_email_mode
                        : undefined
                }
                privateFeedbackPhoneMode={
                    business.private_feedback_phone_mode === "hidden" ||
                    business.private_feedback_phone_mode === "optional" ||
                    business.private_feedback_phone_mode === "required"
                        ? business.private_feedback_phone_mode
                        : undefined
                }
                privateFeedbackOfferMode={
                    business.private_feedback_offer_mode === "visible" ? "visible" : undefined
                }
                privateFeedbackOfferMessage={business.private_feedback_offer_message ?? undefined}
                thankYouHeading={business.thank_you_heading ?? undefined}
                thankYouMessage={business.thank_you_message ?? undefined}
                footerText={business.footer_text ?? undefined}
                footerCompanyName={business.footer_company_name ?? undefined}
                footerLink={business.footer_link ?? undefined}
                footerLogoUrl={business.footer_logo_url ?? undefined}
                hideBranding={business.hide_branding ?? undefined}
                enableStaffSelection={business.enable_staff_selection ?? undefined}
                staffNames={(business.staff_names as string[]) ?? undefined}
            />
        </div>
    );
}
