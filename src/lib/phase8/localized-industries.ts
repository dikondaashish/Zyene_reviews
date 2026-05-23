// ─────────────────────────────────────────────────────────────────────────────
// Localized marketing industry pages — Phase 8.3
// Pattern: /es/industries/{localizedSlug} → English industry slug
// ─────────────────────────────────────────────────────────────────────────────

export type MarketingLocale = "es";

export interface LocalizedIndustryPage {
    locale: MarketingLocale;
    localizedSlug: string;
    industrySlug: string;
    name: string;
    metaTitle: string;
    metaDescription: string;
    heroTitle: string;
    heroSubtitle: string;
    bullets: string[];
}

export const LOCALIZED_INDUSTRY_PAGES: LocalizedIndustryPage[] = [
    {
        locale: "es",
        localizedSlug: "restaurantes",
        industrySlug: "restaurants",
        name: "Restaurantes",
        metaTitle: "Gestión de reseñas para restaurantes",
        metaDescription:
            "Automatiza solicitudes de reseñas en Google, responde con IA y protege tu reputación. Hecho para restaurantes independientes y cadenas locales.",
        heroTitle: "Más reseñas de 5 estrellas para tu restaurante",
        heroSubtitle:
            "Envía solicitudes por SMS después de cada visita, responde reseñas en minutos y evita que una mala experiencia dañe tu rating en Google.",
        bullets: [
            "Solicitudes automáticas tras el pago o la reserva",
            "Respuestas con IA en español e inglés",
            "Panel para varias ubicaciones",
        ],
    },
    {
        locale: "es",
        localizedSlug: "dental",
        industrySlug: "dental",
        name: "Clínicas dentales",
        metaTitle: "Software de reseñas para clínicas dentales",
        metaDescription:
            "Cumple normativas de privacidad, pide reseñas de forma ética y mejora tu presencia local en Google Maps.",
        heroTitle: "Reputación online para clínicas dentales",
        heroSubtitle:
            "Flujos compatibles con HIPAA en tono, solicitudes post-cita y respuestas profesionales sin pasar horas en Google.",
        bullets: [
            "Escudo de feedback negativo privado",
            "Seguimiento de competidores cercanos",
            "Widgets para tu sitio web",
        ],
    },
    {
        locale: "es",
        localizedSlug: "servicios-hogar",
        industrySlug: "home-services",
        name: "Servicios del hogar",
        metaTitle: "Reseñas para servicios del hogar",
        metaDescription:
            "Fontanería, HVAC, electricidad y más: convierte trabajos terminados en reseñas de Google automáticamente.",
        heroTitle: "Más trabajos gracias a mejores reseñas",
        heroSubtitle:
            "Tus técnicos terminan el trabajo; Zyene envía el enlace de reseña por SMS. Tú respondes desde el panel.",
        bullets: [
            "SMS post-servicio con un toque",
            "IA para respuestas a reseñas mixtas",
            "Hasta 3 ubicaciones en Professional",
        ],
    },
    {
        locale: "es",
        localizedSlug: "salones",
        industrySlug: "salons",
        name: "Salones y spas",
        metaTitle: "Gestión de reseñas para salones",
        metaDescription:
            "Pide reseñas después de cada cita, responde rápido y muestra tus mejores comentarios en tu web.",
        heroTitle: "Llena tu agenda con reseñas reales",
        heroSubtitle:
            "Las clientas felices dejan reseñas en segundos; las insatisfechas hablan contigo en privado primero.",
        bullets: [
            "Recordatorios SMS post-visita",
            "Respuestas con tu tono de marca",
            "Widget de reseñas para tu sitio",
        ],
    },
    {
        locale: "es",
        localizedSlug: "reparacion-automotriz",
        industrySlug: "auto-repair",
        name: "Talleres mecánicos",
        metaTitle: "Reseñas para talleres y auto repair",
        metaDescription:
            "Convierte órdenes de trabajo completadas en reseñas de Google. Ideal para talleres independientes.",
        heroTitle: "Confianza en Google para tu taller",
        heroSubtitle:
            "Después de cada reparación, pide una reseña automáticamente y responde con IA cuando lleguen comentarios nuevos.",
        bullets: [
            "Integración con flujos de caja / Zapier",
            "Alertas de reseñas negativas",
            "Análisis de competencia local",
        ],
    },
    {
        locale: "es",
        localizedSlug: "medicos",
        industrySlug: "medical",
        name: "Consultorios médicos",
        metaTitle: "Reseñas para consultorios y clínicas",
        metaDescription:
            "Gestión de reputación para prácticas médicas locales con enfoque en privacidad y tono profesional.",
        heroTitle: "Reputación médica sin comprometer la privacidad",
        heroSubtitle:
            "Solicitudes éticas, respuestas alineadas con normativa y visibilidad en búsquedas locales.",
        bullets: [
            "Respuestas con tono clínico",
            "Multi-ubicación para grupos pequeños",
            "Cumplimiento GDPR y políticas claras",
        ],
    },
    {
        locale: "es",
        localizedSlug: "hoteles",
        industrySlug: "hotels",
        name: "Hoteles y hospedaje",
        metaTitle: "Reseñas para hoteles y hospedaje",
        metaDescription:
            "Mejora tu puntuación en Google y TripAdvisor con solicitudes post-estancia y respuestas centralizadas.",
        heroTitle: "Mejor rating para tu propiedad",
        heroSubtitle:
            "Automatiza solicitudes después del checkout y responde reseñas desde un solo panel por ubicación.",
        bullets: [
            "SMS post-checkout",
            "Panel multi-propiedad",
            "Informes para gerencia",
        ],
    },
    {
        locale: "es",
        localizedSlug: "gimnasios",
        industrySlug: "fitness",
        name: "Gimnasios y fitness",
        metaTitle: "Reseñas para gimnasios y estudios fitness",
        metaDescription:
            "Pide reseñas a nuevos miembros, responde con IA y compite con cadenas grandes en tu zona.",
        heroTitle: "Destaca frente a las grandes cadenas",
        heroSubtitle:
            "Cada nuevo miembro recibe un SMS para dejar reseña; tú mantienes 4.8+ estrellas en Google.",
        bullets: [
            "Automatización post-primera clase",
            "Seguimiento de competidores",
            "Widgets para tu landing",
        ],
    },
];

const byLocalizedSlug = Object.fromEntries(
    LOCALIZED_INDUSTRY_PAGES.map((p) => [`${p.locale}/${p.localizedSlug}`, p])
);

export function getLocalizedIndustry(
    locale: string,
    localizedSlug: string
): LocalizedIndustryPage | undefined {
    return byLocalizedSlug[`${locale}/${localizedSlug}`];
}

export const ES_INDUSTRY_LOCALIZED_SLUGS = LOCALIZED_INDUSTRY_PAGES.reduce<string[]>(
    (acc, p) => {
        if (p.locale === "es") acc.push(p.localizedSlug);
        return acc;
    },
    []
);
