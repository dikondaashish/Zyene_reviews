import type { Metadata } from "next";
import { getEsIndustryPathForEnglishSlug } from "@/lib/industries/localized-industries";

/** Both sides of each real translation pair return the same language annotations. */
export function industryAlternates(industrySlug: string, locale: "en" | "es" = "en"): NonNullable<Metadata["alternates"]> {
    const en = `https://www.zyenereviews.com/industries/${industrySlug}`;
    const esPath = getEsIndustryPathForEnglishSlug(industrySlug);
    if (!esPath) return { canonical: en };
    const es = `https://www.zyenereviews.com${esPath}`;
    return { canonical: locale === "es" ? es : en, languages: { en, es } };
}
