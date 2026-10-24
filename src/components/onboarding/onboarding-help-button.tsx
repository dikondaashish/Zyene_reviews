"use client";

import { useState } from "react";
import { BookOpen, LifeBuoy, Mail, MessageCircleQuestion, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useOnboardingStore } from "@/lib/state/onboarding-store";
import { HELP_CENTER_URL, SUPPORT_EMAIL, onboardingHelpFor } from "@/lib/onboarding/onboarding-help";
import { OnboardingAssistantPanel } from "./onboarding-assistant-panel";

const linkClass = "flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted";

/** In the top bar on every setup screen: help for the current step, the help centre, or a person. */
export function OnboardingHelpButton() {
    const currentStep = useOnboardingStore((s) => s.currentStep);
    const help = onboardingHelpFor(currentStep);
    const [menuOpen, setMenuOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    return (
        <>
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <MessageCircleQuestion className="size-4 text-primary" aria-hidden />
                    <span className="max-sm:sr-only">Get help</span>
                </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" sideOffset={8} className="w-72 p-2">
                <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">Stuck on {help.stepName}?</p>
                <button type="button" onClick={() => { setMenuOpen(false); setChatOpen(true); }} className={`${linkClass} w-full bg-primary/5`}>
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span className="min-w-0">
                        <span className="block text-sm font-medium text-foreground">Ask Zyene AI</span>
                        <span className="block text-xs text-muted-foreground">Instant answers, any time</span>
                    </span>
                </button>
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
        <OnboardingAssistantPanel open={chatOpen} onOpenChange={setChatOpen} step={currentStep} />
        </>
    );
}
