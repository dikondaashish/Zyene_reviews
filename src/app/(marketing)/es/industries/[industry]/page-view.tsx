import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    ES_INDUSTRY_LOCALIZED_SLUGS,
    getLocalizedIndustry,
} from "@/lib/phase8/localized-industries";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";



export default async function EsIndustryPage({
    params,
}: {
    params: Promise<{ industry: string }>;
}) {
    const { industry: localizedSlug } = await params;
    const data = getLocalizedIndustry("es", localizedSlug);
    if (!data) notFound();

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Industrias", url: "https://zyenereviews.com/es/industries" },
                    { name: data.name, url: `https://zyenereviews.com/es/industries/${localizedSlug}` },
                ]}
            />

            <section className="pt-24 pb-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                        <Link href="/es/industries" className="hover:text-primary">Industrias</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-foreground font-medium">{data.name}</span>
                    </nav>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{data.heroTitle}</h1>
                    <p className="text-xl text-muted-foreground leading-relaxed mb-8">{data.heroSubtitle}</p>

                    <ul className="space-y-3 mb-10">
                        {data.bullets.map((b) => (
                            <li key={b} className="flex gap-2 text-muted-foreground">
                                <Check className="h-5 w-5 text-primary shrink-0" />
                                {b}
                            </li>
                        ))}
                    </ul>

                    <div className="flex flex-wrap gap-4">
                        <Link href="/signup">
                            <Button size="lg" className="rounded-xl">
                                Prueba gratis <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href={`/industries/${data.industrySlug}`}>
                            <Button size="lg" variant="outline" className="rounded-xl">
                                Read in English
                            </Button>
                        </Link>
                    </div>

                    <p className="mt-8 text-sm text-muted-foreground">
                        Cumplimiento regional:{" "}
                        <Link href="/privacy" className="text-primary underline">Privacidad (GDPR, CCPA, LGPD)</Link>
                    </p>
                </div>
            </section>
        </>
    );
}
