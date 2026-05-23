import { ArrowLeft, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NegativeStepFooterProps {
    isSubmitting: boolean;
    canSubmitNegative: boolean;
    negativeButtonText?: string;
    googleUrl?: string;
    onBack: () => void;
}

export function NegativeStepFooter({
    isSubmitting,
    canSubmitNegative,
    negativeButtonText,
    googleUrl,
    onBack,
}: NegativeStepFooterProps) {
    return (
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
                    <Loader2 className="animate-spin size-5" />
                ) : (
                    <Send className="size-4" />
                )}
                {isSubmitting ? "Sending..." : (negativeButtonText || "Send Feedback")}
            </button>

            <div className="flex items-center justify-between px-1">
                <button
                    type="button"
                    className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors"
                    onClick={onBack}
                >
                    <ArrowLeft className="size-3.5" />
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
    );
}
