import Link from "next/link";
import { ZyeneReviewsLogoMark } from "@/components/brand/zyene-reviews-logo-mark";
import { cn } from "@/lib/utils";

export function ZyeneReviewsLogoLink({
    href = "/",
    size = 36,
    showWordmark = true,
    wordmarkClassName,
    className,
    priority = false,
}: {
    href?: string;
    size?: number;
    showWordmark?: boolean;
    wordmarkClassName?: string;
    className?: string;
    priority?: boolean;
}) {
    return (
        <Link href={href} className={cn("group inline-flex min-w-0 shrink-0 items-center gap-2", className)}>
            <ZyeneReviewsLogoMark size={size} priority={priority} className="group-hover:ring-primary/50 transition-colors" />
            {showWordmark ? (
                <span className={cn("font-bold text-xl leading-none tracking-tight", wordmarkClassName)}>
                    <span className="text-primary">Zyene</span> Reviews
                </span>
            ) : null}
        </Link>
    );
}
