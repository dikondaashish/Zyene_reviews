import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getIndustryImage } from "@/lib/industries/industry-imagery";

const INDUSTRIES = [
  { label: "Restaurants & cafés", slug: "restaurants" },
  { label: "Dental practices", slug: "dental" },
  { label: "Home services", slug: "home-services" },
];
export function MarketingHomeIndustries() {
  return (
    <section className="marketing-section bg-muted">
      <div className="marketing-container">
        <div className="marketing-section-heading">
          <h2>
            For the places
            <br />
            people come back to.
          </h2>
          <div>
            <p>From the first appointment to the neighborhood favorite. Built around your business.</p>
            <Link href="/industries" className="mt-6 inline-flex items-center gap-4 text-sm font-semibold">
              Find your industry <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="industry-showcase">
          {INDUSTRIES.map(({ label, slug }) => (
            <Link key={slug} href={`/industries/${slug}`}>
              <div className="industry-photo">
                <Image src={getIndustryImage(slug).src} alt={getIndustryImage(slug, label).alt} fill sizes="(max-width:767px) 100vw, 35vw" />
              </div>
              <span className="industry-label">
                {label}
                <ArrowUpRight size={20} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
