import { Gift, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DEFAULT_PRIVATE_FEEDBACK_OFFER_TEXT,
    PrivateFeedbackOfferMode,
} from "@/app/r/[slug]/review-flow/types";

export interface NegativeStepOfferBannerProps {
    resolvedBrandColor: string;
    privateFeedbackOfferMode?: PrivateFeedbackOfferMode;
    privateFeedbackOfferMessage?: string | null;
}

export function NegativeStepOfferBanner({
    resolvedBrandColor,
    privateFeedbackOfferMode = "hidden",
    privateFeedbackOfferMessage = null,
}: NegativeStepOfferBannerProps) {
    if (privateFeedbackOfferMode !== "visible") return null;

    const offerBannerText =
        privateFeedbackOfferMessage?.trim() || DEFAULT_PRIVATE_FEEDBACK_OFFER_TEXT;
    const offerBrandHex =
        resolvedBrandColor !== "var(--primary)" && /^#([0-9A-F]{3}){1,2}$/i.test(resolvedBrandColor)
            ? resolvedBrandColor
            : null;

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-border p-5 pl-5",
                "bg-gradient-to-br from-background via-muted/80 to-primary/5 dark:from-[rgb(15,23,42)] dark:via-[rgb(30,41,59)] dark:to-primary/10 dark:border-white/10",
                "ring-1 ring-border animate-in fade-in zoom-in-95 duration-500"
            )}
            role="status"
            aria-live="polite"
        >
            <div
                className="pointer-events-none absolute inset-y-4 left-3 w-1 rounded-full"
                style={{
                    background: offerBrandHex
                        ? `linear-gradient(180deg, ${offerBrandHex} 0%, var(--public-review-gradient-b) 70%, var(--public-review-gradient-c) 100%)`
                        : "var(--public-review-offer-strip-default)",
                }}
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 blur-[2px]"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -bottom-6 right-10 h-24 w-24 rounded-full bg-muted/40"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute right-20 top-3 text-primary/35"
                aria-hidden
            >
                <Sparkles className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="relative flex gap-4 pl-3">
                <div
                    className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-primary-foreground",
                        "bg-gradient-to-br from-primary to-chart-2 shadow-md shadow-foreground/10 ring-2 ring-primary-foreground/80"
                    )}
                    aria-hidden
                >
                    <Gift className="h-6 w-6" strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground">
                            Special offer
                        </p>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary ring-1 ring-primary/25">
                            Exclusive
                        </span>
                    </div>
                    <p className="text-[15px] leading-relaxed text-muted-foreground whitespace-pre-line">
                        {offerBannerText}
                    </p>
                </div>
            </div>
        </div>
    );
}
