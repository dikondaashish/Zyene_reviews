"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DescriptionOptimizerCard({
    businessId,
    currentDescription,
    topKeywords,
}: {
    businessId: string;
    currentDescription: string;
    topKeywords: string[];
}) {
    const [draft, setDraft] = useState(currentDescription);
    const [suggested, setSuggested] = useState("");
    const [optimizing, setOptimizing] = useState(false);
    const [saving, setSaving] = useState(false);

    const applySuggested = () => setDraft(suggested);

    const optimizeWithAi = async () => {
        setOptimizing(true);
        try {
            const res = await fetch("/api/ai/optimize-business-description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessId,
                    currentDescription,
                    topKeywords: topKeywords.slice(0, 12),
                }),
            });
            const payload = await res.json();
            if (!res.ok) {
                throw new Error(payload.error || "Failed to optimize description");
            }
            const nextSuggestion = payload?.data?.optimizedDescription || payload?.optimizedDescription || "";
            if (!nextSuggestion.trim()) {
                throw new Error("AI returned an empty suggestion");
            }
            setSuggested(nextSuggestion);
            toast.success("AI suggestion is ready. Review and apply if it looks good.");
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to optimize description");
        } finally {
            setOptimizing(false);
        }
    };

    const saveToGoogle = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/google/listing", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessId,
                    description: draft.trim(),
                }),
            });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload.error || "Failed to save description");
            toast.success("Business description updated on Google.");
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to save description");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Let us fix these issues</CardTitle>
                <CardDescription>
                    Fully optimize your profile to rank higher in local Google search.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <p className="text-sm font-medium">Your current business description</p>
                    <Textarea value={currentDescription} readOnly rows={4} className="bg-muted/30" />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">Suggested SEO-optimized description</p>
                        <Button type="button" size="sm" variant="outline" onClick={applySuggested} disabled={!suggested}>
                            Apply suggestion
                        </Button>
                    </div>
                    <Button type="button" onClick={optimizeWithAi} disabled={optimizing} className="w-fit">
                        {optimizing ? <Loader2 className="mr-2 animate-spin size-4" /> : null}
                        Optimize with AI
                    </Button>
                    <Textarea
                        value={suggested}
                        readOnly
                        rows={6}
                        placeholder="Click “Optimize with AI” to generate an improved SEO/AEO description."
                    />
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium">Editable draft (what will be saved)</p>
                    <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        rows={6}
                        placeholder="Apply the AI suggestion, then edit before saving if needed."
                    />
                    <div className="flex flex-wrap gap-1.5">
                        {topKeywords.slice(0, 8).map((k) => (
                            <Badge key={k} variant="secondary" className="text-[11px]">
                                {k}
                            </Badge>
                        ))}
                    </div>
                    <Button onClick={saveToGoogle} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 animate-spin size-4" /> : null}
                        Save to Google
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

