import Image from "next/image";
import { ZYENE_REVIEWS_LOGO_ALT } from "@/lib/brand/logo";
import { resolveReviewFlowFooterBranding } from "@/lib/brand/review-flow-footer-branding";

export function ReviewFlowPoweredBy({
    footerLink,
    footerLogoUrl,
    footerCompanyName,
}: {
    footerLink?: string;
    footerLogoUrl?: string;
    footerCompanyName?: string;
}) {
    const { href, logoSrc, label } = resolveReviewFlowFooterBranding({
        footerLink,
        footerLogoUrl,
        footerCompanyName,
    });

    return (
        <div className="text-xs text-muted-foreground font-medium tracking-wide flex items-center justify-center gap-1.5">
            <span>Powered by</span>
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-foreground font-bold tracking-tight hover:text-foreground/80 transition-colors no-underline hover:underline underline-offset-2"
            >
                <Image
                    src={logoSrc}
                    alt={ZYENE_REVIEWS_LOGO_ALT}
                    width={16}
                    height={16}
                    className="size-4 shrink-0 rounded object-cover ring-1 ring-border/60"
                />
                {label}
            </a>
        </div>
    );
}
