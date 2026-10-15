import { Puzzle, Star } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";

export function IntegrationsPageHeader({
    connectedCount,
    totalReviews,
}: {
    connectedCount: number;
    totalReviews: number;
}) {
    return (
        <div className="space-y-4">
            <PageHeader
                title="Integrations"
                description="Connect your review platforms, POS systems, and developer tools to consolidate reviews and automate your workflow."
            />

            {connectedCount > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                        <Puzzle className="text-primary size-4" />
                        <span className="text-sm font-medium">
                            {`${connectedCount} platform${connectedCount !== 1 ? "s" : ""} connected`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                        <Star className="text-warning-foreground size-4" />
                        <span className="text-sm font-medium">
                            {`${totalReviews.toLocaleString("en-US")} review${totalReviews !== 1 ? "s" : ""} in Zyene`}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
