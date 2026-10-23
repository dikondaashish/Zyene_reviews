"use client";

import { createContext, useCallback, useContext, useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setActiveBusiness } from "@/lib/auth/business-context";

/** Tabs of the same browser share the active-business cookie, so they hear about switches here. */
export const ACTIVE_BUSINESS_CHANNEL = "zyene-active-business";

type ContextSwitch = {
    /** Name of the business or organization being opened, while the switch is under way. */
    pendingName: string | null;
    switchTo: (businessId: string, name: string, errorMessage?: string) => void;
};

const ContextSwitchContext = createContext<ContextSwitch | null>(null);

export function useContextSwitch(): ContextSwitch {
    const value = useContext(ContextSwitchContext);
    if (!value) throw new Error("useContextSwitch must be used inside ContextSwitchProvider");
    return value;
}

/**
 * One place that switches the active business for the header switchers. The server action
 * re-renders the current page itself (revalidatePath), so no extra router.refresh() round
 * trip is needed; while it runs the page shows who is loading instead of looking frozen.
 */
export function ContextSwitchProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [target, setTarget] = useState<string | null>(null);

    // Another tab switched business: this tab now reads the new cookie, so show that business
    // here too instead of leaving the old one on screen where actions would hit the new one.
    useEffect(() => {
        if (typeof BroadcastChannel === "undefined") return;
        const channel = new BroadcastChannel(ACTIVE_BUSINESS_CHANNEL);
        channel.onmessage = () => router.refresh();
        return () => channel.close();
    }, [router]);

    const switchTo = useCallback((businessId: string, name: string, errorMessage = "Could not switch business. Please try again.") => {
        if (pending) return;
        setTarget(name);
        startTransition(async () => {
            try {
                await setActiveBusiness(businessId);
                if (typeof BroadcastChannel !== "undefined") {
                    const channel = new BroadcastChannel(ACTIVE_BUSINESS_CHANNEL);
                    channel.postMessage({ businessId });
                    channel.close();
                }
            } catch {
                toast.error(errorMessage);
            }
        });
    }, [pending]);

    return (
        <ContextSwitchContext.Provider value={{ pendingName: pending ? target : null, switchTo }}>
            {children}
        </ContextSwitchContext.Provider>
    );
}

/** Laid over the page while a switch loads: the old business's numbers fade and stop taking clicks. */
export function ContextSwitchStatus() {
    const { pendingName } = useContextSwitch();
    if (!pendingName) return null;
    return (
        <div data-context-switch-overlay className="absolute inset-0 z-20 cursor-progress bg-canvas/60">
            <div className="sticky top-20 flex justify-center pt-6">
                <p role="status" className="inline-flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-md">
                    <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-hidden="true" />
                    <span className="truncate">Loading {pendingName}…</span>
                </p>
            </div>
        </div>
    );
}
