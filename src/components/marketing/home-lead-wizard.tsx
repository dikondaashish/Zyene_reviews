"use client";

import { BookOpen } from "lucide-react";
import { openLeadWizard } from "@/lib/marketing/lead-wizard-bus";

/** Homepage band that opens the layout-mounted lead wizard on demand. */
export function HomeLeadWizard() {
    return (
        <section className="home-guide-offer" aria-labelledby="home-guide-heading">
            <div>
                <p className="text-sm font-medium text-muted-foreground">The local business guide</p>
                <h2 id="home-guide-heading" className="mt-2 text-2xl font-semibold tracking-tight">
                    A stronger reputation starts with a simple routine.
                </h2>
                <p className="mt-3 max-w-xl text-muted-foreground">
                    Practical steps to collect useful feedback, reply with care, and make every customer feel heard.
                </p>
            </div>
            <button
                type="button"
                aria-haspopup="dialog"
                onClick={openLeadWizard}
                className="marketing-button marketing-button-secondary shrink-0"
                data-track="guide"
                data-track-location="home"
            >
                <BookOpen className="size-4" aria-hidden="true" /> Get the free guide
            </button>
        </section>
    );
}
