import Link from "next/link";
import { ZyeneReviewsLogoMark } from "@/components/brand/zyene-reviews-logo-mark";
import { FooterTrustStrip } from "@/components/marketing/social-proof";

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
                Review management and local SEO for owner-operators—at a fraction of enterprise
                pricing.
            </p>
            <div className="mt-4">
                <FooterTrustStrip />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
                <Link href="/es/industries" className="hover:text-primary transition-colors">
                    Industrias (Español)
                </Link>
                <span className="mx-1.5 text-border">·</span>
                Dashboard in EN, ES, FR, DE, NL, PT
            </p>
            <p className="mt-2 text-xs text-muted-foreground/70">
                © {new Date().getFullYear()} Zyene, Inc. · Local to Global
            </p>
        </div>
    );
}
