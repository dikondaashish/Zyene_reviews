import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { PartnersHeroSection } from "./partners-hero-section";
import { PARTNER_CONTACT_EMAIL } from "@/lib/campaign-content/partnerships-data";

export default function PartnersPage() {
    return <>
        <BreadcrumbJsonLd items={[{ name: "Home", url: "https://www.zyenereviews.com/" }, { name: "Partners", url: "https://www.zyenereviews.com/partners" }]} />
        <PartnersHeroSection />
        <section className="marketing-section">
            <div className="marketing-container space-y-8">
                <h2 className="text-3xl font-bold">Find the right way to work together</h2>
                <div className="grid gap-6 md:grid-cols-3">
                    {[
                        ["Agencies and consultants", "Manage reviews for the local businesses you support. Discuss client access, location limits, and reporting with us."],
                        ["Software and service providers", "Use the API or a supported automation connection to request feedback after a completed job or visit."],
                        ["Local business communities", "Help members understand review collection, replies, and private feedback with practical product walkthroughs."],
                    ].map(([title, text]) => <article key={title} className="rounded-2xl border border-border bg-card p-6"><h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 text-muted-foreground">{text}</p></article>)}
                </div>
                <h2 className="text-2xl font-bold">Tell us about your customers</h2>
                <p className="max-w-2xl text-muted-foreground">Include your business, the customers you serve, and the workflow you want to support. We will confirm eligibility, available features, pricing, and any referral terms in writing before you join.</p>
                <div className="flex flex-wrap gap-4">
                    <a href={`mailto:${PARTNER_CONTACT_EMAIL}?subject=Partnership%20inquiry`} className="marketing-button">Contact partnerships</a>
                    <Link href="/integrations" className="marketing-button marketing-button-secondary">Explore supported integrations</Link>
                </div>
            </div>
        </section>
    </>;
}
