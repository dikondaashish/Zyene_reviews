"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type DescriptionOptimizerFieldsProps = {
    currentDescription: string;
    draft: string;
    suggested: string;
    topKeywords: string[];
    optimizing: boolean;
    saving: boolean;
    onApplySuggested: () => void;
    onDraftChange: (draft: string) => void;
    onOptimizeWithAi: () => void;
    onSaveToGoogle: () => void;
};

export function DescriptionOptimizerFields({
    currentDescription,
    draft,
    suggested,
    topKeywords,
    optimizing,
    saving,
    onApplySuggested,
    onDraftChange,
    onOptimizeWithAi,
    onSaveToGoogle,
}: DescriptionOptimizerFieldsProps) {
    return (
        <CardContent className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-2">
                <div className="space-y-2">
                    <p className="text-sm font-medium">Your current business description</p>
                    <Textarea value={currentDescription} readOnly rows={4} className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">Suggested SEO-optimized description</p>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={onApplySuggested}
                            disabled={!suggested}
                        >
                            Apply suggestion
                        </Button>
                    </div>
                    <Button type="button" onClick={onOptimizeWithAi} disabled={optimizing} className="w-fit">
                        {optimizing ? (
                            <Loader2 className="mr-2 animate-spin size-4" />
                        ) : (
                            <Sparkles className="mr-2 size-4" />
                        )}
                        {optimizing ? "Drafting…" : "Draft with AI"}
                    </Button>
                    <Textarea
                        value={suggested}
                        readOnly
                        rows={6}
                        placeholder="Create an AI draft, then review and apply the parts that fit your business."
                    />
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium">Editable draft (what will be saved)</p>
                <Textarea
                    value={draft}
                    onChange={(event) => onDraftChange(event.target.value)}
                    rows={6}
                    placeholder="Apply the AI suggestion, then edit before saving if needed."
                />
                <p className="text-xs font-medium text-muted-foreground">Keywords to include naturally</p>
                <div className="flex flex-wrap gap-1.5">
                    {topKeywords.slice(0, 8).map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="text-[11px]">
                            {keyword}
                        </Badge>
                    ))}
                </div>
                <Button onClick={onSaveToGoogle} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 animate-spin size-4" /> : null}
                    Save to Google
                </Button>
            </div>
        </CardContent>
    );
}
