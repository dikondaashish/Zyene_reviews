import Link from "next/link";
import { ArrowRight, ChevronDown, Info } from "lucide-react";
import { FAQPageJsonLd } from "@/components/seo/json-ld";
import { FEATURE_PILLAR_MAP } from "@/lib/growth/feature-pillars";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";

export function FeatureLandingCapabilities({ capabilities }: { capabilities: FeatureLandingContent["capabilities"] }) {
  return (
    <section className="marketing-section fl-caps" aria-labelledby="fl-caps-heading">
      <div className="marketing-container">
        <h2 id="fl-caps-heading" className="fl-caps-title">{capabilities.title}</h2>
        <ul className="fl-caps-grid">
          {capabilities.items.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <span className="fl-caps-icon" aria-hidden="true"><Icon size={20} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FeatureLandingFacts({ facts }: { facts: NonNullable<FeatureLandingContent["facts"]> }) {
  return (
    <section className="fl-facts" aria-label="Key facts">
      <dl className="marketing-container fl-facts-grid">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function FeatureLandingFaq({ faqs, note }: { faqs: FeatureLandingContent["faqs"]; note?: string }) {
  return (
    <section className="marketing-section fl-faq" aria-labelledby="fl-faq-heading">
      <FAQPageJsonLd faqs={faqs} />
      <div className="marketing-container fl-faq-layout">
        <div>
          <p className="marketing-eyebrow">Questions</p>
          <h2 id="fl-faq-heading">Good to know</h2>
          {note && (
            <p className="fl-faq-note">
              <Info size={16} aria-hidden="true" />
              <span>{note}</span>
            </p>
          )}
        </div>
        <div className="fl-faq-list">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>
                {faq.question}
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeatureLandingRelated({ related }: { related: FeatureLandingContent["related"] }) {
  return (
    <section className="marketing-section fl-related" aria-labelledby="fl-related-heading">
      <div className="marketing-container">
        <h2 id="fl-related-heading" className="fl-caps-title">Works well with</h2>
        <ul className="fl-related-grid">
          {related.map((slug) => {
            const page = FEATURE_PILLAR_MAP[slug];
            return (
              <li key={slug}>
                <Link href={`/features/${slug}`} className="fl-related-card">
                  <h3>{page.navLabel}</h3>
                  <p>{page.tagline}</p>
                  <span>Learn more <ArrowRight size={15} aria-hidden="true" /></span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
