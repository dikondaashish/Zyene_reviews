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
import {
    AGENCY_DASHBOARD_ROADMAP,
    AGENCY_PRICING_TIERS,
    WHITE_LABEL_FEATURES,
} from "@/lib/phase8/agency-pricing-data";

export function AgenciesSection2Section() {
    return (
        <section className="py-20 px-4 bg-muted border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center gap-3 mb-8">
                        <Palette className="text-primary size-8" />
                        <h2 className="text-3xl font-bold">White-label branding</h2>
                    </div>
                    <p className="text-muted-foreground mb-8 max-w-2xl">
                        We already support <strong>hide_branding</strong> on review collection flows, market it to
                        clients as your proprietary reputation stack. Enterprise client accounts unlock full white-label
                        widgets without the “Powered by Zyene” footer.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {WHITE_LABEL_FEATURES.map((f) => (
                            <article key={f.title} className="bg-card border border-border rounded-xl p-6">
                                <h3 className="font-semibold mb-2">{f.title}</h3>
                                <p className="text-sm text-muted-foreground">{f.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
    );
}
