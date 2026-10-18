import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AgenciesSection5Section() {
    return (
        <section className="marketing-section mi-section-tight" aria-label="More ways to work with Zyene">
            <div className="marketing-container">
                <p className="mi-lede">Also exploring POS, Zapier, and association partnerships?</p>
                <div className="mi-link-row">
                    <Link href="/partners" className="home-text-link">
                        See the full partners page <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                    <Link href="/enterprise" className="home-text-link">
                        Enterprise for 16+ locations <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
