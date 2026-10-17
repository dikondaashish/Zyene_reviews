import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { IndustryHero } from "@/components/marketing/industries/industry-hero";
import { SIGNUP_URL } from "@/config/env";
import { LOCALIZED_INDUSTRY_PAGES } from "@/lib/industries/localized-industries";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { getEsIndustryImage } from "@/lib/industries/localized-industry-imagery";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Industrias, Gestión de reseñas en español",
    description:
        "Páginas en español para restaurantes, clínicas, talleres, salones y más. Automatiza reseñas de Google con Zyene Reviews.",
    robots: {
        index: false,
        follow: true,
    },
    alternates: {
        canonical: "https://www.zyenereviews.com/es/industries",
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
        <div className="ind-page" lang="es">
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Industrias (ES)", url: "https://www.zyenereviews.com/es/industries" },
                ]}
            />
            <IndustryHero
                kicker="Gestión de reseñas en español"
                headline="Tu industria. Tu reputación."
                lede="Gestión de reseñas para los negocios de tu comunidad. Encuentra una solución para tu equipo."
                primary={{ label: "Prueba gratis", href: SIGNUP_URL, track: "trial", trackLocation: "es-industries-hero" }}
                secondary={{ label: "Explore in English", href: "/industries" }}
                terms="Prueba de 7 días, se requiere tarjeta. Planes desde $29.99/mes. Cancela cuando quieras en Facturación."
                image={getEsIndustryImage("restaurants", "Restaurantes")}
            />
            <section className="marketing-section" aria-labelledby="es-industries-heading">
                <div className="marketing-container">
                    <div className="home-section-head">
                        <p className="marketing-eyebrow">Industrias</p>
                        <h2 id="es-industries-heading">Elige tu tipo de negocio.</h2>
                    </div>
                    <ul className="ind-dir-items" data-count="4">
                        {pages.map((p) => {
                            const photo = getEsIndustryImage(p.industrySlug, p.name);
                            return (
                                <li key={p.localizedSlug}>
                                    <Link href={`/es/industries/${p.localizedSlug}`} className="ind-dir-link">
                                        <span className="ind-dir-photo">
                                            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 767px) 100vw, 300px" />
                                        </span>
                                        <span className="ind-dir-name">
                                            {p.name}
                                            <ArrowUpRight size={16} aria-hidden="true" />
                                        </span>
                                        <span className="ind-dir-line">{p.heroTitle}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>
        </div>
    );
}
