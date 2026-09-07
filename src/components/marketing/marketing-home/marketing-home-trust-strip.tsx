import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function MarketingHomeTrustStrip() {
    return (
        <section className="w-full py-12" aria-label="Supported review platforms"><div className="marketing-container flex flex-col items-center justify-between gap-8 border-b border-border pb-12 md:flex-row"><p className="max-w-56 text-center text-sm text-muted-foreground md:text-left">All the places they talk about you.<br />All together.</p><div className="flex items-center gap-10 text-2xl font-semibold tracking-tight"><span>Google</span><span>Facebook</span><span>Yelp</span></div><Link href="/integrations" className="inline-flex items-center gap-3 text-sm font-medium">Explore integrations<ArrowUpRight size={16} aria-hidden="true" /></Link></div></section>
    );
}
