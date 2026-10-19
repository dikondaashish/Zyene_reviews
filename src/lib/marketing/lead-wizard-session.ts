/** Builds one wizard instance: why it opened, where it starts, prefilled answers and copy. */

import type { LeadWizardTrigger } from "@/lib/marketing/lead-wizard-intent";
import {
    openingCopy,
    preselectAnswers,
    type LeadWizardGoal,
    type LeadWizardIndustry,
    type PreselectContext,
    type WizardCopy,
} from "@/lib/marketing/lead-wizard-personalization";
import { shouldResume, type LeadWizardMemory } from "@/lib/marketing/lead-wizard-targeting";

export type LeadWizardSession = {
    trigger: LeadWizardTrigger;
    pagePath: string;
    /** Intent score when it opened (0 for manual opens). */
    score: number;
    startStep: 1 | 2;
    /** Reopened on the email step with the answers from an unfinished visit. */
    resumed: boolean;
    industry?: LeadWizardIndustry;
    goal?: LeadWizardGoal;
    /** Which answers were inferred rather than remembered, for the "Suggested" hint. */
    suggested: { industry?: LeadWizardIndustry; goal?: LeadWizardGoal };
    copy: WizardCopy;
};

export function buildLeadWizardSession(input: {
    trigger: LeadWizardTrigger;
    pagePath: string;
    score: number;
    journeyPages: string[];
    utm: PreselectContext["utm"];
    memory: LeadWizardMemory;
}): LeadWizardSession {
    const inferred = preselectAnswers({ pathname: input.pagePath, journeyPages: input.journeyPages, utm: input.utm });
    const resumed = shouldResume(input.memory);
    // Answers the visitor picked last time beat anything inferred from pages.
    const industry = input.memory.industry ?? inferred.industry;
    const goal = input.memory.goal ?? inferred.goal;
    return {
        trigger: input.trigger,
        resumed,
        pagePath: input.pagePath,
        score: input.score,
        startStep: resumed ? 2 : 1,
        industry,
        goal,
        suggested: {
            industry: input.memory.industry ? undefined : inferred.industry,
            goal: input.memory.goal ? undefined : inferred.goal,
        },
        copy: openingCopy({ trigger: input.trigger, resumed, journeyPages: input.journeyPages, industry }),
    };
}
