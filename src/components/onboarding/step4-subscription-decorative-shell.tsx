"use client";

import type { ReactNode } from "react";

export function Step4SubscriptionDecorativeShell({ children }: { children: ReactNode }) {
    return (
        <div className="rounded-3xl border border-border/60 bg-muted/20 p-6 md:p-8">
            {children}
        </div>
    );
}
