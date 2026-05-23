import type { Metadata } from "next";
import Link from "next/link";
import {
    Shield,
    Lock,
    Database,
    Globe,
    KeyRound,
    FileCheck,
    Mail,
    ArrowRight,
    ShieldCheck,
    Server,
    Eye,
} from "lucide-react";

export const SECURITY_SECTIONS = [
    {
        icon: Database,
        title: "Row Level Security (RLS)",
        body: "Every table in our PostgreSQL database uses Supabase Row Level Security. Queries are scoped to your organization via get_user_org_ids() — one tenant cannot read, update, or delete another tenant's reviews, customers, or settings. This is enforced at the database layer, not only in application code.",
    },
    {
        icon: Lock,
        title: "256-bit encryption",
        body: "All traffic between your browser and Zyene uses TLS 1.2+ (HTTPS). Data at rest in our database and object storage is encrypted using industry-standard AES-256. API keys and OAuth tokens are stored encrypted and never exposed in client-side code or logs.",
    },
    {
        icon: Globe,
        title: "GDPR, CCPA & LGPD",
        body: "We process personal data under lawful bases documented in our Privacy Policy (Section 10: Regional Privacy Rights). GDPR and UK rights, California CPRA requests, and Brazil LGPD rights are supported — contact privacy@zyenereviews.com. Enterprise customers may request a Data Processing Agreement.",
    },
    {
        icon: ShieldCheck,
        title: "No review gating policy",
        body: "Zyene does not filter which customers may leave a public review based on star rating. Our Negative Feedback Shield routes low ratings to private resolution first — but we never block legitimate public reviews. This aligns with Google and FTC guidance on deceptive review practices.",
    },
    {
        icon: KeyRound,
        title: "Secure Google OAuth (Limited Use)",
        body: "Google Business Profile access uses official OAuth 2.0 with the minimum scopes required. We comply with Google's API Services User Data Policy and Limited Use requirements — your Google data is used only to sync and reply to reviews you authorize, never for advertising or unrelated purposes.",
    },
    {
        icon: FileCheck,
        title: "SOC 2 readiness",
        body: "We follow security controls aligned with SOC 2 Type II expectations: access logging, least-privilege admin access, dependency scanning, and incident response procedures. Formal SOC 2 certification will be pursued as we scale enterprise contracts.",
    },
    {
        icon: Server,
        title: "Infrastructure & availability",
        body: "Production runs on Vercel and Supabase with geographically distributed infrastructure. Status and uptime are published at status.zyenereviews.com. We monitor sync pipelines and alert on integration failures affecting review delivery.",
    },
    {
        icon: Eye,
        title: "Responsible disclosure",
        body: "If you discover a security vulnerability, report it responsibly to security@zyenereviews.com. We acknowledge valid reports within 5 business days and work with researchers under coordinated disclosure. We do not pursue legal action against good-faith security research.",
    },
];
