/** Review request template pack lead magnet — event names and attribution constants. */

export const TEMPLATE_PACK_SOURCE = "review_request_templates";

export const TEMPLATE_PACK_PAGE_PATH = "/resources/review-request-templates";

export const TEMPLATE_PACK_EVENT_NAMES = [
    "template_pack_view",
    "template_pack_form_view",
    "template_pack_submit",
    "template_pack_subscribe_success",
    "template_pack_signup_click",
    "template_pack_pricing_click",
] as const;

export type TemplatePackEventName = (typeof TEMPLATE_PACK_EVENT_NAMES)[number];

export function isTemplatePackEventName(name: string): name is TemplatePackEventName {
    return (TEMPLATE_PACK_EVENT_NAMES as readonly string[]).includes(name);
}
