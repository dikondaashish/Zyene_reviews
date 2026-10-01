import { ChevronRight } from "lucide-react";
import { readableForeground } from "@/lib/design/contrast";

export interface TagsStepContinueButtonProps {
    hasTagSelection: boolean;
    resolvedBrandColor: string;
    onContinue: () => void;
}

export function TagsStepContinueButton({
    hasTagSelection, resolvedBrandColor, onContinue,
}: TagsStepContinueButtonProps) {
    return (
        <button
            type="button"
            disabled={!hasTagSelection}
            className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
            style={{ backgroundColor: resolvedBrandColor, color: readableForeground(resolvedBrandColor) }}
            onClick={onContinue}
        >
            Continue
            <ChevronRight className="size-5" aria-hidden="true" />
        </button>
    );
}
