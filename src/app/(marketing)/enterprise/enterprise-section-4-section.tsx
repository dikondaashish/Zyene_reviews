import type { Metadata } from "next";
import Link from "next/link";
import {
    ENTERPRISE_COMPARISON_ROWS,
    ENTERPRISE_SLA_BULLETS,
    ENTERPRISE_VALUE_PROPS,
    ENTERPRISE_SALES_EMAIL,
} from "@/lib/phase8/enterprise-data";

export function EnterpriseSection4Section() {
    return (
        <section className="py-20 px-4 bg-muted border-b border-border">
                <div className="container mx-auto max-w-5xl overflow-x-auto">
                    <h2 className="text-3xl font-bold mb-8">Plan comparison</h2>
                    <table className="w-full text-sm border border-border rounded-xl overflow-hidden bg-card">
                        <thead>
                            <tr className="bg-muted/80 border-b border-border">
                                <th className="text-left p-4 font-semibold">Feature</th>
                                <th className="p-4 font-semibold">Starter</th>
                                <th className="p-4 font-semibold">Professional</th>
                                <th className="p-4 font-semibold text-primary">Enterprise</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ENTERPRISE_COMPARISON_ROWS.map((row) => (
                                <tr key={row.feature} className="border-b border-border last:border-0">
                                    <td className="p-4 font-medium">{row.feature}</td>
                                    <td className="p-4 text-muted-foreground">{row.starter}</td>
                                    <td className="p-4 text-muted-foreground">{row.professional}</td>
                                    <td className="p-4 text-foreground font-medium">{row.enterprise}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
    );
}
