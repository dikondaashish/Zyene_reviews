"use client";

import { Button } from "@/components/ui/button";
import { Globe, LockKeyhole, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewsPageClientTypeTabsProps {
    type: string;
    publicCount: number;
    privateCount: number;
    loading: boolean;
    isImportingGoogleReviews: boolean;
    isBackfillingAi: boolean;
    onTypeChange: (t: string) => void;
    onBackfillAi: () => void;
}

export function ReviewsPageClientTypeTabs(props: ReviewsPageClientTypeTabsProps) {
    return (
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-2 border-b border-border">
            <div className="flex min-w-0 gap-4 sm:gap-6" role="group" aria-label="Review visibility">
                {[
                    { value: "public", label: "Public reviews", count: props.publicCount, icon: Globe },
                    { value: "private", label: "Private feedback", count: props.privateCount, icon: LockKeyhole },
                ].map(({ value, label, count, icon: Icon }) => (
                    <button key={value} type="button" aria-label={`${label} ${count}`} aria-pressed={props.type === value}
                        onClick={() => props.onTypeChange(value)}
                        className={cn("-mb-px flex min-h-12 items-center gap-2 border-b-2 px-0.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring sm:text-sm",
                            props.type === value ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
                        <Icon className="hidden size-4 sm:block" aria-hidden="true" /><span className="hidden sm:inline">{label}</span><span className="sm:hidden">{value === "public" ? "Public" : "Private"}</span>
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">{count.toLocaleString("en-US")}</span>
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2">
                {(props.loading || props.isImportingGoogleReviews) && <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-label="Updating reviews" />}
                {props.isImportingGoogleReviews && <span role="status" className="text-xs text-muted-foreground">Importing from Google…</span>}
                {props.type === "public" && (
                    <Button size="sm" variant="ghost" aria-label="Analyze unprocessed reviews" className="text-xs text-muted-foreground" onClick={props.onBackfillAi} disabled={props.isBackfillingAi}>
                        {props.isBackfillingAi ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                        <span className="hidden sm:inline">{props.isBackfillingAi ? "Queuing analysis…" : "Analyze reviews"}</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
