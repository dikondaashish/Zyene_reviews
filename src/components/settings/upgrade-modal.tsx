"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    getUpgradeModalCopy,
    type UpgradeModalContext,
} from "@/lib/phase7/upgrade-modal-copy";
import { UpgradeModalIntervalToggle } from "./upgrade-modal-interval-toggle";
import { UpgradeModalPlanCards } from "./upgrade-modal-plan-cards";
import { useUpgradeModal } from "./use-upgrade-modal";

export function UpgradeModal({
    isOpen,
    onClose,
    title,
    description,
    context,
}: {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    context?: UpgradeModalContext;
}) {
    const copy = context ? getUpgradeModalCopy(context) : null;
    const resolvedTitle = title ?? copy?.title ?? "Upgrade Your Plan";
    const resolvedDescription =
        description ?? copy?.description ?? "You've reached your usage limit. Please upgrade to continue.";
    const u = useUpgradeModal(onClose);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[95vw] max-w-5xl sm:max-w-3xl md:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{resolvedTitle}</DialogTitle>
                    <DialogDescription>{resolvedDescription}</DialogDescription>
                </DialogHeader>

                <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/20 p-4 md:p-6 mt-4">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
                        style={{
                            backgroundImage: "radial-gradient(rgba(0,0,0,0.06) 0.8px, transparent 0.8px)",
                            backgroundSize: "14px 14px",
                            maskImage:
                                "radial-gradient(ellipse at 50% 10%, rgba(0,0,0,1), rgba(0,0,0,0.25) 45%, rgba(0,0,0,0) 72%)",
                        }}
                    />

                    <div className="relative z-10">
                        <UpgradeModalIntervalToggle
                            interval={u.interval}
                            yearlySavings={u.yearlySavings}
                            onIntervalChange={u.setInterval}
                        />
                        <UpgradeModalPlanCards
                            displayPlans={u.displayPlans}
                            intervalLabel={u.intervalLabel}
                            loadingPlan={u.loadingPlan}
                            onSubscribe={u.handleSubscribe}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
