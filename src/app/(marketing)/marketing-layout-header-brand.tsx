import Link from "next/link";
import { ZyeneReviewsLogoMark } from "@/components/brand/zyene-reviews-logo-mark";

export function MarketingLayoutHeaderBrand() {
    return (
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 group">
            <ZyeneReviewsLogoMark size={36} priority className="group-hover:ring-primary/50 transition-colors" />
            <div className="flex flex-col">
                <span className="font-bold text-xl text-foreground leading-none tracking-tight">
                    <span className="text-primary">Zyene</span> Reviews
                </span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-[0.15em] uppercase leading-none mt-1">
                    Grow local to global
                </span>
            </div>
        </Link>
    );
}
