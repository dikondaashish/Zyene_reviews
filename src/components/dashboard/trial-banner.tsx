"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Zap, AlertTriangle } from "lucide-react";
import { formatDistanceToNow, isPast, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import type { TrialOrganizationSummary } from "@/types/components";

export function TrialBanner({ organization }: { organization: TrialOrganizationSummary | null }) {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!organization || organization.plan !== "free" || !organization.trial_ends_at) {
        return null;
    }

    const trialEndsAt = parseISO(organization.trial_ends_at);
    const expired = isPast(trialEndsAt);
    const timeLeft = formatDistanceToNow(trialEndsAt);

    if (!isVisible) return null;

    return (
        <div className={`
            w-full border-b px-4 py-2.5 flex items-center justify-between gap-4
            ${expired 
                ? "bg-destructive/10 border-destructive/20" 
                : "bg-primary/10 border-primary/20"}
        `}>
            <div className="flex items-center gap-3">
                <div className={`
                    p-1.5 rounded-lg
                    ${expired 
                        ? "bg-destructive/15 text-destructive" 
                        : "bg-primary/15 text-primary"}
                `}>
                    {expired ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </div>
                <div className="text-sm font-medium">
                    {expired ? (
                        <span className="text-foreground">
                            Your trial has <span className="font-bold text-destructive">expired</span>. Upgrade now to continue using premium features.
                        </span>
                    ) : (
                        <span className="text-foreground">
                            You have <span className="font-bold text-primary">{!mounted ? "..." : timeLeft}</span> left on your trial.
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button 
                    size="sm" 
                    onClick={() => router.push("/settings/billing")}
                    className={expired 
                        ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground border-none h-8 px-4"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border h-8 px-4"
                    }
                >
                    <Zap className="mr-2 h-3.5 w-3.5 fill-current" />
                    Upgrade Now
                </Button>
            </div>
        </div>
    );
}
