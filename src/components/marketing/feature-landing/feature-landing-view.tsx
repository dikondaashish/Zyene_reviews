import { FeatureLandingClosing } from "@/components/marketing/feature-landing/feature-landing-closing";
import { FeatureLandingCrossLinks } from "@/components/marketing/feature-landing/feature-landing-cross-links";
import { FeatureLandingFlow } from "@/components/marketing/feature-landing/feature-landing-flow";
import { FeatureLandingHero } from "@/components/marketing/feature-landing/feature-landing-hero";
import { FeatureLandingRows } from "@/components/marketing/feature-landing/feature-landing-rows";
import { FeatureLandingStage } from "@/components/marketing/feature-landing/feature-landing-stage";
import {
  FeatureLandingBento,
  FeatureLandingFaq,
  FeatureLandingRelated,
} from "@/components/marketing/feature-landing/feature-landing-details";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { BreadcrumbJsonLd, HowToJsonLd } from "@/components/seo/json-ld";
import type { FeaturePillarPage } from "@/lib/growth/feature-pillars";

const BASE = "https://www.zyenereviews.com";

export function FeatureLandingView({ pillar, content }: { pillar: FeaturePillarPage; content: FeatureLandingContent }) {
  const { hero, flow } = content;
  return (
    <div className="fl-page">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BASE}/` },
          { name: "Features", url: `${BASE}/features` },
          { name: pillar.title, url: `${BASE}/features/${pillar.slug}` },
        ]}
      />
      <HowToJsonLd
        name={flow.title}
        description={flow.intro}
        steps={flow.steps.map((step) => ({ name: step.title, text: step.text }))}
      />
      <FeatureLandingHero
        kicker={hero.kicker}
        headline={hero.headline}
        lede={hero.lede}
        crumbs={[
          { name: "Features", href: "/features" },
          { name: pillar.navLabel, href: `/features/${pillar.slug}` },
        ]}
        visual={hero.visual}
        visualLabel={hero.visualLabel}
      />
      <FeatureLandingFlow flow={flow} />
      {content.demoTab && (
        <section className="marketing-section fl-demo" aria-labelledby="fl-demo-heading">
          <div className="marketing-container">
            <h2 id="fl-demo-heading" className="fl-section-title">Click around the workspace</h2>
            <FeatureLandingStage
              label={`${pillar.navLabel} product demonstration`}
              initialTab={content.demoTab}
            />
          </div>
        </section>
      )}
      <FeatureLandingRows rows={content.rows} />
      <FeatureLandingBento capabilities={content.capabilities} facts={content.facts} />
      <FeatureLandingFaq faqs={content.faqs} note={content.note} />
      <FeatureLandingRelated related={content.related} />
      <FeatureLandingCrossLinks slug={pillar.slug} />
      <FeatureLandingClosing title={pillar.tagline} location="feature-cta" />
    </div>
  );
}
