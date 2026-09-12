import { Star } from "lucide-react";

export function ReviewCarouselHeader({ businessName }: { businessName: string }) {
    return (
        <div className="mb-4 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Star aria-hidden="true" className="text-chart-4 size-5" />
                <span className="font-semibold text-foreground text-sm tracking-tight">{businessName}</span>
            </div>
            <div className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full border border-border">
                Customer reviews
            </div>
        </div>
    );
}
