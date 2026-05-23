"use client";

import { Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Plan } from "@/services/stripe/plans";
import { isPaidPlanTierUpgrade } from "@/services/stripe/plans";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { ProrationPreviewState } from "@/components/settings/billing-client-types";
import { formatRecurringLabel } from "@/components/settings/billing-plan-helpers";

type BillingDict = Dictionary["billing"];

export function BillingPlanChangeDialog(props: {
    billing: BillingDict;
    planStatus: string;
    currentPlan: Plan | null;
    confirmPlanChange: { priceId: string; plan: Plan } | null;
    setConfirmPlanChange: (v: { priceId: string; plan: Plan } | null) => void;
    setProrationPreview: (v: ProrationPreviewState) => void;
    prorationPreview: ProrationPreviewState;
    onConfirmContinue: (priceId: string) => void;
}) {
    const {
        billing: b,
        planStatus,
        currentPlan,
        confirmPlanChange,
        setConfirmPlanChange,
        setProrationPreview,
        prorationPreview,
        onConfirmContinue,
    } = props;

    return (
        <AlertDialog
            open={confirmPlanChange !== null}
            onOpenChange={(open) => {
                if (!open) {
                    setConfirmPlanChange(null);
                    setProrationPreview("idle");
                }
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{b.confirm_plan_change_title}</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3 text-muted-foreground text-sm">
                            {prorationPreview === "loading" && (
                                <div className="flex items-center gap-2 text-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                                    <span>{b.proration_preview_loading}</span>
                                </div>
                            )}
                            {prorationPreview === "fallback" && confirmPlanChange && (
                                <p>
                                    {b.proration_notice_fallback.replace(
                                        "{{recurring}}",
                                        formatRecurringLabel(confirmPlanChange.plan)
                                    )}
                                </p>
                            )}
                            {typeof prorationPreview === "object" && confirmPlanChange && (
                                <p>
                                    {b.proration_notice
                                        .replace("{{amount_due_today}}", prorationPreview.amountFormatted)
                                        .replace("{{recurring}}", formatRecurringLabel(confirmPlanChange.plan))}
                                </p>
                            )}
                            {confirmPlanChange &&
                                planStatus === "trialing" &&
                                isPaidPlanTierUpgrade(currentPlan?.id, confirmPlanChange.plan.id) && (
                                    <p className="text-chart-4 dark:text-chart-4 font-medium">{b.trial_ends_on_upgrade_notice}</p>
                                )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{b.confirm_plan_change_cancel}</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={prorationPreview === "loading"}
                        onClick={() => {
                            const pending = confirmPlanChange;
                            setConfirmPlanChange(null);
                            setProrationPreview("idle");
                            if (pending) onConfirmContinue(pending.priceId);
                        }}
                    >
                        {b.confirm_plan_change_continue}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
