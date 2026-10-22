import type { CampaignTemplate } from "@/types/campaigns";
import type { BusinessType } from "@/lib/campaigns/business-types";

export type TemplateGroups = { matched: CampaignTemplate[]; others: CampaignTemplate[] };

const isGeneral = (t: CampaignTemplate) => !t.businessTypes || t.businessTypes.length === 0;

/**
 * Templates written for the chosen type go first; everything else follows,
 * general templates leading, so nothing is ever hidden by a wrong or missing type.
 */
export function groupTemplatesForType(templates: readonly CampaignTemplate[], type: BusinessType | null): TemplateGroups {
    const matched = type ? templates.filter((t) => t.businessTypes?.includes(type)) : [];
    const rest = templates.filter((t) => !matched.includes(t));
    return { matched, others: [...rest.filter(isGeneral), ...rest.filter((t) => !isGeneral(t))] };
}
