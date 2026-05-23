import { toast } from "sonner";
import type { UseFormReturn } from "react-hook-form";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
    customTagsForSave,
    sanitizeTagItems,
    type ReviewTagItem,
} from "@/lib/review-flow/tag-display";
import type { ContentFormValues } from "@/components/settings/review-content-schema";

export async function submitReviewContentSettings({
    data,
    businessId,
    tagItems,
    tagCategory,
    filesToDelete,
    setFilesToDelete,
    form,
    supabase,
    onSaved,
}: {
    data: ContentFormValues;
    businessId: string;
    tagItems: ReviewTagItem[];
    tagCategory: string;
    filesToDelete: string[];
    setFilesToDelete: (paths: string[]) => void;
    form: UseFormReturn<ContentFormValues>;
    supabase: SupabaseClient;
    onSaved: () => void;
}) {
    const sanitizedTags = sanitizeTagItems(tagItems);
    if (sanitizedTags.length === 0) {
        toast.error("Add at least one review tag with a label.");
        return false;
    }

    const staffNamesArray = data.staff_names
        ? data.staff_names.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
        : [];

    const trimOrNull = (s: string | undefined) => {
        const v = s?.trim();
        return v && v.length > 0 ? v : null;
    };

    const patch = {
        welcome_message: trimOrNull(data.welcome_message),
        rating_subtitle: trimOrNull(data.rating_subtitle),
        tags_heading: trimOrNull(data.tags_heading),
        tags_subheading: trimOrNull(data.tags_subheading),
        custom_tags: customTagsForSave(sanitizedTags, tagCategory),
        enable_staff_selection: data.enable_staff_selection ?? false,
        staff_names: staffNamesArray,
        google_heading: trimOrNull(data.google_heading),
        google_subheading: trimOrNull(data.google_subheading),
        google_button_text: trimOrNull(data.google_button_text),
        google_review_url: trimOrNull(data.google_review_url),
        min_stars_for_google: data.min_stars_for_google ?? null,
        apology_message: trimOrNull(data.apology_message),
        negative_subheading: trimOrNull(data.negative_subheading),
        negative_textarea_placeholder: trimOrNull(data.negative_textarea_placeholder),
        negative_button_text: trimOrNull(data.negative_button_text),
        private_feedback_email_mode: data.private_feedback_email_mode,
        private_feedback_phone_mode: data.private_feedback_phone_mode,
        private_feedback_offer_mode: data.private_feedback_offer_mode,
        private_feedback_offer_message: trimOrNull(data.private_feedback_offer_message),
        thank_you_heading: trimOrNull(data.thank_you_heading),
        thank_you_message: trimOrNull(data.thank_you_message),
        footer_text: trimOrNull(data.footer_text),
        footer_company_name: trimOrNull(data.footer_company_name),
        footer_link: trimOrNull(data.footer_link),
        footer_logo_url: trimOrNull(data.footer_logo_url),
        hide_branding: data.hide_branding ?? false,
        rating_style: data.rating_style ?? null,
    };

    const response = await fetch(`/api/businesses/${businessId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
    });

    const json = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
    };

    if (!response.ok || json.success !== true) {
        const msg =
            typeof json.error === "string" && json.error.length > 0
                ? json.error
                : "Failed to save content settings";
        throw new Error(msg);
    }

    if (filesToDelete.length > 0) {
        const pathsToDelete = filesToDelete
            .map((url) => {
                try {
                    const urlObj = new URL(url);
                    const parts = urlObj.pathname.split("/");
                    return parts[parts.length - 1];
                } catch {
                    return null;
                }
            })
            .filter((p): p is string => p !== null);

        if (pathsToDelete.length > 0) {
            await supabase.storage.from("business-logos").remove(pathsToDelete);
        }
        setFilesToDelete([]);
    }

    form.reset(data);
    onSaved();
    toast.success("Content settings updated successfully");
    return true;
}
