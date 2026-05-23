import { Loader2 } from "lucide-react";

export function SmartInsightsCardLoading() {
    return (
        <div className="rounded-[24px] border border-border bg-card p-6 h-full flex flex-col justify-center items-center shadow-sm min-h-[360px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Generating Smart Insights...</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Analyzing all recent reviews</p>
        </div>
    );
}
