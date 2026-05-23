import Link from "next/link";
import { Users, Building2, Code2, UserCog } from "lucide-react";
import { PRODUCT_PILLARS } from "@/lib/growth/product-foundation";

const PLATFORM_PILLAR_ICONS = [Users, Building2, Code2, UserCog] as const;

/** Blueprint §1.1 pillars 7–10 ,  surfaced on /features (deep pages are §4.2 six pillars). */
const PLATFORM_PILLAR_NUMBERS = [7, 8, 9, 10] as const;

export function PlatformPillarsSection() {
    const pillars = PRODUCT_PILLARS.filter((p) =>
        (PLATFORM_PILLAR_NUMBERS as readonly number[]).includes(p.number)
    );

    return (
        <section className="py-20 px-4 bg-muted/40 border-y border-border">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight mb-3">
                        Built for teams, locations, and integrations
                    </h2>
                    <p className="text-muted-foreground">
                        All ten product pillars from our foundation ,  six deep-dives above, plus CRM,
                        multi-location, API, and collaboration on every paid plan.
                    </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                    {pillars.map((pillar, i) => {
                        const Icon = PLATFORM_PILLAR_ICONS[i] ?? Users;
                        const href =
                            pillar.number === 9
                                ? "/integrations"
                                : pillar.number === 8
                                  ? "/pricing"
                                  : "/features";
                        return (
                            <Link
                                key={pillar.number}
                                href={href}
                                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                                        <Icon className="size-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                                            Pillar {pillar.number}
                                        </p>
                                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                            {pillar.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                            {pillar.value}
                                        </p>
                                        <p className="text-xs text-primary/80 mt-3 font-medium">
                                            {pillar.whyTheyPay}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
