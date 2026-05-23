import { cn } from "@/lib/utils";
import { buildPlgMarketingUrl, PLG_FOOTER_LABEL } from "@/lib/growth/plg-attribution";

export function ZyeneReviewsPlgLink({ className }: { className?: string }) {
    return (
        <a
            href={buildPlgMarketingUrl("review-page")}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "inline-flex items-center gap-1.5 font-bold tracking-tight text-foreground hover:text-foreground/80 transition-colors underline-offset-2 hover:underline",
                className
            )}
        >
            {PLG_FOOTER_LABEL}
        </a>
    );
}
