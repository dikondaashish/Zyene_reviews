import type { Metadata } from "next";
import Link from "next/link";
import {
    ENTERPRISE_COMPARISON_ROWS,
    ENTERPRISE_SLA_BULLETS,
    ENTERPRISE_VALUE_PROPS,
    ENTERPRISE_SALES_EMAIL,
} from "@/lib/enterprise/enterprise-data";

export function EnterpriseSection2Section() {
    return (
        <section className="py-20 px-4 bg-muted border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold mb-10">Built for scale</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ENTERPRISE_VALUE_PROPS.map((item) => (
                            <article key={item.title} className="bg-card border border-border rounded-xl p-6">
                                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
    );
}
