"use client";

import { Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type ReplyRuleValue = { rating: number; action: string; templateId: string | null };
export type ReplyTemplateOption = { id: string; name: string };

const ACTION_LABELS: Record<string, string> = {
    approval: "Draft a reply for approval",
    auto: "Post an AI reply automatically",
    template: "Post a saved template automatically",
    ignore: "Don't reply",
};

export function ReplyRuleRow({
    rule, templates, disabled, onChange,
}: {
    rule: ReplyRuleValue;
    templates: ReplyTemplateOption[];
    disabled: boolean;
    onChange: (next: ReplyRuleValue) => void;
}) {
    return (
        <div className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1 text-sm font-medium" aria-label={`${rule.rating} star reviews`}>
                {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`size-4 ${i < rule.rating ? "fill-chart-4 text-chart-4" : "text-muted-foreground/40"}`} />
                ))}
                <span className="ml-2">{rule.rating}-star reviews</span>
            </div>
            <div className="flex flex-col gap-2 sm:w-[420px] sm:flex-row">
                <Select
                    value={rule.action}
                    disabled={disabled}
                    onValueChange={(action) => onChange({ ...rule, action, templateId: action === "template" ? rule.templateId : null })}
                >
                    <SelectTrigger className="sm:flex-1" aria-label={`Action for ${rule.rating}-star reviews`}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(ACTION_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value} disabled={value === "template" && templates.length === 0}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {rule.action === "template" && (
                    <Select value={rule.templateId ?? undefined} disabled={disabled} onValueChange={(templateId) => onChange({ ...rule, templateId })}>
                        <SelectTrigger className="sm:w-40" aria-label="Template">
                            <SelectValue placeholder="Choose template" />
                        </SelectTrigger>
                        <SelectContent>
                            {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            </div>
        </div>
    );
}
