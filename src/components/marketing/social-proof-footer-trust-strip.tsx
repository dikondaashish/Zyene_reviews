import Link from "next/link";
import { Building2, ShieldCheck, Star } from "lucide-react";
import { getPlatformStats } from "@/lib/social-proof/social-proof-data";

export function FooterTrustStrip() {
    const stats = getPlatformStats();
    return (
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
                <Star className="fill-primary text-primary size-3.5" />
                {stats.starRating}/5 average rating
            </span>
            <Link href="/security" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                <ShieldCheck className="size-3.5" />
                Security
            </Link>
            <Link href="/case-studies" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                <Building2 className="size-3.5" />
                Case studies
            </Link>
        </div>
    );
}
