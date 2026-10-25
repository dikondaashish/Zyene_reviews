"use client";

interface Step4SubscriptionFormFooterProps {
    busy: boolean;
    onSkip: () => void;
}

export function Step4SubscriptionFormFooter({ busy, onSkip }: Step4SubscriptionFormFooterProps) {
    return (
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-muted-foreground">
                Without a plan you get view-only access. AI replies, review requests and smart insights come with any paid plan.
                Change or upgrade any time in Settings → Billing.
            </p>
            <button
                type="button"
                onClick={onSkip}
                disabled={busy}
                className="shrink-0 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50 sm:text-right"
            >
                Explore free for now
            </button>
        </div>
    );
}
