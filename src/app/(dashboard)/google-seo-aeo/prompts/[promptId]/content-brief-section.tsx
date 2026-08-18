"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles, Copy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateContentBriefNow } from "./generate-brief-action";
import type { LatestBrief } from "./load-latest-brief";
import { ContentRewriteDiff } from "./content-rewrite-diff";

function CopyButton({ text, label }: { text: string; label: string }) {
    return (
        <Button
            size="sm"
            variant="outline"
            onClick={() => {
                navigator.clipboard.writeText(text);
                toast.success(`${label} copied`);
            }}
        >
            <Copy className="mr-1.5 size-3.5" /> Copy {label}
        </Button>
    );
}

/** F6.1/F6.2/F6.4/F6.5: the content brief for this exact prompt — never auto-published, always copy-paste. */
export function ContentBriefSection({
    businessId,
    promptId,
    brief,
}: {
    businessId: string;
    promptId: string;
    brief: LatestBrief | null;
}) {
    const router = useRouter();
    const [generating, setGenerating] = React.useState(false);

    async function handleGenerate() {
        setGenerating(true);
        const result = await generateContentBriefNow(businessId, promptId);
        setGenerating(false);
        if (!result.success) {
            toast.error(result.error);
            return;
        }
        toast.success("Content brief generated.");
        router.refresh();
    }

    return (
        <div className="space-y-4">
            <Button onClick={handleGenerate} disabled={generating} size="sm">
                {generating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                {brief ? "Regenerate brief" : "Generate content brief"}
            </Button>

            {brief && (
                <div className="space-y-5 rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={brief.confidence === "high" ? "default" : "outline"}>
                            {brief.confidence === "high" ? "High confidence" : "Low confidence"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            Based on {brief.citedSourceCount} cited source{brief.citedSourceCount === 1 ? "" : "s"} ·{" "}
                            {brief.createdLabel}
                        </span>
                    </div>

                    {brief.confidence === "low" && (
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                            The cited sources for this prompt could not be read (paywalled or blocked) — this brief
                            is based on the prompt and gap analysis alone.
                        </div>
                    )}

                    <div>
                        <p className="text-sm font-medium">Target page</p>
                        <p className="text-sm text-muted-foreground">
                            {brief.hasOwningPage ? brief.targetPageUrl : "No existing page owns this prompt yet — create a new page for it."}
                        </p>
                    </div>

                    <ContentRewriteDiff before={brief.rewriteBefore} after={brief.rewriteAfter} reviewInsights={brief.reviewInsights} />

                    {brief.editItems.length > 0 && (
                        <div>
                            <p className="text-sm font-medium mb-1.5">Edit checklist</p>
                            <ul className="space-y-1.5">
                                {brief.editItems.map((item) => (
                                    <li key={`${item.category}:${item.description}`} className="text-sm">
                                        <span className="text-xs font-medium uppercase text-muted-foreground">
                                            {item.category}
                                        </span>{" "}
                                        — {item.description}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {brief.faqItems.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">FAQ block</p>
                                <div className="flex gap-1.5">
                                    <CopyButton text={brief.faqHtml} label="HTML" />
                                    <CopyButton text={brief.faqJsonLd} label="JSON-LD" />
                                </div>
                            </div>
                            <ul className="mt-1.5 space-y-2">
                                {brief.faqItems.map((item) => (
                                    <li key={item.question} className="text-sm">
                                        <p className="font-medium">{item.question}</p>
                                        <p className="text-muted-foreground">{item.answer}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Schema patch</p>
                            <CopyButton text={brief.schemaPatchJsonLd} label="JSON-LD" />
                        </div>
                        {brief.schemaPatchHasPlaceholders && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                Contains {"{{placeholders}}"} for facts we could not verify — fill those in before
                                publishing.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
