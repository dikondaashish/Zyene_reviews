import { LandingHero } from "@/components/marketing/landing-hero";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SIGNUP_URL } from "@/config/env";
import { getLocalizedIndustry } from "@/lib/industries/localized-industries";
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
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Industrias", url: "https://www.zyenereviews.com/es/industries" },
                    { name: data.name, url: `https://www.zyenereviews.com/es/industries/${localizedSlug}` },
                ]}
            />

            <LandingHero eyebrow={`Zyene para ${data.name}`} title={data.heroTitle} description={data.heroSubtitle} primary={{ label: "Prueba gratis", href: "/signup" }} secondary={{ label: "Read in English", href: `/industries/${data.industrySlug}` }} />
            <section className="marketing-section">
                <div className="marketing-container max-w-4xl">
                    <ul className="space-y-3 mb-10">
                        {data.bullets.map((b) => (
                            <li key={b} className="flex gap-2 text-muted-foreground">
                                <Check className="text-primary shrink-0 size-5" />
                                {b}
                            </li>
                        ))}
                    </ul>

                    <div className="flex flex-wrap gap-4">
                        <Button size="lg" className="rounded-xl" asChild>
                            <Link href={SIGNUP_URL}>
                                Prueba gratis <ArrowRight className="ml-2 size-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-xl" asChild>
                            <Link href={`/industries/${data.industrySlug}`}>
                                Read in English
                            </Link>
                        </Button>
                    </div>

                    <p className="mt-8 text-sm text-muted-foreground">
                        Cumplimiento regional:{" "}
                        <Link href="/privacy" className="text-primary underline">Privacidad (GDPR, CCPA, LGPD)</Link>
                    </p>
                </div>
            </section>

            <section className="py-16 px-4 bg-muted/30 border-t border-border">
                <div className="container mx-auto max-w-4xl space-y-10">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-3">Cómo ayuda Zyene Reviews</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Las reseñas de Google influyen en quién te encuentra en Maps y quién confía en tu negocio
                            antes de llamar. Zyene Reviews centraliza solicitudes de reseñas, alertas en tiempo real y
                            respuestas con IA para que respondas más rápido y protejas tu puntuación.
                        </p>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-3">Funciones clave</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Solicitudes automáticas por SMS, respuestas con IA en español e inglés, alertas en tiempo
                            real y seguimiento de competidores locales - todo desde un solo panel para tu equipo.
                        </p>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-3">Empieza hoy</h2>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            Prueba Zyene Reviews gratis durante 7 días. Sin contrato anual - planes desde $29.99/mes
                            con escudo de feedback negativo y respuestas con IA incluidas.
                        </p>
                        <Button size="lg" className="rounded-xl" asChild>
                            <Link href={SIGNUP_URL}>
                                Crear cuenta gratis <ArrowRight className="ml-2 size-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
