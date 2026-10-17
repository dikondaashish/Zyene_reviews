// ─────────────────────────────────────────────────────────────────────────────
// Localized marketing industry pages - Phase 8.3
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
        heroTitle: "Mesas llenas. Reseñas recientes.",
        heroSubtitle:
            "Pide una reseña después de cada visita, responde en Google automáticamente y da a los comensales insatisfechos una vía privada para hablar contigo.",
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
            "Clínicas dentales: reseñas de Google, respuestas con IA y escudo de feedback negativo con enfoque en privacidad. Desde $29.99/mes.",
        heroTitle: "La clínica en la que los pacientes confían primero.",
        heroSubtitle:
            "Pide reseñas después de cada cita, aprueba respuestas cuidadosas y atiende en privado las dudas de facturación o espera.",
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
            "Fontanería, HVAC y electricidad: convierte trabajos terminados en reseñas de Google con solicitudes SMS y respuestas con IA.",
        heroTitle: "Gana el trabajo antes de tocar la puerta.",
        heroSubtitle:
            "Pide la reseña al cerrar el trabajo, responde desde la camioneta y atiende en privado las dudas sobre precios.",
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
            "Salones y spas: pide reseñas tras cada cita, responde con IA y muestra tus mejores comentarios en tu sitio web.",
        heroTitle: "Cada buena cita, a la vista de todos.",
        heroSubtitle:
            "Pide una reseña después de cada visita, responde con la voz de tu salón y entérate en privado cuando un corte o color no salió bien.",
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
        heroTitle: "El taller al que confían su auto.",
        heroSubtitle:
            "Pide una reseña en cada entrega, responde mientras el taller sigue ocupado y aclara en privado las dudas sobre presupuestos.",
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
            "Consultorios médicos: gestión de reputación con privacidad, solicitudes éticas de reseñas y respuestas con tono clínico.",
        heroTitle: "Reseñas constantes. Respuestas cuidadosas.",
        heroSubtitle:
            "Pide reseñas después de cada consulta, revisa los borradores de IA antes de publicarlos y envía las quejas por espera a recepción.",
        bullets: [
            "Respuestas con tono clínico",
            "Multi-ubicación para grupos pequeños",
            "Revisar permisos y políticas de comunicación",
        ],
    },
    {
        locale: "es",
        localizedSlug: "hoteles",
        industrySlug: "hotels",
        name: "Hoteles y hospedaje",
        metaTitle: "Reseñas para hoteles y hospedaje",
        metaDescription:
            "Hoteles: mejora tu puntuación en Google con solicitudes post-estancia, respuestas con IA y panel multi-propiedad.",
        heroTitle: "Una recepción para tu reputación.",
        heroSubtitle:
            "Pide reseñas en el checkout, responde en Google con tu tono y entérate de problemas en la habitación cuando aún puedes resolverlos.",
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
            "Gimnasios y estudios fitness: pide reseñas a nuevos miembros, responde con IA y compite con grandes cadenas locales.",
        heroTitle: "Llega a enero con reseñas recientes.",
        heroSubtitle:
            "Reúne reseñas todo el año, responde con la voz de tu gimnasio y atiende en privado las dudas de cancelación o cobro.",
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

/** Spanish industry path for an English industry slug, if a localized page exists. */
export function getEsIndustryPathForEnglishSlug(industrySlug: string): string | null {
    const page = LOCALIZED_INDUSTRY_PAGES.find(
        (p) => p.locale === "es" && p.industrySlug === industrySlug
    );
    return page ? `/es/industries/${page.localizedSlug}` : null;
}

export const ES_INDUSTRY_LOCALIZED_SLUGS = LOCALIZED_INDUSTRY_PAGES.reduce<string[]>(
    (acc, p) => {
        if (p.locale === "es") acc.push(p.localizedSlug);
        return acc;
    },
    []
);
