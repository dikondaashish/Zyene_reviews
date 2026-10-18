import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getComparisonsForPillar } from "@/lib/comparisons/competitor-data";
import type { FeaturePillarSlug } from "@/lib/growth/feature-pillars";
import { INDUSTRY_MAP } from "@/lib/industries/industry-data";
import { getIndustrySlugsForPillar } from "@/lib/industries/industry-page-content";

/** Links back from a feature page to the industry and compare pages that list it in relatedPillars. */
export function FeatureLandingCrossLinks({ slug }: { slug: FeaturePillarSlug }) {
  const industries = getIndustrySlugsForPillar(slug).map((s) => INDUSTRY_MAP[s]).filter(Boolean);
  const comparisons = getComparisonsForPillar(slug);
  if (industries.length === 0 && comparisons.length === 0) return null;

  return (
    <section className="marketing-section fl-related" aria-label="Industries and comparisons">
      <div className="marketing-container grid gap-10 md:grid-cols-2">
        {industries.length > 0 && (
          <nav aria-labelledby="fl-industries-heading">
            <h2 id="fl-industries-heading" className="fl-section-title">Popular in your industry</h2>
            <ul className="mt-4 grid gap-3">
              {industries.map((industry) => (
                <li key={industry.slug}>
                  <Link href={`/industries/${industry.slug}`} className="home-text-link">
                    {industry.name} <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {comparisons.length > 0 && (
          <nav aria-labelledby="fl-compare-heading">
            <h2 id="fl-compare-heading" className="fl-section-title">Compare before you switch</h2>
            <ul className="mt-4 grid gap-3">
              {comparisons.map((c) => (
                <li key={c.slug}>
                  <Link href={`/compare/${c.slug}`} className="home-text-link">
                    Zyene Reviews vs {c.name} <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </section>
  );
}
