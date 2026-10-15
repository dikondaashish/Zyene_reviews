"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { usePrivacy } from "@/lib/privacy/privacy-store";

/**
 * Click-to-load for third-party embeds that set their own cookies (functional
 * category). Loads straight away when functional is granted; otherwise the
 * visitor can load it for this view, which is their explicit request, without
 * changing their saved choice.
 */
export function FunctionalEmbedGate({
    provider,
    actionLabel,
    children,
    fallback,
}: {
    provider: string;
    actionLabel: string;
    children: ReactNode;
    fallback?: ReactNode;
}) {
    const { granted } = usePrivacy();
    const [requested, setRequested] = useState(false);

    if (granted.functional || requested) return <>{children}</>;

    return (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-6 text-center">
            <p className="max-w-sm text-sm text-muted-foreground">
                This is provided by {provider}, which sets its own cookies. It stays off until you choose to load it.
            </p>
            <Button onClick={() => setRequested(true)}>{actionLabel}</Button>
            {fallback}
        </div>
    );
}
