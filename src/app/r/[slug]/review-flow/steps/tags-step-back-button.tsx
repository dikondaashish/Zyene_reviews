import { ArrowLeft } from "lucide-react";

export interface TagsStepBackButtonProps {
    onBack: () => void;
}

export function TagsStepBackButton({ onBack }: TagsStepBackButtonProps) {
    return (
        <button
            type="button"
            className="mt-6 mb-2 flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors mx-auto"
            onClick={onBack}
        >
            <ArrowLeft className="size-3.5" />
            Back
        </button>
    );
}
