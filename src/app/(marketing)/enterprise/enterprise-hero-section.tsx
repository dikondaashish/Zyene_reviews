import { enterpriseSalesGmailComposeUrl } from "@/lib/enterprise-sales-contact";
import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight,
    Building2,
    Check,
    Shield,
    Users,
    Sparkles,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    ENTERPRISE_COMPARISON_ROWS,
    ENTERPRISE_SLA_BULLETS,
    ENTERPRISE_VALUE_PROPS,
    ENTERPRISE_SALES_EMAIL,
} from "@/lib/phase8/enterprise-data";
import { DEFAULT_CAL_COM_BOOKING_URL } from "@/lib/phase8/cal-com-embed";

export function EnterpriseHeroSection() {
    return (
        <section className="pt-24 pb-16 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-4">
                        <Building2 className="size-3" /> Enterprise
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Review operations at enterprise scale
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
                        Custom pricing for franchises, multi-location brands, and high-volume operators ,  without
                        Birdeye-style contracts or per-location surprise fees.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/demo">
                            <Button size="lg" className="rounded-xl px-8">
                                Book a demo <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </Link>
                        <a href={DEFAULT_CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline" className="rounded-xl px-8">
                                Cal.com ,  30 min
                            </Button>
                        </a>
                        <a href={enterpriseSalesGmailComposeUrl()} target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline" className="rounded-xl px-8">
                                Contact sales
                            </Button>
                        </a>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                        Inbound leads: <a href={`mailto:${ENTERPRISE_SALES_EMAIL}`} className="text-primary hover:underline">{ENTERPRISE_SALES_EMAIL}</a>
                    </p>
                </div>
            </section>
    );
}
