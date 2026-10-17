import Link from "next/link";
import { SMALL_BUSINESS_FEATURES } from "@/lib/marketing/small-business-content";

export function SmallBusinessFeaturesSection() {
    return (
        <section className="py-20 px-4 bg-muted border-b border-border">
            <div className="container mx-auto max-w-5xl">
                <h2 className="text-[length:var(--fs-h2)] font-semibold mb-4">Everything a small business needs to manage reviews</h2>
                <p className="text-muted-foreground mb-10 max-w-2xl">
                    One plan covers monitoring, replies and review requests for a single location, without add-ons or a sales call.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    {SMALL_BUSINESS_FEATURES.map((feature) => (
                        <article key={feature.title} className="bg-card border border-border rounded-xl p-6 flex flex-col">
                            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed flex-1">{feature.description}</p>
                            <Link href={feature.href} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline underline-offset-4">
                                {feature.linkLabel} →
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
