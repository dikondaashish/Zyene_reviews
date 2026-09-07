import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function MarketingHomeTrustStrip() {
    return (
        <section aria-label="Supported review platforms" className="w-full border-y border-border bg-muted/60 py-7">
            <div className="marketing-container flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
                <p className="max-w-52 text-sm text-muted-foreground">One workspace for the places your customers find you.</p>
                <div className="flex flex-wrap items-center gap-x-9 gap-y-3 text-xl font-semibold tracking-tight">
                    <span>Google</span><span>Facebook</span><span>Yelp</span>
                </div>
                <Link href="/integrations" className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary">Explore integrations <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
            </div>
        </section>
    );
}
