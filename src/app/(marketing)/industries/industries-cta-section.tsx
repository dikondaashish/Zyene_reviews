
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SIGNUP_URL } from "@/config/env";

export function IndustriesCtaSection() {
    return (
        <section className="py-24 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <div className="flex justify-center gap-1 mb-5">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="fill-chart-4 text-chart-4 size-7" />
                        ))}
                    </div>
                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        Turn customer moments into a stronger reputation.
                    </h2>
                    <p className="text-xl text-muted-foreground mb-10">
                        Start a 7-day free trial to send review requests, respond with AI assistance, follow up on private feedback, and learn from the trends.<br />
                        Plans start at $29.99/month. Cancel anytime.
                    </p>
                    <Button size="lg" className="px-12 py-7 text-[1.05rem] font-semibold rounded-xl" asChild>
                        <Link href={SIGNUP_URL}>
                            Start your 7-day free trial <ArrowRight className="ml-2 size-5" />
                        </Link>
                    </Button>
                </div>
            </section>
    );
}
