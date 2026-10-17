import Link from "next/link";
import { ArrowRight, Info, Plus } from "lucide-react";
import { FAQPageJsonLd } from "@/components/seo/json-ld";
import { FEATURE_PILLAR_MAP } from "@/lib/growth/feature-pillars";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";

type BentoProps = { capabilities: FeatureLandingContent["capabilities"]; facts?: FeatureLandingContent["facts"] };

/** Capabilities as an asymmetric bento (4+2 / 2+2+2 / 2+4); the key facts sit in the last wide cell. */
export function FeatureLandingBento({ capabilities, facts }: BentoProps) {
  return (
    <section className="marketing-section fl-bento-section" aria-labelledby="fl-caps-heading">
      <div className="marketing-container">
        <h2 id="fl-caps-heading" className="fl-section-title">{capabilities.title}</h2>
        <ul className={`fl-bento${facts?.length ? " fl-bento--facts" : ""}`}>
          {capabilities.items.map(({ icon: Icon, title, text }) => (
            <li key={title} className="fl-bento-cell">
              <Icon size={20} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
          {facts?.length ? (
            <li className="fl-bento-cell fl-bento-facts">
              <h3 className="sr-only">Key facts</h3>
              <dl>
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}

/** FAQ answers match the FAQPage JSON-LD on this route word for word. */
export function FeatureLandingFaq({ faqs, note }: { faqs: FeatureLandingContent["faqs"]; note?: string }) {
  return (
    <section className="marketing-section fl-faq" aria-labelledby="fl-faq-heading">
      <FAQPageJsonLd faqs={faqs} />
      <div className="marketing-container home-faq-grid">
        <div>
          <h2 id="fl-faq-heading" className="fl-section-title">Good to know</h2>
          {note && (
            <p className="fl-faq-note">
              <Info size={16} aria-hidden="true" />
              <span>{note}</span>
            </p>
          )}
        </div>
        <div className="home-faq-list">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>
                {faq.question}
                <Plus size={16} aria-hidden="true" />
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
        <h2 id="fl-related-heading" className="fl-section-title">Works well with</h2>
        <ul className="fl-related-list">
          {related.map((slug) => {
            const page = FEATURE_PILLAR_MAP[slug];
            return (
              <li key={slug}>
                <Link href={`/features/${slug}`} className="fl-related-link">
                  <h3>{page.navLabel}</h3>
                  <p>{page.tagline}</p>
                  <span className="home-text-link">
                    Learn more<span className="sr-only">: {page.navLabel}</span> <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
