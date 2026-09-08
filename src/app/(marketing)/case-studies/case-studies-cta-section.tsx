import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

import { SIGNUP_URL } from "@/config/env";

export function CaseStudiesCtaSection() {
    return (
        <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <TrendingUp className="text-primary mx-auto mb-4 size-10" />
                    <h2 className="text-3xl font-bold text-foreground mb-3">Ready to build your own review routine?</h2>
                    <p className="text-muted-foreground mb-8">
                        Start a 7-day free trial to explore requests, AI-assisted replies, and local review insights. No annual contract.
                    </p>
                    <Button size="lg" className="px-10 py-6 font-semibold rounded-xl" asChild>
                        <Link href={SIGNUP_URL}>
                            Start Your Free Trial <ArrowRight className="ml-2 size-5" />
                        </Link>
                    </Button>
                </div>
            </section>
    );
}
