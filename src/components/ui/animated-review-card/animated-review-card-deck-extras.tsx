import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SpotlightLabels } from "@/components/ui/animated-review-card/animated-review-card-types";

export function SpotlightDeckPagination({
    labels,
    stableOrder,
    activeDotIndex,
}: {
    labels: SpotlightLabels | undefined;
    stableOrder: string[];
    activeDotIndex: number;
}) {
    if (!labels || stableOrder.length === 0) return null;
    return (
        <div className="mt-4 flex w-full justify-center px-2">
            <div
                className="flex max-w-full flex-wrap items-center justify-center gap-1.5"
                role="tablist"
                aria-label="Review position"
            >
                {stableOrder.map((id, i) => (
                    <span
                        key={id}
                        role="presentation"
                        className={cn(
                            "rounded-full transition-all duration-200",
                            i === activeDotIndex ? "h-2 w-6 bg-foreground/80" : "bg-muted-foreground/25 size-2"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}

export function SpotlightDeckBottomHint({
    labels,
    showShell,
}: {
    labels: SpotlightLabels | undefined;
    showShell: boolean;
}) {
    if (showShell || !labels) return null;
    return <p className="mt-3 max-w-md px-2 text-center text-xs text-muted-foreground">{labels.hint}</p>;
}

export function SpotlightShellTopNav({
    labels,
    showShell,
    navDisabled,
    counterCurrent,
    orderLen,
    rotateBackward,
    rotateForward,
}: {
    labels: SpotlightLabels | undefined;
    showShell: boolean;
    navDisabled: boolean;
    counterCurrent: number;
    orderLen: number;
    rotateBackward: () => void;
    rotateForward: () => void;
}) {
    if (!showShell || !labels) return null;
    return (
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial sm:justify-end">
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {counterCurrent} / {orderLen}
            </span>
            <div className="flex items-center gap-0.5">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-foreground sm:h-8 sm:w-8 size-9"
                    aria-label={labels.prev}
                    disabled={navDisabled}
                    onClick={() => rotateBackward()}
                >
                    <ChevronLeft className="size-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-foreground sm:h-8 sm:w-8 size-9"
                    aria-label={labels.next}
                    disabled={navDisabled}
                    onClick={() => rotateForward()}
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}
