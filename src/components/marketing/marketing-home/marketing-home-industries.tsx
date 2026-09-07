import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const INDUSTRIES = [
    { label: "Restaurants & cafés", slug: "restaurants", image: "restaurants" },
    { label: "Dental practices", slug: "dental", image: "dental" },
    { label: "Home services", slug: "home-services", image: "home-services" },
];

export function MarketingHomeIndustries() {
    return (
        <section className="marketing-section bg-muted">
            <div className="marketing-container">
                <div className="marketing-section-heading">
                    <h2>Built for the businesses<br />that make a neighborhood.</h2>
                    <Link href="/industries" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary">Find your industry <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
                </div>
                <div className="grid grid-cols-1 gap-7 sm:grid-cols-3">
                    {INDUSTRIES.map(({ label, slug, image }) => (
                        <Link key={slug} href={`/industries/${slug}`} className="group">
                            <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-2xl bg-accent">
                                <Image src={`/images/industries/${image}.png`} alt={label} fill sizes="(max-width: 639px) 100vw, 33vw" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03]" />
                            </div>
                            <span className="flex items-center justify-between gap-3 text-lg font-semibold">{label}<ArrowUpRight className="size-5" aria-hidden="true" /></span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
