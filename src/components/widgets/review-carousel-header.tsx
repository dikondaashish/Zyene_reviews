import { Star } from "lucide-react";

export function ReviewCarouselHeader({ businessName }: { businessName: string }) {
    return (
        <div className="mb-4 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="fill-chart-4 text-chart-4 size-5" />
                    ))}
                </div>
                <span className="font-semibold text-foreground text-sm tracking-tight">{businessName}</span>
            </div>
            <div className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full border border-border">
                Verified Reviews
            </div>
        </div>
    );
}
