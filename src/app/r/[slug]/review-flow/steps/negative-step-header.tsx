import { RATINGS } from "@/app/r/[slug]/review-flow/types";

export interface NegativeStepHeaderProps {
    rating: number | null;
    apologyMsg?: string;
    negativeSubheading?: string;
}

export function NegativeStepHeader({ rating, apologyMsg, negativeSubheading }: NegativeStepHeaderProps) {
    const selectedRating = RATINGS.find((r) => r.value === rating);

    return (
        <div className="flex items-center gap-4">
            <div className="bg-muted rounded-2xl flex items-center justify-center flex-shrink-0 border border-border dark:bg-[rgb(30,41,59)] dark:border-white/10 size-16">
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
    );
}
