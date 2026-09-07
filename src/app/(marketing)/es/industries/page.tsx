import { LandingHero } from "@/components/marketing/landing-hero";
import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LOCALIZED_INDUSTRY_PAGES } from "@/lib/industries/localized-industries";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Industrias, Gestión de reseñas en español",
    description:
        "Páginas en español para restaurantes, clínicas, talleres, salones y más. Automatiza reseñas de Google con Zyene Reviews.",
    alternates: {
        canonical: "https://www.zyenereviews.com/es/industries",
        languages: { en: "https://www.zyenereviews.com/industries", es: "https://www.zyenereviews.com/es/industries" },
    },
    openGraph: {
        title: "Industrias",
        description: "Gestión de reseñas para restaurantes, clínicas, talleres y más, en español.",
        url: "https://www.zyenereviews.com/es/industries",
    },
    twitter: {
        card: "summary_large_image",
        title: "Industrias",
        description: "Gestión de reseñas para restaurantes, clínicas, talleres y más, en español.",
    },
});

export default function EsIndustriesHubPage() {
    const pages = LOCALIZED_INDUSTRY_PAGES.filter((p) => p.locale === "es");

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Industrias (ES)", url: "https://www.zyenereviews.com/es/industries" },
                ]}
            />
            <LandingHero eyebrow="Zyene en español" title="Tu industria. Tu reputación." description="Gestión de reseñas para los negocios de tu comunidad. Encuentra una solución para tu equipo." secondary={{ label: "Explore in English", href: "/industries" }} />
            <section className="marketing-section">
                <div className="marketing-container max-w-4xl">
                    <ul className="grid sm:grid-cols-2 gap-4">
                        {pages.map((p) => (
                            <li key={p.localizedSlug}>
                                <Link
                                    href={`/es/industries/${p.localizedSlug}`}
                                    className="flex items-center justify-between bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors group"
                                >
                                    <span className="font-semibold">{p.name}</span>
                                    <ArrowRight className="text-muted-foreground group-hover:text-primary size-4" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    );
}
