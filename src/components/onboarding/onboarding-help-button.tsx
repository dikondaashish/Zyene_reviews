"use client";

import { BookOpen, LifeBuoy, Mail, MessageCircleQuestion } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useOnboardingStore } from "@/lib/state/onboarding-store";
import { HELP_CENTER_URL, SUPPORT_EMAIL, onboardingHelpFor } from "@/lib/onboarding/onboarding-help";

const linkClass = "flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted";

/** Always in reach during setup: help for the current step, the help centre, or a person. */
export function OnboardingHelpButton() {
    const currentStep = useOnboardingStore((s) => s.currentStep);
    const help = onboardingHelpFor(currentStep);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="fixed bottom-4 left-4 z-40 inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:bottom-6 sm:left-6"
                >
                    <MessageCircleQuestion className="size-4 text-primary" aria-hidden />
                    Get help
                </button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" sideOffset={8} className="w-72 p-2">
                <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">Stuck on {help.stepName}?</p>
                <a href={help.articleUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <BookOpen className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span className="min-w-0">
                        <span className="block text-sm font-medium text-foreground">{help.articleTitle}</span>
                        <span className="block text-xs text-muted-foreground">Step-by-step guide (opens in a new tab)</span>
                    </span>
                </a>
                <a href={help.emailUrl} className={linkClass}>
                    <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span className="min-w-0">
                        <span className="block text-sm font-medium text-foreground">Email a person</span>
                        <span className="block truncate text-xs text-muted-foreground">{SUPPORT_EMAIL}</span>
                    </span>
                </a>
                <a href={HELP_CENTER_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <LifeBuoy className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span className="block text-sm font-medium text-foreground">Browse the help centre</span>
                </a>
            </PopoverContent>
        </Popover>
    );
}
