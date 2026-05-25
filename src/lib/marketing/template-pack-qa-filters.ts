/** UTM / email patterns excluded from production funnel reports (internal QA runs). */

export const TEMPLATE_PACK_QA_UTM_SOURCES = ["qa", "test", "internal"] as const;

export const TEMPLATE_PACK_QA_UTM_MEDIUMS = ["funnel_test", "qa_test"] as const;

export const TEMPLATE_PACK_QA_EMAIL_PREFIX = "template-pack-prod-qa-";

export function isTemplatePackQaSubscriber(email: string, utmSource: string | null, utmMedium: string | null): boolean {
    if (email.startsWith(TEMPLATE_PACK_QA_EMAIL_PREFIX)) return true;
    if (utmSource && (TEMPLATE_PACK_QA_UTM_SOURCES as readonly string[]).includes(utmSource)) return true;
    if (utmMedium && (TEMPLATE_PACK_QA_UTM_MEDIUMS as readonly string[]).includes(utmMedium)) return true;
    return false;
}
