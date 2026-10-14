import { Loader2 } from "lucide-react";

export function GeneratingStep() {
    return (
        <div className="px-8 py-20 text-center space-y-6">
            <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-primary rounded-full" />
                <div className="h-2 flex-1 bg-primary rounded-full" />
                <div className="h-2 flex-1 bg-primary/70 rounded-full animate-pulse dark:bg-primary/60" />
            </div>

            <div className="flex justify-center">
                <div className="flex items-center justify-center rounded-full bg-primary/10 size-16">
                    <Loader2 className="text-primary animate-spin size-7" aria-hidden="true" />
                </div>
            </div>
            <div>
                <h2 className="text-xl font-bold text-foreground">Writing a draft from your answers</h2>
                <p className="text-sm text-muted-foreground mt-1">This takes a few seconds. You can edit it next.</p>
            </div>
        </div>
    );
}
