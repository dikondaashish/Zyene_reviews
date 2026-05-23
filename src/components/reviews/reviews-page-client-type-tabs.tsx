"use client";

import { Button } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";

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

export function ReviewsPageClientTypeTabs({
    type,
    publicCount,
    privateCount,
    loading,
    isImportingGoogleReviews,
    isBackfillingAi,
    onTypeChange,
    onBackfillAi,
}: ReviewsPageClientTypeTabsProps) {
    return (
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="inline-flex w-full min-w-0 rounded-lg bg-muted p-1 sm:w-auto">
                <button type="button" className="min-w-0 flex-1" onClick={() => onTypeChange("public")}>
                    <div
                        className={`cursor-pointer rounded-md px-3 py-2 text-center text-xs font-medium transition-all sm:px-4 sm:py-1.5 sm:text-sm ${
                            type === "public" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Public ({publicCount})
                    </div>
                </button>
                <button type="button" className="min-w-0 flex-1" onClick={() => onTypeChange("private")}>
                    <div
                        className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:py-1.5 sm:text-sm ${
                            type === "private" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Private ({privateCount})
                        <Lock className="shrink-0 size-3" />
                    </div>
                </button>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
                {(loading || isImportingGoogleReviews) && (
                    <Loader2 className="animate-spin text-muted-foreground size-4" />
                )}
                {isImportingGoogleReviews && (
                    <span className="text-xs text-muted-foreground">Importing from Google…</span>
                )}
                {type === "public" && (
                    <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={onBackfillAi} disabled={isBackfillingAi}>
                        {isBackfillingAi ? (
                            <>
                                <Loader2 className="mr-2 animate-spin size-4" />
                                Queuing AI...
                            </>
                        ) : (
                            "Analyze Missing AI"
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
