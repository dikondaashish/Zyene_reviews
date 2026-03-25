"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Zap, AlertTriangle } from "lucide-react";
import { formatDistanceToNow, isPast, parseISO } from "date-fns";
import { useRouter } from "next/navigation";

export function TrialBanner({ organization }: { organization: any }) {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);

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
                ? "bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30" 
                : "bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30"}
        `}>
            <div className="flex items-center gap-3">
                <div className={`
                    p-1.5 rounded-lg
                    ${expired 
                        ? "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400" 
                        : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"}
                `}>
                    {expired ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </div>
                <div className="text-sm font-medium">
                    {expired ? (
                        <span className="text-red-900 dark:text-red-300">
                            Your trial has <span className="font-bold">expired</span>. Upgrade now to continue using premium features.
                        </span>
                    ) : (
                        <span className="text-indigo-900 dark:text-indigo-300">
                            You have <span className="font-bold text-indigo-700 dark:text-indigo-200">{timeLeft}</span> left on your trial.
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button 
                    size="sm" 
                    onClick={() => router.push("/settings/billing")}
                    className={expired 
                        ? "bg-red-600 hover:bg-red-700 text-white border-none shadow-sm h-8 px-4" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm h-8 px-4"
                    }
                >
                    <Zap className="mr-2 h-3.5 w-3.5 fill-current" />
                    Upgrade Now
                </Button>
            </div>
        </div>
    );
}
