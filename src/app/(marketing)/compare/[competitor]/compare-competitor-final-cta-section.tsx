import type { CompetitorData } from "@/lib/phase3/competitor-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X, ChevronRight, Sparkles, ShieldCheck } from "lucide-react";

export function CompareCompetitorFinalCtaSection({ data }: { data: CompetitorData }) {
    return (
        <section className="py-24 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        Try Zyene free for 7 days
                    </h2>
                    <p className="text-xl text-muted-foreground mb-10">
                        No annual contract. No credit card lock-in.<br />
                        Cancel before day 7 — pay nothing.
                    </p>
                    <Link href="/signup">
                        <Button size="lg" className="px-12 py-7 text-[1.05rem] font-semibold rounded-xl">
                            Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <p className="mt-5 text-sm text-muted-foreground">
                        Already using {data.name}?{" "}
                        <a href="mailto:hello@zyenereviews.com?subject=Switching%20from%20{data.name}" className="underline hover:text-foreground">
                            Talk to us about migration →
                        </a>
                    </p>
                </div>
            </section>
    );
}
