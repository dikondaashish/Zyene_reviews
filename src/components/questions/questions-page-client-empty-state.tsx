import { HelpCircle } from "lucide-react";

export function QuestionsPageClientEmptyState() {
    return (
        <div className="rounded-lg border border-dashed bg-muted/30 p-10 text-center">
            <HelpCircle className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No questions match this filter</p>
            <p className="mt-1 text-xs text-muted-foreground">
                Sync runs with your Google listing sync. You can trigger a sync from the header.
            </p>
        </div>
    );
}
