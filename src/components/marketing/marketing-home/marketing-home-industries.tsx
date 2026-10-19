import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getIndustryImage } from "@/lib/industries/industry-imagery";
import { NAV_INDUSTRIES } from "@/app/(marketing)/marketing-layout-industry-links";

/** Horizontal, scroll-snapped gallery of every industry page. */
export function MarketingHomeIndustries() {
  return (
    <section className="marketing-section home-industries" aria-labelledby="home-industries-heading">
      <div className="marketing-container home-industries-head">
        <div>
          <p className="marketing-eyebrow">Industries</p>
          <h2 id="home-industries-heading">Made for the places people come back to.</h2>
        </div>
        <Link href="/industries" className="home-text-link">
          All industries <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
      <ul className="home-industries-track" aria-label="Industries">
        {NAV_INDUSTRIES.map(({ slug, name }) => {
          const photo = getIndustryImage(slug, name);
          return (
            <li key={slug}>
              <Link href={`/industries/${slug}`}>
                <span className="home-industry-photo">
                  <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 767px) 110vw, 450px" />
                </span>
                <span className="home-industry-label">
                  {name}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
