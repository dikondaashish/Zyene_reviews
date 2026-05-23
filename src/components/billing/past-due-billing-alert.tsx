"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PastDueBillingAlertLayout = "banner" | "panel";

export interface PastDueBillingAlertProps {
    layout: PastDueBillingAlertLayout;
    /** CTA: label, disabled, loading, handler ,  parent decides (billing page vs dashboard banner). */
    action: {
        label: string;
        disabled?: boolean;
        loading?: boolean;
        onClick: () => void;
    };
}

/**
 * Shared “payment past due” UI for the billing page and global dashboard banner.
 */
export function PastDueBillingAlert({ layout, action }: PastDueBillingAlertProps) {
    const { label, disabled, loading, onClick } = action;

    return (
        <div
            className={cn(
                "flex flex-col gap-3 border border-primary/20 bg-primary/10 sm:flex-row sm:items-center",
                layout === "banner" && "w-full border-x-0 border-t-0 px-4 py-3",
                layout === "panel" && "rounded-lg p-4"
            )}
            role="alert"
        >
            <AlertTriangle className="shrink-0 text-primary size-5" aria-hidden />
            <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">Payment past due</p>
                <p className="text-sm text-muted-foreground">
                    Update your payment method in the billing portal to avoid losing access.
                </p>
            </div>
            <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-primary/30"
                onClick={onClick}
                disabled={disabled || loading}
            >
                <span className="inline-flex items-center gap-2">
                    {loading ? <Loader2 className="animate-spin shrink-0 size-4" aria-hidden /> : null}
                    {label}
                </span>
            </Button>
        </div>
    );
}
