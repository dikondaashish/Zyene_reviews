import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HelpContactSupportSection() {
    return (
        <section className="marketing-section mi-section-tight" aria-labelledby="help-contact-heading">
            <div className="marketing-container">
                <div className="mi-panel">
                    <h2 id="help-contact-heading">Still need help?</h2>
                    <p>
                        Our support team is available Monday through Friday, 9am-6pm EST.
                        We typically respond within 24 hours.
                    </p>
                    <div className="marketing-actions">
                        <Link href="/contact" className="marketing-button marketing-button-secondary">
                            Contact support <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                    <div className="mi-panel-foot">
                        <a href="mailto:support@zyenereviews.com" className="home-text-link">
                            support@zyenereviews.com
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
