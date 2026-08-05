import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight,
    Handshake,
    Palette,
    LayoutDashboard,
    Check,
    Mail,
} from "lucide-react";
import { AgencyWaitlistForm } from "@/components/marketing/agency-waitlist-form";
import {
    AGENCY_DASHBOARD_ROADMAP,
    AGENCY_PRICING_TIERS,
    WHITE_LABEL_FEATURES,
} from "@/lib/enterprise/agency-pricing-data";

export function AgenciesSection4Section() {
    return (
        <section className="py-20 px-4 bg-muted border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center gap-3 mb-4">
                        <LayoutDashboard className="text-primary size-8" />
                        <h2 className="text-3xl font-bold">{AGENCY_DASHBOARD_ROADMAP.title}</h2>
                        <span className="text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {AGENCY_DASHBOARD_ROADMAP.status}
                        </span>
                    </div>
                    <p className="text-muted-foreground max-w-2xl mb-8">{AGENCY_DASHBOARD_ROADMAP.description}</p>
                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                        <p className="text-sm font-medium mb-4">Join the beta waitlist</p>
                        <AgencyWaitlistForm />
                    </div>
                </div>
            </section>
    );
}
