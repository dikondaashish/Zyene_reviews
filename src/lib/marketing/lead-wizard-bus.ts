/** Lets any page CTA open the single, layout-mounted lead wizard. */

export const LEAD_WIZARD_OPEN_EVENT = "zyene:open-lead-wizard";

export function openLeadWizard(): void {
    window.dispatchEvent(new CustomEvent(LEAD_WIZARD_OPEN_EVENT));
}
