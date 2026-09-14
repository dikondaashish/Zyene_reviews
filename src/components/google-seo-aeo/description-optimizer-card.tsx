"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DescriptionOptimizerFields } from "./description-optimizer-fields";

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
        <Card className="h-full overflow-hidden border">
            <CardHeader>
                <CardTitle>Business description workspace</CardTitle>
                <CardDescription>
                    Draft a clearer, keyword-aware description, review it, then save the version you approve to Google.
                </CardDescription>
            </CardHeader>
            <DescriptionOptimizerFields
                currentDescription={currentDescription}
                draft={draft}
                suggested={suggested}
                topKeywords={topKeywords}
                optimizing={optimizing}
                saving={saving}
                onApplySuggested={applySuggested}
                onDraftChange={setDraft}
                onOptimizeWithAi={optimizeWithAi}
                onSaveToGoogle={saveToGoogle}
            />
        </Card>
    );
}
