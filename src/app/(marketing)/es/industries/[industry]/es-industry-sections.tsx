import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";
import type { LocalizedIndustryPage } from "@/lib/industries/localized-industries";

export function EsIndustryHelpSection({ data }: { data: LocalizedIndustryPage }) {
    return (
        <section className="marketing-section" aria-labelledby="es-help-heading">
            <div className="marketing-container ind-split">
                <div className="ind-split-head">
                    <p className="marketing-eyebrow">{data.name}</p>
                    <h2 id="es-help-heading">Cómo ayuda Zyene Reviews</h2>
                    <p className="home-section-lede">
                        Las reseñas de Google influyen en quién te encuentra en Maps y quién confía en tu negocio antes de
                        llamar. Zyene Reviews centraliza solicitudes de reseñas, alertas en tiempo real y respuestas con IA
                        para que respondas más rápido y protejas tu puntuación.
                    </p>
                </div>
                <ul className="ind-check-list">
                    {data.bullets.map((bullet) => (
                        <li key={bullet}>
                            <Check size={18} aria-hidden="true" />
                            {bullet}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export function EsIndustryFeaturesSection() {
    return (
        <section className="marketing-section" aria-labelledby="es-features-heading">
            <div className="marketing-container">
                <div className="home-section-head">
                    <p className="marketing-eyebrow">Todo en un solo panel</p>
                    <h2 id="es-features-heading">Funciones clave</h2>
                </div>
                <div className="ind-columns">
                    <div>
                        <h3>Solicitudes y alertas</h3>
                        <p>
                            Solicitudes automáticas por SMS, respuestas con IA en español e inglés, alertas en tiempo real y
                            seguimiento de competidores locales, todo desde un solo panel para tu equipo.
                        </p>
                    </div>
                    <div>
                        <h3>Respuestas con IA</h3>
                        <p>
                            Revisa un borrador de IA antes de publicarlo, o activa respuestas automáticas para nuevas reseñas
                            de Google que cumplan tu puntuación mínima. Elige el tono para cada negocio.{" "}
                            <Link href="/features/ai-replies" className="ind-inline-link">Ver cómo funciona (en inglés)</Link>.
                        </p>
                    </div>
                    <div>
                        <h3>Cumplimiento regional</h3>
                        <p>
                            Revisa cómo tratamos los datos de tus clientes en nuestra{" "}
                            <Link href="/privacy" className="ind-inline-link">Privacidad (GDPR, CCPA, LGPD)</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

const ES_NEXT_LINKS = [
    { label: "Ver precios", href: "/pricing" },
    { label: "Todas las industrias", href: "/es/industries" },
];

export function EsIndustryClosingSection({ data }: { data: LocalizedIndustryPage }) {
    return (
        <MarketingClosingBand
            title="Empieza hoy."
            text="Prueba Zyene Reviews gratis durante 7 días. Sin contrato anual. Planes desde $29.99/mes con escudo de feedback negativo y respuestas con IA incluidas."
            primaryLabel="Crear cuenta gratis"
            secondary={{ label: "Read in English", href: `/industries/${data.industrySlug}` }}
            trackLocation="es-industry-cta"
            aside={
                <nav aria-label="Más opciones" className="ind-final-links">
                    {ES_NEXT_LINKS.map((link) => (
                        <Link key={link.href} href={link.href}>
                            {link.label} <ArrowUpRight size={18} aria-hidden="true" />
                        </Link>
                    ))}
                </nav>
            }
        />
    );
}
