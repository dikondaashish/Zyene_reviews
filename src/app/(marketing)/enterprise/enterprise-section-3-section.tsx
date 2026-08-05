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
import {
    ENTERPRISE_COMPARISON_ROWS,
    ENTERPRISE_SLA_BULLETS,
    ENTERPRISE_VALUE_PROPS,
    ENTERPRISE_SALES_EMAIL,
} from "@/lib/enterprise/enterprise-data";

export function EnterpriseSection3Section() {
    return (
        <section className="py-20 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="text-primary size-8" />
                        <h2 className="text-3xl font-bold">SLA &amp; support</h2>
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-3">
                        {ENTERPRISE_SLA_BULLETS.map((b) => (
                            <li key={b} className="flex gap-2 text-sm text-muted-foreground">
                                <Check className="text-primary shrink-0 mt-0.5 size-4" />
                                {b}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
    );
}
