import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { LandingHero } from "@/components/marketing/landing-hero";
import { FeatureDemoFrame } from "@/components/marketing/interior/feature-demo-frame";
import { AutomaticRepliesFeature } from "@/components/marketing/automatic-replies-feature";
import { ProductTour } from "@/components/marketing/product-tour/product-tour";
import { FEATURE_VISUALS } from "@/components/marketing/feature-visual-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { SIGNUP_URL } from "@/config/env";
import { NEGATIVE_FEEDBACK_SHIELD } from "@/lib/growth/product-foundation";
import type { FeaturePillarPage as Pillar } from "@/lib/growth/feature-pillars";

export function FeaturePillarPageView({ pillar }: { pillar: Pillar }) {
  const visual = FEATURE_VISUALS[pillar.slug];
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.zyenereviews.com/" },
          { name: "Features", url: "https://www.zyenereviews.com/features" },
          { name: pillar.title, url: `https://www.zyenereviews.com/features/${pillar.slug}` },
        ]}
      />
      <LandingHero
        eyebrow={pillar.title}
        title={visual.headline}
        description={pillar.tagline}
        variant={visual.tab ? "product" : "story"}
        media={visual.tab
          ? {
              kind: "product",
              label: `${pillar.title} interactive sample`,
              node: (
                <FeatureDemoFrame label={`${pillar.title} product demonstration`} caption="Fictional business data. Safe to explore.">
                  <h2 className="sr-only">Explore the interactive demo</h2>
                  <ProductTour initialTab={visual.tab} />
                </FeatureDemoFrame>
              ),
            }
          : { kind: "photo", src: visual.image, alt: visual.alt }}
        primary={{ label: "Start free trial", href: "/signup" }}
        secondary={{ label: "Book a walkthrough", href: "/demo" }}
      >
        <Link href="/features" className="underline underline-offset-4">
          Explore the whole platform
        </Link>
      </LandingHero>
      <section className="marketing-section bg-muted">
        <div className="marketing-container story-row">
          <div className="story-visual" data-reveal>
            <Image src={visual.image} alt={visual.alt} fill sizes="(max-width: 767px) 100vw, 45vw" />
          </div>
          <div className="feature-detail-copy">
            <p className="marketing-eyebrow">Built for your working day</p>
            <h2>{visual.story}</h2>
            <p className="mt-5 text-muted-foreground">
              {pillar.title} brings the details together, so your team can spend more time taking care of the people behind the
              reviews.
            </p>
            <ul className="feature-detail-list">
              {pillar.bullets.map((bullet) => (
                <li key={bullet}>
                  <Check size={17} aria-hidden="true" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      {pillar.slug === "ai-replies" && <AutomaticRepliesFeature />}
      {pillar.slug === "review-collection" && (
        <section className="marketing-section">
          <div className="marketing-container grid gap-12 lg:grid-cols-2">
            <div>
              <p className="marketing-eyebrow">Make room for every kind of feedback</p>
              <h2 className="text-4xl">{NEGATIVE_FEEDBACK_SHIELD.headline}</h2>
              <p className="mt-6 text-muted-foreground">{NEGATIVE_FEEDBACK_SHIELD.result}</p>
            </div>
            <div>
              <ol className="feature-detail-list">
                {NEGATIVE_FEEDBACK_SHIELD.steps.map((step, i) => (
                  <li key={step}>
                    <span className="text-primary">0{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <Link href="/resources/review-request-templates" className="marketing-button marketing-button-secondary mt-6">
                Get the review request templates <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}
      <section className="marketing-section">
        <div className="marketing-container feature-detail-cta">
          <div>
            <p className="marketing-eyebrow">From $29.99 per month</p>
            <h2>
              More possibility.
              <br />
              Less busywork.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Review monitoring, replies, collection, and reporting in one workspace. Try it free for 7 days.
            </p>
          </div>
          <div className="marketing-actions">
            <Link href={SIGNUP_URL} className="marketing-button">
              Start free trial <ArrowRight size={16} />
            </Link>
            <Link
              href={pillar.cta.href === "/signup" ? "/pricing" : pillar.cta.href}
              className="marketing-button marketing-button-secondary"
            >
              {pillar.cta.href === "/signup" ? "Explore pricing" : pillar.cta.label}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
