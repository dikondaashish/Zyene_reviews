import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SIGNUP_URL } from "@/config/env";

export function IntegrationsCtaSection() {
    return (
        <section className="py-24 px-4 bg-background border-t border-border">
            <div className="container mx-auto max-w-3xl text-center">
                <h2 className="text-4xl font-bold text-foreground mb-4">Start with the workflow you already use</h2>
                <p className="text-xl text-muted-foreground mb-10">
                    Sync Google, Facebook, or Yelp reviews in one workspace. When a sale, booking, or job is complete, use the REST API or a generic inbound webhook to start a review request.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button size="lg" className="px-10 py-7 text-[1.05rem] font-semibold rounded-xl" asChild>
                        <Link href={SIGNUP_URL}>
                            Start Free Trial <ArrowRight className="ml-2 size-5" />
                        </Link>
                    </Button>
                    <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Compare plans →
                    </Link>
                </div>
            </div>
        </section>
    );
}
