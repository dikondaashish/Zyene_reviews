import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PlatformPillarsSection } from "@/components/marketing/platform-pillars-section";
import { PILLARS } from "@/app/(marketing)/features/features-data";

export function FeaturesFeaturePillarsSection() {
    return (
        <>
            <section className="marketing-section">
                <div className="marketing-container">
                    <div className="marketing-section-heading"><h2>Everything has its place.<br />And a purpose.</h2><p>Explore the tools that help you collect, understand, and act on customer feedback.</p></div>
                    <div className="grid grid-cols-1 gap-x-16 md:grid-cols-2">
                        {PILLARS.map(pillar => (
                            <article key={pillar.id} id={pillar.id} className="border-t border-border py-8">
                                <h3 className="mb-3 text-2xl font-semibold">{pillar.title}</h3>
                                <p className="mb-5 text-muted-foreground">{pillar.tagline}</p>
                                <ul className="mb-6 space-y-3 text-sm text-muted-foreground">{pillar.bullets.map(bullet => <li key={bullet} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />{bullet}</li>)}</ul>
                                <Link href={`/features/${pillar.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Explore {pillar.title.toLowerCase()}<ArrowRight className="size-4" aria-hidden="true" /></Link>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
            <PlatformPillarsSection />
        </>
    );
}
