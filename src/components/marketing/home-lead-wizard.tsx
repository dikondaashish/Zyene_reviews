"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { BookOpen } from "lucide-react";
import { useHomeLeadWizardTiming } from "@/components/marketing/use-home-lead-wizard-timing";

const GuideDialog = dynamic(() => import("@/components/marketing/home-lead-wizard-dialog").then((module) => module.HomeLeadWizardDialog), { ssr: false });

export function HomeLeadWizard() {
    const [open, setOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const cancelDelayedOpen = useHomeLeadWizardTiming(setOpen);

    return (
        <>
            <section className="home-guide-offer" aria-labelledby="home-guide-heading">
                <div>
                    <p className="text-sm font-medium text-primary">The local business guide</p>
                    <h2 id="home-guide-heading" className="mt-2 text-2xl font-semibold tracking-tight">
                        A stronger reputation starts with a simple routine.
                    </h2>
                    <p className="mt-3 max-w-xl text-muted-foreground">
                        Practical steps to collect useful feedback, reply with care, and make every customer feel heard.
                    </p>
                </div>
                <button type="button" ref={triggerRef} aria-haspopup="dialog" aria-expanded={open} onClick={() => { cancelDelayedOpen(); setOpen(true); }} className="marketing-button shrink-0" data-track="guide" data-track-location="home">
                    <BookOpen className="size-4" aria-hidden="true" /> Get the free guide
                </button>
            </section>
            {(open || hasOpened) && <GuideDialog open={open}
                onOpenChange={(nextOpen) => { setHasOpened(true); setOpen(nextOpen); }}
                onCloseFocus={() => triggerRef.current?.focus()} />}
        </>
    );
}
