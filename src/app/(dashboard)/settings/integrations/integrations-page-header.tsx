import { Puzzle, Star } from "lucide-react";

export function IntegrationsPageHeader({
    connectedCount,
    totalReviews,
}: {
    connectedCount: number;
    totalReviews: number;
}) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Connect your review platforms, POS systems, and
                    developer tools to consolidate reviews and automate
                    your workflow.
                </p>
            </div>

            {connectedCount > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                        <Puzzle className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                            {`${connectedCount} platform${connectedCount !== 1 ? "s" : ""} connected`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                        <Star className="h-4 w-4 text-chart-4" />
                        <span className="text-sm font-medium">
                            {`${totalReviews.toLocaleString("en-US")} review${totalReviews !== 1 ? "s" : ""} in Zyene`}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
