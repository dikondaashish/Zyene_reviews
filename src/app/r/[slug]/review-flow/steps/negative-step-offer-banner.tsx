import { Gift } from "lucide-react";
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
                "bg-muted/50 animate-in fade-in duration-500"
            )}
            role="status"
            aria-live="polite"
        >
            <div
                className="pointer-events-none absolute inset-y-4 left-3 w-1 rounded-full"
                style={{
                    background: offerBrandHex ?? "var(--primary)",
                }}
                aria-hidden
            />
            <div className="relative flex gap-4 pl-3">
                <div
                    className="flex shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary size-11"
                    aria-hidden
                >
                    <Gift className="size-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground">
                            Special offer
                        </p>
                    </div>
                    <p className="text-[15px] leading-relaxed text-muted-foreground whitespace-pre-line">
                        {offerBannerText}
                    </p>
                </div>
            </div>
        </div>
    );
}
