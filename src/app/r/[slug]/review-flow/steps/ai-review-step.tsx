import {
    Loader2,
    Copy,
    ExternalLink,
    Sparkles,
    ArrowLeft,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AiReviewStepProps {
    googleHeading?: string;
    googleSubheading?: string;
    reviewText: string;
    isRedirecting: boolean;
    isSubmitting: boolean;
    progress: number;
    resolvedBrandColor: string;
    googleButtonText?: string;
    onReviewTextChange: (value: string) => void;
    onPostToGoogle: () => void;
    onBack: () => void;
}

export function AiReviewStep({
    googleHeading,
    googleSubheading,
    reviewText,
    isRedirecting,
    isSubmitting,
    progress,
    resolvedBrandColor,
    googleButtonText,
    onReviewTextChange,
    onPostToGoogle,
    onBack,
}: AiReviewStepProps) {
    return (
        <div className="px-8 py-10 space-y-8 animate-in fade-in slide-in-from-right-4 duration-400">
            <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-primary rounded-full" />
                <div className="h-2 flex-1 bg-primary rounded-full" />
                <div className="h-2 flex-1 bg-primary rounded-full" />
            </div>

            <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-foreground">
                    {googleHeading || "Would you post this on Google?"}
                </h2>
                <p className="text-muted-foreground text-sm">{googleSubheading || "Tap to edit, or post as-is"}</p>
            </div>

            <div className="relative">
                <div className="absolute -top-3 left-4 bg-background px-2">
                    <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Generated
                    </div>
                </div>
                <textarea
                    value={reviewText}
                    onChange={(e) => onReviewTextChange(e.target.value)}
                    className="w-full min-h-[140px] text-base p-4 pt-5 rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-0 outline-none resize-none transition-colors bg-primary/10 leading-relaxed dark:bg-primary/15 dark:text-foreground"
                />
            </div>

            <button
                className={cn(
                    "w-full h-14 rounded-2xl text-base font-semibold transition-all duration-300 relative overflow-hidden",
                    isRedirecting
                        ? "bg-muted cursor-wait ring-0 dark:bg-[rgb(51,65,85)]"
                        : "text-primary-foreground shadow-lg hover:shadow-xl active:scale-[0.98]",
                    !isRedirecting && "disabled:opacity-60 disabled:cursor-not-allowed"
                )}
                style={{ backgroundColor: isRedirecting ? "var(--muted)" : resolvedBrandColor }}
                onClick={onPostToGoogle}
                disabled={isSubmitting || isRedirecting || !reviewText.trim()}
            >
                {isRedirecting ? (
                    <>
                        <div
                            className="absolute top-0 left-0 h-full bg-primary/20 z-0 ease-linear"
                            style={{
                                width: `${progress}%`,
                                transition: "width 2s linear",
                            }}
                        />

                        <div className="relative z-10 flex items-center justify-center gap-2 text-foreground animate-in fade-in duration-300">
                            <div className="bg-chart-2/15 text-chart-2 rounded-full p-0.5">
                                <Check className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium">Review copied! Redirecting...</span>
                        </div>
                    </>
                ) : isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
                ) : (
                    <div className="flex items-center justify-center gap-2">
                        <Copy className="h-4 w-4" />
                        <span>{googleButtonText || "Copy & Go to Google"}</span>
                        <ExternalLink className="h-4 w-4 ml-1" />
                    </div>
                )}
            </button>

            <button
                className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors mx-auto"
                onClick={onBack}
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
            </button>
        </div>
    );
}
