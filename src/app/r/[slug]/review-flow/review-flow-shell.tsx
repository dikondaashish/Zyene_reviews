import { cn } from "@/lib/utils";
import {
    DEFAULT_REVIEW_PAGE_BACKDROP_CSS,
    DEFAULT_REVIEW_PAGE_BACKGROUND_HEX,
    reviewPageBackdropGradient,
    reviewPageOrbRgba,
} from "@/lib/utils/review-page-background";
import { ZyeneReviewsPlgLink } from "./plg-link";

export interface ReviewFlowShellProps {
    children: React.ReactNode;
    contentClassName?: string;
    footerClassName?: string;
    mounted: boolean;
    className?: string;
    useCustomPageBackdrop: boolean;
    pageBgHex: string;
    hideBranding: boolean;
    footerLink?: string;
    footerLogoUrl?: string;
    footerCompanyName?: string;
}

export function ReviewFlowShell({
    children,
    contentClassName,
    footerClassName,
    mounted,
    className,
    useCustomPageBackdrop,
    pageBgHex,
    hideBranding,
    footerLink,
    footerLogoUrl,
    footerCompanyName,
}: ReviewFlowShellProps) {
    return (
        <div
            className={cn(
                "min-h-screen flex items-center justify-center p-4 transition-all duration-500",
                !mounted && "opacity-0",
                mounted && "opacity-100",
                className
            )}
            style={{
                background: useCustomPageBackdrop
                    ? reviewPageBackdropGradient(pageBgHex)
                    : DEFAULT_REVIEW_PAGE_BACKDROP_CSS,
            }}
        >
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <>
                    <div
                        className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse"
                        style={{
                            backgroundColor: reviewPageOrbRgba(
                                useCustomPageBackdrop ? pageBgHex : DEFAULT_REVIEW_PAGE_BACKGROUND_HEX,
                                0.14
                            ),
                        }}
                    />
                    <div
                        className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse"
                        style={{
                            backgroundColor: reviewPageOrbRgba(
                                useCustomPageBackdrop ? pageBgHex : DEFAULT_REVIEW_PAGE_BACKGROUND_HEX,
                                0.11
                            ),
                            animationDelay: "1s",
                        }}
                    />
                </>
            </div>

            <div
                className={cn(
                    "relative w-full max-w-md bg-card rounded-3xl border border-border overflow-hidden shadow-2xl shadow-black/20 dark:bg-[rgb(17,24,39)] dark:border-white/10 dark:shadow-black/45",
                    "transform transition-all duration-500",
                    mounted ? "translate-y-0 scale-100" : "translate-y-4 scale-95",
                    contentClassName
                )}
            >
                {children}

                {!hideBranding && (
                    <div
                        className={cn(
                            "py-4 text-center border-t border-border dark:border-white/10",
                            footerClassName
                        )}
                    >
                        <div className="text-xs text-muted-foreground font-medium tracking-wide flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center justify-center gap-1.5">
                                <span>Powered by</span>
                                {footerLink ? (
                                    <a
                                        href={footerLink.startsWith("http") ? footerLink : `https://${footerLink}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 no-underline"
                                    >
                                        {footerLogoUrl && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={footerLogoUrl}
                                                alt="Footer Logo"
                                                className="h-4 w-4 object-contain"
                                            />
                                        )}
                                        <span className="text-foreground font-bold tracking-tight hover:text-foreground/80 transition-colors">
                                            {footerCompanyName || "Zyene"}
                                        </span>
                                    </a>
                                ) : (
                                    <ZyeneReviewsPlgLink />
                                )}
                            </div>
                            {footerLink ? <ZyeneReviewsPlgLink className="text-[10px]" /> : null}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
