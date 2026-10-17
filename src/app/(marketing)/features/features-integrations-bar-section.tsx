import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { INTEGRATION_BRAND_CHIPS, getBrandLogoUrl } from "@/lib/marketing/integration-brands";

/** Same quiet logo row as the homepage platforms strip. */
export function FeaturesIntegrationsBarSection() {
    return (
        <section className="home-platforms" aria-labelledby="features-platforms-heading">
            <div className="marketing-container home-platforms-row">
                <h2 id="features-platforms-heading">Connects with the platforms you already use</h2>
                <ul>
                    {INTEGRATION_BRAND_CHIPS.map(({ name, domain, letter }) => (
                        <li key={name}>
                            {domain ? (
                                <Image src={getBrandLogoUrl(domain)} alt="" width={28} height={28} unoptimized />
                            ) : (
                                <span className="features-platform-mark" aria-hidden="true">{letter}</span>
                            )}
                            <span>{name}</span>
                        </li>
                    ))}
                </ul>
                <Link href="/integrations" className="home-text-link">
                    All integrations <ArrowRight size={14} aria-hidden="true" />
                </Link>
            </div>
        </section>
    );
}
