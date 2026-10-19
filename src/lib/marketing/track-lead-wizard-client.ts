"use client";

import { LEAD_WIZARD_SOURCE, type LeadWizardEventName } from "@/lib/marketing/lead-wizard-events";
import type { LeadWizardGoal, LeadWizardIndustry } from "@/lib/marketing/lead-wizard-personalization";
import type { LeadWizardTrigger } from "@/lib/marketing/lead-wizard-targeting";
import { trackMarketingEventClient } from "@/lib/marketing/track-marketing-event-client";

/** What opened this wizard instance and the answers preselected from the page or campaign. */
export type LeadWizardSession = {
    trigger: LeadWizardTrigger;
    pagePath: string;
    industry?: LeadWizardIndustry;
    goal?: LeadWizardGoal;
};

/** Consent-gated funnel event (view, step complete, close, convert). */
export function trackLeadWizard(name: LeadWizardEventName, session: LeadWizardSession, metadata: Record<string, string> = {}) {
    trackMarketingEventClient(name, {
        pagePath: session.pagePath,
        source: LEAD_WIZARD_SOURCE,
        metadata: { trigger: session.trigger, ...metadata },
    });
}
