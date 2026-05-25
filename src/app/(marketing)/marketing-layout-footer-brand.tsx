import Link from "next/link";
import { ZyeneReviewsLogoMark } from "@/components/brand/zyene-reviews-logo-mark";

export function MarketingLayoutFooterBrand() {
    return (
        <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <ZyeneReviewsLogoMark size={32} />
                <span className="font-bold text-base text-foreground">
                    <span className="text-primary">Zyene</span> Reviews
                </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Review management and local SEO for owner-operators at a fraction of enterprise pricing.
            </p>
            <p className="mt-6 text-xs text-muted-foreground/70">
                © {new Date().getFullYear()} Zyene, Inc.
            </p>
        </div>
    );
}
