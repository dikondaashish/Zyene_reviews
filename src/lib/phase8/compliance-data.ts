// ─────────────────────────────────────────────────────────────────────────────
// Regional privacy compliance summaries — Phase 8.3
// ─────────────────────────────────────────────────────────────────────────────

export const REGIONAL_COMPLIANCE_SECTIONS = [
    {
        id: "gdpr",
        title: "GDPR (European Union & UK)",
        summary:
            "We act as a processor for customer data you upload and as a controller for account data. Lawful bases, data subject rights, and subprocessors are described in our Privacy Policy. Enterprise customers may request a Data Processing Agreement (DPA).",
        bullets: [
            "Right of access, rectification, erasure, and portability",
            "Data stored in SOC-aligned infrastructure (Supabase / Vercel regions per deployment)",
            "No sale of personal data",
            "Google API Limited Use compliance for connected accounts",
        ],
    },
    {
        id: "ccpa",
        title: "CCPA / CPRA (California, USA)",
        summary:
            "California residents may request to know, delete, or correct personal information we collect about them as account holders. We do not sell personal information as defined under the CCPA.",
        bullets: [
            "Categories collected: identifiers, commercial information, internet activity (see Privacy Policy §1)",
            "Submit requests to privacy@zyenereviews.com with subject “California Privacy Request”",
            "We verify requests before disclosure or deletion",
            "Authorized agent requests accepted with written authorization",
            "Non-discrimination: we will not deny service for exercising privacy rights",
        ],
    },
    {
        id: "lgpd",
        title: "LGPD (Brazil)",
        summary:
            "For users and end-customers in Brazil, we process data based on contract performance, legitimate interest (service improvement), and consent where required (e.g., marketing email).",
        bullets: [
            "Data controller contact: privacy@zyenereviews.com",
            "You may confirm, access, correct, anonymize, or delete data per LGPD Art. 18",
            "International transfers rely on standard contractual safeguards where applicable",
            "Our DPO-aligned privacy team responds within applicable LGPD timelines",
        ],
    },
] as const;
