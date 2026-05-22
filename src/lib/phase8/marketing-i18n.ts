// ─────────────────────────────────────────────────────────────────────────────
// Marketing site locale entry points — Phase 8.3
// Full app UI i18n: src/lib/i18n (en, es, fr, de, nl, pt) via dashboard LanguageContext.
// Marketing site: localized industry landings under /es/industries/*
// ─────────────────────────────────────────────────────────────────────────────

export const MARKETING_LOCALE_LINKS = [
    { code: "en", label: "English", industriesHref: "/industries" },
    { code: "es", label: "Español", industriesHref: "/es/industries" },
] as const;
