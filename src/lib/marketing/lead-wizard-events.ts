/** Lead wizard (free guide popup) funnel events and attribution constants. */

export const LEAD_WIZARD_SOURCE = "lead_wizard";

export const LEAD_WIZARD_EVENT_NAMES = [
    "lead_wizard_view",
    "lead_wizard_step_complete",
    "lead_wizard_close",
    "lead_wizard_convert",
] as const;

export type LeadWizardEventName = (typeof LEAD_WIZARD_EVENT_NAMES)[number];

export function isLeadWizardEventName(name: string): name is LeadWizardEventName {
    return (LEAD_WIZARD_EVENT_NAMES as readonly string[]).includes(name);
}
