/** Local SEO checklist lead magnet — event names and attribution constants. */

export const LOCAL_SEO_CHECKLIST_SOURCE = "local_seo_checklist";

export const LOCAL_SEO_CHECKLIST_PAGE_PATH = "/resources/local-seo-checklist";

export const LOCAL_SEO_CHECKLIST_EVENT_NAMES = [
    "local_seo_checklist_view",
    "local_seo_checklist_form_view",
    "local_seo_checklist_submit",
    "local_seo_checklist_subscribe_success",
    "local_seo_checklist_signup_click",
    "local_seo_checklist_pricing_click",
] as const;

export type LocalSeoChecklistEventName = (typeof LOCAL_SEO_CHECKLIST_EVENT_NAMES)[number];

export function isLocalSeoChecklistEventName(name: string): name is LocalSeoChecklistEventName {
    return (LOCAL_SEO_CHECKLIST_EVENT_NAMES as readonly string[]).includes(name);
}
