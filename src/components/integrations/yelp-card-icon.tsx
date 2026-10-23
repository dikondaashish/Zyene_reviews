import Image from "next/image";
import { cn } from "@/lib/utils";
import { getBrandLogoUrl } from "@/lib/marketing/integration-brands";

/** Yelp's official burst mark (the same file the marketing pages use). */
export function YelpCardIcon({ className }: { className?: string }) {
    return (
        <Image
            src={getBrandLogoUrl("yelp.com")}
            alt=""
            aria-hidden
            width={24}
            height={24}
            unoptimized
            className={cn("size-6 shrink-0 object-contain", className)}
        />
    );
}
