import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PARTNER_CONTACT_EMAIL } from "@/lib/campaign-content/partnerships-data";

export function PartnersContactSection() {
    return (
        <section className="marketing-section" aria-labelledby="partners-contact-heading">
            <div className="marketing-container mi-split">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Get in touch</p>
                    <h2 id="partners-contact-heading">Tell us about your customers</h2>
                    <p>Include your business, the customers you serve, and the workflow you want to support.</p>
                </div>
                <div className="mi-panel">
                    <h3>Contact partnerships</h3>
                    <p>We will confirm eligibility, available features, pricing, and any referral terms in writing before you join.</p>
                    <div className="marketing-actions">
                        <Link href="/demo" className="marketing-button" data-track="demo" data-track-location="partners">
                            Book a demo <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                        <Link href="/integrations" className="marketing-button marketing-button-secondary">
                            Explore supported integrations
                        </Link>
                    </div>
                    <div className="mi-panel-foot">
                        <a href={`mailto:${PARTNER_CONTACT_EMAIL}?subject=Partnership%20inquiry`} className="home-text-link">
                            Email partnerships <ArrowRight size={14} aria-hidden="true" />
                        </a>
                        <Link href="/contact" className="home-text-link">
                            Contact our team <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
