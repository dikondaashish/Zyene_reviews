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
import { Button } from "@/components/ui/button";
import { PARTNER_CONTACT_EMAIL } from "@/lib/phase6/partnerships-data";

export function AgenciesHeroSection() {
    return (
        <section className="pt-24 pb-16 px-4 border-b border-border bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-4">
                        <Handshake className="size-3" /> Agencies
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Manage client reputations under your brand
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
                        Zyene Reviews gives agencies an affordable alternative to Birdeye—with white-label widgets,
                        bulk pricing, and referral revenue on every client you bring.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a href={`mailto:${PARTNER_CONTACT_EMAIL}?subject=Agency%20partner%20application`}>
                            <Button size="lg" className="rounded-xl px-8">
                                Apply as agency partner <Mail className="ml-2 size-4" />
                            </Button>
                        </a>
                        <Link href="/partners">
                            <Button size="lg" variant="outline" className="rounded-xl px-8">
                                All partnerships <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
    );
}
