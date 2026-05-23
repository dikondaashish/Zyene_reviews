"use client";

import { cn } from "@/lib/utils";

export function BillingPlanPickerBackdrop() {
    return (
        <>
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
                style={{
                    backgroundImage: "radial-gradient(rgba(0,0,0,0.06) 0.8px, transparent 0.8px)",
                    backgroundSize: "14px 14px",
                    maskImage:
                        "radial-gradient(ellipse at 50% 10%, rgba(0,0,0,1), rgba(0,0,0,0.25) 45%, rgba(0,0,0,0) 72%)",
                }}
            />
            <div
                aria-hidden
                className={cn(
                    "pointer-events-none absolute -top-1/2 left-1/2 -translate-x-1/2 rounded-full size-[min(120vmin,720px)]",
                    "bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.12),transparent_55%)] blur-[32px]"
                )}
            />
        </>
    );
}
