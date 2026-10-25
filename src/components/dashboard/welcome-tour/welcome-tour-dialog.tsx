"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { completeTour } from "@/app/actions/tour";
import { fireOnboardingConfetti } from "@/components/onboarding/step5-form-confetti";
import { cn } from "@/lib/utils";
import { BusinessLogo } from "@/components/competitors/business-logo";
import { buildWelcomeSlides } from "./welcome-tour-slides";
import type { WelcomeTourData } from "./welcome-tour-types";

/**
 * Shown once, on the first dashboard visit after onboarding (`?welcome=1`). It replaces the
 * product tour starting by itself: the last slide offers that tour, or goes straight to work.
 */
export function WelcomeTourDialog({ data }: { data: WelcomeTourData }) {
    const router = useRouter();
    const [open, setOpen] = useState(true);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        void fireOnboardingConfetti();
    }, []);

    const finish = async (next: string, runTour = false) => {
        setOpen(false);
        if (!runTour) await completeTour().catch(() => null);
        router.replace(next);
    };

    const slides = buildWelcomeSlides(data, {
        importCustomers: () => void finish("/customers?import=1"),
        replyRules: () => void finish("/settings/reply-rules"),
        publicProfile: () => void finish("/settings/public-profile"),
    });
    const slide = slides[index];
    const last = index === slides.length - 1;
    const Icon = slide.icon;

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!next) void finish("/dashboard"); }}>
            <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
                <div className="relative h-44 bg-muted">
                    <Image key={slide.image} src={slide.image} alt="" fill priority sizes="448px" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden />
                    <div className="absolute inset-x-5 bottom-4 flex items-end gap-3">
                        {index === 0 ? (
                            <>
                                <span className="rounded-lg bg-card p-1 shadow-sm"><BusinessLogo name={data.businessName} website={data.website} className="size-11" /></span>
                                <span className="min-w-0 pb-0.5 font-display text-lg font-semibold leading-tight text-white drop-shadow-sm">{data.businessName}</span>
                            </>
                        ) : (
                            <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                                <Icon className="size-5" aria-hidden />
                            </span>
                        )}
                    </div>
                </div>
                <div className="space-y-4 px-6 pb-6 pt-5">
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                            {index + 1} of {slides.length}
                        </p>
                        <DialogTitle className="ui-section-title">{slide.title}</DialogTitle>
                        <DialogDescription className="sr-only">Welcome to Zyene, slide {index + 1} of {slides.length}</DialogDescription>
                        {slide.body}
                    </div>
                    <div className="flex items-center justify-center gap-1.5" aria-hidden>
                        {slides.map((s, i) => (
                            <span key={s.title} className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-primary" : "w-1.5 bg-border")} />
                        ))}
                    </div>
                    {last ? (
                        <div className="grid gap-2">
                            <Button type="button" onClick={() => void finish("/dashboard?tour=true", true)}>Show me around (1 minute)</Button>
                            <Button type="button" variant="outline" onClick={() => void finish("/dashboard")}>Go to my dashboard</Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-2">
                            {index > 0 ? (
                                <Button type="button" variant="ghost" size="sm" onClick={() => setIndex(index - 1)}>
                                    <ArrowLeft aria-hidden />Back
                                </Button>
                            ) : (
                                <Button type="button" variant="ghost" size="sm" onClick={() => void finish("/dashboard")}>Skip</Button>
                            )}
                            <Button type="button" onClick={() => setIndex(index + 1)}>
                                Next<ArrowRight aria-hidden />
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
