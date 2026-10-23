"use client";

import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignTemplateCard } from "@/components/campaigns/campaign-template-card";
import { CAMPAIGN_TEMPLATES } from "@/lib/campaigns/templates";
import { BUSINESS_TYPES, businessTypeAudience, type BusinessType } from "@/lib/campaigns/business-types";
import { groupTemplatesForType } from "@/lib/campaigns/template-grouping";
import type { CampaignTemplate } from "@/types/campaigns";
import { suggestBusinessTypeFromGoogle } from "./suggest-business-type-action";

const ALL = "all";

function TemplateGrid({ title, templates }: { title: string; templates: CampaignTemplate[] }) {
    if (templates.length === 0) return null;
    return (
        <section className="space-y-3">
            <h3 className="ui-card-title text-foreground">
                {title} <span className="font-normal tabular-nums text-muted-foreground">({templates.length})</span>
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => <CampaignTemplateCard key={template.id} template={template} />)}
            </div>
        </section>
    );
}

/** Business-type picker that starts on the business's own type; matching templates first, all others below. */
export function TemplateLibrary({ businessId, savedBusinessType, active }: {
    businessId: string | null;
    savedBusinessType: BusinessType | null;
    active: boolean;
}) {
    const [selected, setSelected] = useState<BusinessType | typeof ALL>(savedBusinessType ?? ALL);
    const [googleCategory, setGoogleCategory] = useState<string | null>(null);
    const touched = useRef(false);
    const asked = useRef(false);

    // Only businesses without a usable saved type ask Google, and only once the tab is open.
    useEffect(() => {
        if (!active || savedBusinessType || !businessId || asked.current) return;
        asked.current = true;
        void suggestBusinessTypeFromGoogle({ businessId }).then((suggestion) => {
            if (!suggestion || touched.current) return;
            setSelected(suggestion.type);
            setGoogleCategory(suggestion.googleCategory);
        });
    }, [active, savedBusinessType, businessId]);

    const type = selected === ALL ? null : selected;
    const { matched, others } = groupTemplatesForType(CAMPAIGN_TEMPLATES, type);
    const hint = googleCategory && type
        ? `Suggested from your Google listing (“${googleCategory}”). Change it anytime.`
        : savedBusinessType && type === savedBusinessType
          ? "Based on the business type in your settings. Change it to browse other trades."
          : type
            ? "Showing templates for the type you picked first."
            : "Pick your business type to see messages written for it first.";

    return (
        <div className="mt-2 space-y-8">
            <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0">
                    <label htmlFor="template-business-type" className="text-sm font-medium text-foreground">Your business type</label>
                    <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>
                </div>
                <Select
                    value={selected}
                    onValueChange={(value) => {
                        touched.current = true;
                        setGoogleCategory(null);
                        setSelected(value as BusinessType | typeof ALL);
                    }}
                >
                    <SelectTrigger id="template-business-type" className="w-full sm:w-56">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>All templates</SelectItem>
                        {BUSINESS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {type ? <TemplateGrid title={`Best for ${businessTypeAudience(type)}`} templates={matched} /> : null}
            <TemplateGrid title={type ? "All other templates" : "All templates"} templates={others} />
        </div>
    );
}
