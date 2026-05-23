"use client";

interface Step4SubscriptionFormFooterProps {
    busy: boolean;
    onSkip: () => void;
}

export function Step4SubscriptionFormFooter({ busy, onSkip }: Step4SubscriptionFormFooterProps) {
    return (
        <div className="flex flex-col items-center gap-2">
            <button
                type="button"
                onClick={onSkip}
                disabled={busy}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
                Explore free for now ,  upgrade anytime from Settings
            </button>
            <p className="text-[11px] text-muted-foreground/50 max-w-xs text-center leading-relaxed">
                Without a plan: view-only access. AI replies, review requests, and smart insights unlock on any paid
                plan.
            </p>
        </div>
    );
}
