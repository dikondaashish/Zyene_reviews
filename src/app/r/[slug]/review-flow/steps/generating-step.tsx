import { Sparkles } from "lucide-react";

export function GeneratingStep() {
    return (
        <div className="px-8 py-20 text-center space-y-6">
            <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-primary rounded-full" />
                <div className="h-2 flex-1 bg-primary rounded-full" />
                <div className="h-2 flex-1 bg-primary/70 rounded-full animate-pulse dark:bg-primary/60" />
            </div>

            <div className="flex justify-center">
                <div className="relative">
                    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse size-16">
                        <Sparkles className="text-primary-foreground size-8" />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-chart-4 rounded-full animate-ping size-4" />
                </div>
            </div>
            <div>
                <h2 className="text-xl font-bold text-foreground">Crafting your review...</h2>
                <p className="text-sm text-muted-foreground mt-1">Just a moment ✨</p>
            </div>
        </div>
    );
}
