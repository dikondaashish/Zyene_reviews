import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

/** Signup names the business "<Name>'s Business" until the owner gives a real one. */
const DEFAULT_BUSINESS_SUFFIX = "'s Business";
/** nanoid(6) suffix signup appends to keep the placeholder slug unique. */
const NANOID_SUFFIX = /^[A-Za-z0-9_-]{6}$/;

/** Review-link slug derived from a business name ("Joe's Pizza" -> "joe-s-pizza"). */
export function slugFromBusinessName(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/** Signup's raw slug transform (no trimming), kept identical so its placeholders are recognised. */
const signupSlugBase = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const hasNanoidSuffix = (slug: string, base: string) =>
    slug.startsWith(`${base}-`) && NANOID_SUFFIX.test(slug.slice(base.length + 1));

/**
 * True when the stored slug is still the placeholder created at signup: the business carries the
 * default "<Name>'s Business" name and a slug of "<name>-<nanoid6>" (new-user signup) or
 * "<name>-s-business-<nanoid6>" (add-business without a Google title). Any other slug was chosen
 * by the owner (or already derived from their real business name) and must be kept.
 */
export function isSignupPlaceholderSlug(name: string | null | undefined, slug: string | null | undefined): boolean {
    if (!slug?.trim()) return true;
    const trimmed = name?.trim() ?? "";
    if (!trimmed.endsWith(DEFAULT_BUSINESS_SUFFIX)) return false;
    const fullName = trimmed.slice(0, -DEFAULT_BUSINESS_SUFFIX.length);
    return hasNanoidSuffix(slug, signupSlugBase(fullName)) || hasNanoidSuffix(slug, signupSlugBase(trimmed));
}

/**
 * The slug onboarding may write for this business, or undefined to leave the stored one alone.
 * A new slug is only generated while the business has none or still has its signup placeholder,
 * so a custom review link saved in a later step (and printed on QR codes) is never overwritten.
 * If the current row cannot be read, the stored slug is left untouched.
 */
export async function slugToGenerateForBusiness(
    supabase: SupabaseClient,
    businessId: string,
    businessName: string,
): Promise<string | undefined> {
    const derived = slugFromBusinessName(businessName);
    if (!derived) return undefined;
    const { data, error } = await supabase
        .from("businesses")
        .select("name, slug")
        .eq("id", businessId)
        .maybeSingle();
    if (error || !data) {
        if (error) logger.warn({ err: error, businessId }, "[onboarding] could not read business slug; keeping it");
        return undefined;
    }
    const row = data as { name?: string | null; slug?: string | null };
    return isSignupPlaceholderSlug(row.name, row.slug) ? derived : undefined;
}
