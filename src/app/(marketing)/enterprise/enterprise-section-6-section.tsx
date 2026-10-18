import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EnterpriseSection6Section() {
    return (
        <section className="py-16 px-4 bg-primary/5 border-t border-border">
            <div className="container mx-auto max-w-3xl text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to talk?</h2>
                <p className="text-muted-foreground mb-6">
                    Tell us about your locations and team, and we will walk you through a rollout that fits.
                </p>
                <Button size="lg" asChild>
                    <Link href="/demo" data-track="demo" data-track-location="enterprise-final">Book a demo</Link>
                </Button>
            </div>
        </section>
    );
}
