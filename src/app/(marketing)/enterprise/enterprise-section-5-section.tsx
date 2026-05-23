import { getEnterprisePlan } from "@/services/stripe/plans";
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

export function EnterpriseSection5Section({ enterprisePlan }: { enterprisePlan: NonNullable<ReturnType<typeof getEnterprisePlan>> }) {
    return (
        <section className="py-20 px-4 bg-background">
                <div className="container mx-auto max-w-5xl grid lg:grid-cols-2 gap-10 items-start">
                    <div>
                        <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                            <Users className="text-primary size-8" />
                            What&apos;s included
                        </h2>
                        <ul className="space-y-3">
                            {enterprisePlan.features.map((f) => (
                                <li key={f} className="flex gap-2 text-sm">
                                    <Check className="text-primary shrink-0 size-4" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-8">
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <FileText className="text-primary size-5" />
                            Sales deck
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Product overview, case studies, pricing framework, and security summary for your
                            procurement team — maintained in{" "}
                            <code className="text-xs bg-muted px-1 rounded">docs/ENTERPRISE_SALES_DECK.md</code>.
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                            Request the latest PDF/Notion export from sales when you book a demo.
                        </p>
                        <Link href="/demo">
                            <Button className="w-full gap-2">
                                <Sparkles className="size-4" /> Request demo + sales deck
                            </Button>
                        </Link>
                        <Link href="/security" className="block mt-4 text-sm text-primary hover:underline text-center">
                            Security &amp; trust center →
                        </Link>
                    </div>
                </div>
            </section>
    );
}
