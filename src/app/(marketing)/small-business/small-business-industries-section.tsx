import Link from "next/link";
import { NAV_INDUSTRIES } from "@/app/(marketing)/marketing-layout-industry-links";

export function SmallBusinessIndustriesSection() {
    return (
        <section className="marketing-section mi-section-tight" aria-labelledby="small-business-industries-heading">
            <div className="marketing-container">
                <nav aria-labelledby="small-business-industries-heading">
                    <h2 id="small-business-industries-heading" className="small-business-industries-title">Review management by industry</h2>
                    <ul className="mi-chips">
                        {NAV_INDUSTRIES.map((industry) => (
                            <li key={industry.slug}>
                                <Link href={`/industries/${industry.slug}`}>{industry.name}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </section>
    );
}
