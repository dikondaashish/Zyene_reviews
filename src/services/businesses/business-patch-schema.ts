/**
 * Validation for PATCH /api/businesses/[id].
 *
 * `.strict()` on purpose: an unknown key is a client bug, and silently dropping
 * it would look like a save that did nothing.
 */
import { z } from "zod";

import { DEFAULT_REVIEW_PAGE_BACKGROUND_HEX } from "@/lib/utils/review-page-background";

export const DEFAULT_REVIEW_PAGE_BG = DEFAULT_REVIEW_PAGE_BACKGROUND_HEX;

export const businessPatchSchema = z
    .object({
        name: z.string().min(1).max(255).optional(),
        /** Public review page path segment; validated and uniqueness-checked on update */
        slug: z
            .string()
            .min(3, "Slug must be at least 3 characters.")
            .max(120)
            .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens.")
            .optional(),
        category: z.string().min(1).max(100).optional(),
        timezone: z.string().min(1).max(80).optional(),
        country: z.string().min(2).max(2).optional(),
        phone: z.string().max(30).optional().nullable(),
        email: z.string().email().max(255).optional().nullable().or(z.literal("")),
        /** Optional human-friendly first name used as From display + email signoff. */
        sender_name: z.string().max(80).optional().nullable().or(z.literal("")),
        website: z.string().url().max(500).optional().nullable(),
        logo_url: z.string().url().max(1000).optional().nullable(),
        address: z.string().max(1000).optional().nullable(),
        address_line1: z.string().max(1000).optional().nullable(),
        city: z.string().max(120).optional().nullable(),
        state: z.string().max(120).optional().nullable(),
        postal_code: z.string().max(20).optional().nullable(),
        zip: z.string().max(20).optional().nullable(),
        brand_color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i).optional().nullable(),
        review_page_background_color: z
            .string()
            .regex(/^#([0-9A-F]{3}){1,2}$/i)
            .optional()
            .nullable(),
        // NOT NULL in the DB (default 'emoji') — accepting null here would have
        // produced a NOT NULL violation at update time.
        rating_style: z.enum(["emoji", "stars", "number", "slider", "radio"]).optional(),
        enable_staff_selection: z.boolean().optional(),
        staff_names: z.array(z.string().max(120)).max(100).optional(),
        /** Review flow copy & settings (public profile) */
        welcome_message: z.string().max(500).optional().nullable(),
        rating_subtitle: z.string().max(500).optional().nullable(),
        tags_heading: z.string().max(500).optional().nullable(),
        tags_subheading: z.string().max(500).optional().nullable(),
        custom_tags: z.array(z.string().max(80)).max(80).optional().nullable(),
        google_heading: z.string().max(500).optional().nullable(),
        google_subheading: z.string().max(500).optional().nullable(),
        google_button_text: z.string().max(200).optional().nullable(),
        google_review_url: z.string().max(2048).optional().nullable(),
        min_stars_for_google: z.number().int().min(1).max(5).optional().nullable(),
        apology_message: z.string().max(500).optional().nullable(),
        negative_subheading: z.string().max(500).optional().nullable(),
        negative_textarea_placeholder: z.string().max(500).optional().nullable(),
        negative_button_text: z.string().max(200).optional().nullable(),
        private_feedback_email_mode: z.enum(["hidden", "optional", "required"]).optional(),
        private_feedback_phone_mode: z.enum(["hidden", "optional", "required"]).optional(),
        private_feedback_offer_mode: z.enum(["hidden", "visible"]).optional(),
        private_feedback_offer_message: z.string().max(500).optional().nullable(),
        thank_you_heading: z.string().max(200).optional().nullable(),
        thank_you_message: z.string().max(5000).optional().nullable(),
        footer_text: z.string().max(200).optional().nullable(),
        footer_company_name: z.string().max(200).optional().nullable(),
        footer_link: z.string().max(2048).optional().nullable(),
        footer_logo_url: z.string().max(1000).optional().nullable(),
        hide_branding: z.boolean().optional().nullable(),
        auto_reply_enabled: z.boolean().optional(),
        auto_reply_min_rating: z.union([z.literal(3), z.literal(4), z.literal(5)]).optional(),
        auto_reply_tone: z.enum(["professional", "friendly", "concise"]).optional(),
    })
    .strict();

export type BusinessPatchBody = z.infer<typeof businessPatchSchema>;
