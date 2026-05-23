import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    ENTERPRISE_COMPARISON_ROWS,
    ENTERPRISE_SLA_BULLETS,
    ENTERPRISE_VALUE_PROPS,
    ENTERPRISE_SALES_EMAIL,
} from "@/lib/phase8/enterprise-data";

export function EnterpriseSection6Section() {
    return (
        <section className="py-16 px-4 bg-primary/5 border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl font-bold mb-4">Ready to talk?</h2>
                    <p className="text-muted-foreground mb-6">
                        Our sales team handles inbound from this page, <Link href="/demo" className="text-primary underline">/demo</Link>, and{" "}
                        {ENTERPRISE_SALES_EMAIL}.
                    </p>
                    <Link href="/demo">
                        <Button size="lg">Schedule a demo</Button>
                    </Link>
                </div>
            </section>
    );
}
