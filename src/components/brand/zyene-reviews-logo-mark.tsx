import Image from "next/image";
import { cn } from "@/lib/utils";
import { ZYENE_REVIEWS_LOGO_ALT, ZYENE_REVIEWS_LOGO_SRC } from "@/lib/brand/logo";

export function ZyeneReviewsLogoMark({
    size = 36,
    className,
    priority = false,
}: {
    size?: number;
    className?: string;
    priority?: boolean;
}) {
    return (
        <div
            className={cn(
                "flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded shadow-sm ring-1 ring-border/60",
                className
            )}
            style={{ width: size, height: size }}
        >
            <Image
                src={ZYENE_REVIEWS_LOGO_SRC}
                alt={ZYENE_REVIEWS_LOGO_ALT}
                width={size}
                height={size}
                className="object-cover size-full"
                priority={priority}
            />
        </div>
    );
}
