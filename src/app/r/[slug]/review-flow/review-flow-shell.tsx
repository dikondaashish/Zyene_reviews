import { cn } from "@/lib/utils";
import {
    DEFAULT_REVIEW_PAGE_BACKDROP_CSS,
    DEFAULT_REVIEW_PAGE_BACKGROUND_HEX,
    reviewPageBackdropGradient,
} from "@/lib/utils/review-page-background";
import { ReviewFlowPoweredBy } from "./review-flow-powered-by";

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
            <div
                className={cn(
                    "relative w-full max-w-md bg-card rounded-3xl border border-border overflow-hidden shadow-xl shadow-black/10 dark:shadow-black/40",
                    "transform transition-all duration-500",
                    mounted ? "translate-y-0 scale-100" : "translate-y-4 scale-95",
                    contentClassName
                )}
            >
                {children}

                {!hideBranding && (
                    <div
                        className={cn(
                            "py-4 text-center border-t border-border dark:border-border",
                            footerClassName
                        )}
                    >
                        <ReviewFlowPoweredBy
                            footerLink={footerLink}
                            footerLogoUrl={footerLogoUrl}
                            footerCompanyName={footerCompanyName}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
