"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function buildSuggestion(current: string, topKeywords: string[]): string {
    const text = current.trim();
    const usableKeywords = topKeywords
        .map((k) => k.trim())
        .filter((k) => k.length > 1)
        .slice(0, 8);
    if (!usableKeywords.length) return text;

    const lower = text.toLowerCase();
    const missing = usableKeywords.filter((k) => !lower.includes(k.toLowerCase())).slice(0, 4);
    if (!missing.length) return text;

    const keywordTail = missing.join(", ");
    if (!text) {
        return `Locally trusted service for ${keywordTail}. Visit us for fast, friendly help and consistent quality.`;
    }
    return `${text}\n\nPopular searches we serve: ${keywordTail}.`;
}

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
    const [saving, setSaving] = useState(false);

    const suggested = useMemo(
        () => buildSuggestion(currentDescription, topKeywords),
        [currentDescription, topKeywords]
    );

    const applySuggested = () => setDraft(suggested);

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
                        <Button type="button" size="sm" variant="outline" onClick={applySuggested}>
                            Apply suggestion
                        </Button>
                    </div>
                    <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        rows={6}
                        placeholder="Suggested description will appear here"
                    />
                    <div className="flex flex-wrap gap-1.5">
                        {topKeywords.slice(0, 8).map((k) => (
                            <Badge key={k} variant="secondary" className="text-[11px]">
                                {k}
                            </Badge>
                        ))}
                    </div>
                    <Button onClick={saveToGoogle} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save to Google
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

