import Link from "next/link";
import { ArrowRight, Building2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CASE_STUDIES } from "@/lib/phase5/case-study-data";
import { CustomerLogoBar } from "@/components/marketing/social-proof";
import { SIGNUP_URL } from "@/config/env";

export function CaseStudiesHeroSection() {
    return (
        <section className="pt-24 pb-12 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-4">
                        <Building2 className="h-3 w-3" /> Case Studies
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        Results local businesses achieve with Zyene
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Representative outcomes from restaurants, dental practices, home services, salons, and auto repair —
                        built from typical customer journeys. Permissioned customer stories will replace these as they become available.
                    </p>
                </div>
            </section>
    );
}
