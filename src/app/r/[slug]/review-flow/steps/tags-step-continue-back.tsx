import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TagsStepContinueButtonProps {
    hasTagSelection: boolean;
    onContinue: () => void;
}

export function TagsStepContinueButton({ hasTagSelection, onContinue }: TagsStepContinueButtonProps) {
    if (!hasTagSelection) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            <button
                type="button"
                className={cn(
                    "w-full min-h-12 rounded-xl text-base font-semibold text-primary-foreground transition-all duration-300",
                    "dark:text-white",
                    "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary",
                    "shadow-lg shadow-primary/20 hover:shadow-primary/30",
                    "active:scale-[0.98] flex items-center justify-center gap-2"
                )}
                onClick={onContinue}
            >
                Continue
                <ChevronRight className="size-5" />
            </button>
        </div>
    );
}
