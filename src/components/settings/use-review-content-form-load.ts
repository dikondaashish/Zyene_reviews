"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { UseFormReturn } from "react-hook-form";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseTagsToItems, type ReviewTagItem } from "@/lib/review-flow/tag-display";
import type { ContentFormValues } from "@/components/settings/review-content-schema";

export function useReviewContentFormLoad(
    businessId: string,
    categoryKey: string,
    supabase: SupabaseClient,
    form: UseFormReturn<ContentFormValues>,
    setIsLoading: (v: boolean) => void,
    setTagCategory: (v: string) => void,
    setTagItems: (v: ReviewTagItem[]) => void,
    setTagsReady: (v: boolean) => void,
    tagsReady: boolean
) {
    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            if (!businessId) return;

            try {
                const { data, error } = await supabase
                    .from("businesses")
                    .select("*")
                    .eq("id", businessId)
                    .single();

                if (error) throw error;
                if (cancelled || !data) return;

                const loadedCategory =
                    typeof data.category === "string" && data.category.trim()
                        ? data.category.trim().toLowerCase()
                        : categoryKey;
                setTagCategory(loadedCategory);
                setTagItems(parseTagsToItems(data.custom_tags, loadedCategory));
                setTagsReady(true);

                form.reset({
                    min_stars_for_google: data.min_stars_for_google ?? 4,
                    rating_subtitle: data.rating_subtitle || "Your feedback means a lot to us!",
                    tags_heading: data.tags_heading || "What did you like most?",
                    tags_subheading: data.tags_subheading || "Tap to select what stood out",
                    enable_staff_selection: data.enable_staff_selection ?? false,
                    staff_names: Array.isArray(data.staff_names) ? data.staff_names.join(", ") : "",
                    google_heading: data.google_heading || "Would you post this on Google?",
                    google_subheading: data.google_subheading || "Tap to edit, or post as-is",
                    google_button_text: data.google_button_text || "Copy & Go to Google",
                    google_review_url: data.google_review_url || "",
                    negative_subheading:
                        data.negative_subheading || "Share your feedback directly with the owner.",
                    negative_textarea_placeholder: data.negative_textarea_placeholder || "Tell us what happened...",
                    negative_button_text: data.negative_button_text || "Send Feedback",
                    private_feedback_email_mode:
                        data.private_feedback_email_mode === "hidden" ||
                        data.private_feedback_email_mode === "optional" ||
                        data.private_feedback_email_mode === "required"
                            ? data.private_feedback_email_mode
                            : "optional",
                    private_feedback_phone_mode:
                        data.private_feedback_phone_mode === "hidden" ||
                        data.private_feedback_phone_mode === "optional" ||
                        data.private_feedback_phone_mode === "required"
                            ? data.private_feedback_phone_mode
                            : "hidden",
                    private_feedback_offer_mode:
                        data.private_feedback_offer_mode === "visible" ? "visible" : "hidden",
                    private_feedback_offer_message: data.private_feedback_offer_message || "",
                    thank_you_heading: data.thank_you_heading || "Thank You!",
                    thank_you_message:
                        data.thank_you_message ||
                        "Your feedback means the world to us.\nWe appreciate you taking the time.",
                    footer_text: data.footer_text || "Powered by Zyene",
                    footer_company_name: data.footer_company_name || "Zyene",
                    footer_link: data.footer_link || "",
                    footer_logo_url: data.footer_logo_url || "",
                    hide_branding: data.hide_branding || false,
                    welcome_message: data.welcome_message || "How was your experience?",
                    apology_message: data.apology_message || "Sorry about that",
                    rating_style:
                        (data.rating_style as ContentFormValues["rating_style"]) || "emoji",
                });
            } catch {
                if (!cancelled) toast.error("Failed to load content settings");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        setIsLoading(true);
        void loadData();
        return () => {
            cancelled = true;
        };
    }, [businessId, categoryKey, supabase, form, setIsLoading, setTagCategory, setTagItems, setTagsReady]);

    useEffect(() => {
        if (tagsReady) return;
        setTagItems(parseTagsToItems(null, categoryKey));
        setTagCategory(categoryKey);
    }, [categoryKey, tagsReady, setTagItems, setTagCategory]);
}
