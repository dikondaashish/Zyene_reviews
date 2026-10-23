"use client";

import { LEAD_WIZARD_SOURCE, type LeadWizardEventName } from "@/lib/marketing/lead-wizard-events";
import type { LeadWizardSession } from "@/lib/marketing/lead-wizard-session";
import { trackMarketingEventClient } from "@/lib/marketing/track-marketing-event-client";

export type { LeadWizardSession };

/** Consent-gated funnel event (view, step complete, close, convert) with why it opened. */
export function trackLeadWizard(name: LeadWizardEventName, session: LeadWizardSession, metadata: Record<string, string> = {}) {
    trackMarketingEventClient(name, {
        pagePath: session.pagePath,
        source: LEAD_WIZARD_SOURCE,
        metadata: {
            trigger: session.trigger,
            intent_score: String(session.score),
            resumed: session.resumed ? "1" : "0",
            ...metadata,
        },
    });
}
