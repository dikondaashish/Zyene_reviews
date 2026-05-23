import { FormEvent } from "react";
import {
    Loader2,
    Send,
    ArrowLeft,
    Mail,
    Phone,
    Gift,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DEFAULT_PRIVATE_FEEDBACK_OFFER_TEXT,
    PrivateFeedbackContactMode,
    PrivateFeedbackOfferMode,
    RATINGS,
} from "../types";

export interface NegativeStepProps {
    rating: number | null;
    resolvedBrandColor: string;
    apologyMsg?: string;
    negativeSubheading?: string;
    privateFeedbackOfferMode?: PrivateFeedbackOfferMode;
    privateFeedbackOfferMessage?: string | null;
    negativeTextareaPlaceholder?: string;
    privateFeedbackEmailMode?: PrivateFeedbackContactMode;
    privateFeedbackPhoneMode?: PrivateFeedbackContactMode;
    feedback: string;
    customerEmail: string;
    customerPhone: string;
    isSubmitting: boolean;
    canSubmitNegative: boolean;
    negativeButtonText?: string;
    googleUrl?: string;
    onFeedbackChange: (value: string) => void;
    onCustomerEmailChange: (value: string) => void;
    onCustomerPhoneChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onBack: () => void;
}

export function NegativeStep({
    rating,
    resolvedBrandColor,
    apologyMsg,
    negativeSubheading,
    privateFeedbackOfferMode = "hidden",
    privateFeedbackOfferMessage = null,
    negativeTextareaPlaceholder,
    privateFeedbackEmailMode = "optional",
    privateFeedbackPhoneMode = "hidden",
    feedback,
    customerEmail,
    customerPhone,
    isSubmitting,
    canSubmitNegative,
    negativeButtonText,
    googleUrl,
    onFeedbackChange,
    onCustomerEmailChange,
    onCustomerPhoneChange,
    onSubmit,
    onBack,
}: NegativeStepProps) {
    const selectedRating = RATINGS.find((r) => r.value === rating);
    const offerBannerText =
        privateFeedbackOfferMessage?.trim() || DEFAULT_PRIVATE_FEEDBACK_OFFER_TEXT;
    const offerBrandHex =
        resolvedBrandColor !== "var(--primary)" && /^#([0-9A-F]{3}){1,2}$/i.test(resolvedBrandColor)
            ? resolvedBrandColor
            : null;

    return (
        <form
            className="px-8 py-10 space-y-6 animate-in fade-in slide-in-from-right-4 duration-400"
            onSubmit={onSubmit}
        >
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center flex-shrink-0 border border-border dark:bg-[rgb(30,41,59)] dark:border-white/10">
                    <span className="text-4xl">{selectedRating?.emoji || "😕"}</span>
                </div>
                <div className="text-left">
                    <h2 className="text-xl font-bold text-foreground">
                        {apologyMsg || "Sorry about that"}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-snug">
                        {negativeSubheading || "Share your feedback directly with the owner."}
                    </p>
                </div>
            </div>

            {privateFeedbackOfferMode === "visible" && (
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
            )}

            <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Your feedback</label>
                <textarea
                    placeholder={negativeTextareaPlaceholder || "Tell us what happened..."}
                    className="w-full min-h-[140px] text-base p-4 rounded-2xl border-2 border-border focus:border-primary focus:ring-0 outline-none resize-none transition-colors bg-muted placeholder:text-muted-foreground dark:bg-[rgb(30,41,59)] dark:border-white/10 dark:text-foreground"
                    value={feedback}
                    onChange={(e) => onFeedbackChange(e.target.value)}
                    autoFocus
                />
            </div>

            {privateFeedbackEmailMode !== "hidden" && (
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                        Your email{" "}
                        {privateFeedbackEmailMode === "required" ? (
                            <span className="text-destructive">*</span>
                        ) : (
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        )}
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="w-full h-12 pl-11 pr-4 rounded-2xl border-2 border-border focus:border-primary focus:ring-0 outline-none transition-colors bg-muted text-sm placeholder:text-muted-foreground dark:bg-[rgb(30,41,59)] dark:border-white/10 dark:text-foreground"
                            value={customerEmail}
                            onChange={(e) => onCustomerEmailChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            {privateFeedbackPhoneMode !== "hidden" && (
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                        Phone number{" "}
                        {privateFeedbackPhoneMode === "required" ? (
                            <span className="text-destructive">*</span>
                        ) : (
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        )}
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="+1 (555) 000-0000"
                            className="w-full h-12 pl-11 pr-4 rounded-2xl border-2 border-border focus:border-primary focus:ring-0 outline-none transition-colors bg-muted text-sm placeholder:text-muted-foreground dark:bg-[rgb(30,41,59)] dark:border-white/10 dark:text-foreground"
                            value={customerPhone}
                            onChange={(e) => onCustomerPhoneChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="space-y-3 pt-2">
                <button
                    type="submit"
                    className={cn(
                        "w-full h-14 rounded-2xl text-base font-semibold text-primary-foreground transition-all duration-300",
                        "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary",
                        "shadow-lg shadow-primary/20 hover:shadow-primary/30",
                        "active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
                        "flex items-center justify-center gap-2"
                    )}
                    disabled={isSubmitting || !canSubmitNegative}
                >
                    {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                    {isSubmitting ? "Sending..." : (negativeButtonText || "Send Feedback")}
                </button>

                <div className="flex items-center justify-between px-1">
                    <button
                        type="button"
                        className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors"
                        onClick={onBack}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back
                    </button>
                    {googleUrl && (
                        <a
                            href={googleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                        >
                            Go to Google
                        </a>
                    )}
                </div>
            </div>
        </form>
    );
}
