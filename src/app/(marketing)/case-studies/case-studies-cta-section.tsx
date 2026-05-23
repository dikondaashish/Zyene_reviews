import Link from "next/link";
import { ArrowRight, Building2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CASE_STUDIES } from "@/lib/phase5/case-study-data";
import { CustomerLogoBar } from "@/components/marketing/social-proof";
import { SIGNUP_URL } from "@/config/env";

export function CaseStudiesCtaSection() {
    return (
        <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <TrendingUp className="text-primary mx-auto mb-4 size-10" />
                    <h2 className="text-3xl font-bold text-foreground mb-3">Want results like these?</h2>
                    <p className="text-muted-foreground mb-8">
                        Start your 7-day free trial ,  no annual contract. Same tools these businesses used.
                    </p>
                    <Link href={SIGNUP_URL}>
                        <Button size="lg" className="px-10 py-6 font-semibold rounded-xl">
                            Start Your Free Trial <ArrowRight className="ml-2 size-5" />
                        </Button>
                    </Link>
                </div>
            </section>
    );
}
