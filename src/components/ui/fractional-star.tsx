import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * One star slot filled 0–1 for a 0–5 average: use fill = clamp(rating - index, 0, 1).
 */
export function FractionalStar({
    fill,
    className,
    starClassName,
}: {
    fill: number;
    className?: string;
    /** Size for both outline and fill stars, e.g. "h-10 w-10" */
    starClassName?: string;
}) {
    const f = Math.max(0, Math.min(1, fill));
    const size = starClassName ?? "h-4 w-4";

    return (
        <span className={cn("relative inline-block shrink-0", size, className)}>
            <Star
                className={cn("pointer-events-none absolute inset-0 fill-muted text-muted-foreground/40", size)}
                aria-hidden
            />
            <span className="absolute left-0 top-0 h-full overflow-hidden" style={{ width: `${f * 100}%` }}>
                <Star className={cn("pointer-events-none shrink-0 fill-yellow-400 text-yellow-400", size)} aria-hidden />
            </span>
        </span>
    );
}
