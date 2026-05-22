import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";
import { LOCALIZED_INDUSTRY_PAGES } from "@/lib/phase8/localized-industries";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
    title: "Industrias — Gestión de reseñas en español | Zyene Reviews",
    description:
        "Páginas en español para restaurantes, clínicas, talleres, salones y más. Automatiza reseñas de Google con Zyene Reviews.",
    alternates: {
        canonical: "https://zyenereviews.com/es/industries",
        languages: { en: "https://zyenereviews.com/industries", es: "https://zyenereviews.com/es/industries" },
    },
    openGraph: {
        title: "Industrias — Zyene Reviews",
        description: "Gestión de reseñas para restaurantes, clínicas, talleres y más — en español.",
        url: "https://zyenereviews.com/es/industries",
    },
    twitter: {
        card: "summary_large_image",
        title: "Industrias — Zyene Reviews",
        description: "Gestión de reseñas para restaurantes, clínicas, talleres y más — en español.",
    },
};

export default function EsIndustriesHubPage() {
    const pages = LOCALIZED_INDUSTRY_PAGES.filter((p) => p.locale === "es");

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Industrias (ES)", url: "https://zyenereviews.com/es/industries" },
                ]}
            />
            <section className="pt-24 pb-16 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
                        <Globe className="h-3 w-3" /> Español
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Soluciones por industria</h1>
                    <p className="text-muted-foreground mb-8 max-w-2xl">
                        Páginas localizadas para equipos en Latinoamérica y España. Versión en inglés:{" "}
                        <Link href="/industries" className="text-primary underline">/industries</Link>.
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-4">
                        {pages.map((p) => (
                            <li key={p.localizedSlug}>
                                <Link
                                    href={`/es/industries/${p.localizedSlug}`}
                                    className="flex items-center justify-between bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors group"
                                >
                                    <span className="font-semibold">{p.name}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    );
}
