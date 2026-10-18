import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";

interface MarketingClosingBandProps {
  title: string;
  text: string;
  /** Defaults to the site-wide trial label. */
  primaryLabel?: string;
  /** Defaults to SIGNUP_URL; pass the page's tracked signup URL when it has one. */
  primaryHref?: string;
  /** Defaults to "Book a demo". */
  secondary?: { label: string; href: string };
  /** A photo, or any other right-hand content (for example a list of next links). Without either, a trial-facts panel fills the space. */
  image?: { src: string; alt: string };
  aside?: ReactNode;
  trackLocation: string;
  headingId?: string;
}

const DEFAULT_SECONDARY = { label: "Book a demo", href: "/demo" };

/** Closing CTA band: the one place orange carries the surface, matching the homepage. */
export function MarketingClosingBand({
  title,
  text,
  primaryLabel = "Start 7-day free trial",
  primaryHref = SIGNUP_URL,
  secondary = DEFAULT_SECONDARY,
  image,
  aside,
  trackLocation,
  headingId = "ind-final-heading",
}: MarketingClosingBandProps) {
  return (
    <section className="home-final" aria-labelledby={headingId}>
      <div className="marketing-container">
        <div className="home-final-band">
          <div className="home-final-copy">
            <h2 id={headingId}>{title}</h2>
            <p>{text}</p>
            <ClosingActions primaryLabel={primaryLabel} primaryHref={primaryHref} secondary={secondary} trackLocation={trackLocation} />
          </div>
          {image ? (
            <div className="home-final-photo">
              <Image src={image.src} alt={image.alt} fill sizes="(max-width: 1023px) 100vw, 520px" />
            </div>
          ) : (
            aside ?? <ClosingHighlights />
          )}
        </div>
      </div>
    </section>
  );
}

const HIGHLIGHTS = [
  { title: "7-day free trial", text: "Start free, decide later" },
  { title: "From $29.99 a month", text: "Cancel anytime" },
  { title: "Every review in one place", text: "Google, Facebook and Yelp" },
];

function ClosingHighlights() {
  return (
    <ul className="home-final-aside" aria-label="What you get">
      {HIGHLIGHTS.map(({ title, text }) => (
        <li key={title}>
          <span className="home-final-aside-check" aria-hidden="true"><Check size={16} strokeWidth={3} /></span>
          <span>
            <strong>{title}</strong>
            <small>{text}</small>
          </span>
        </li>
      ))}
    </ul>
  );
}

function hrefProps(href: string, trackLocation: string) {
  if (href === "/demo") return { href, "data-track": "demo", "data-track-location": trackLocation };
  if (href === "/signup" || href === SIGNUP_URL) return { href: SIGNUP_URL, "data-track": "trial", "data-track-location": trackLocation };
  return { href };
}

function ClosingActions({ primaryLabel, primaryHref, secondary, trackLocation }: {
  primaryLabel: string; primaryHref: string; secondary: { label: string; href: string }; trackLocation: string;
}) {
  const primaryProps = primaryHref === "/demo" || primaryHref === "/signup" || primaryHref === SIGNUP_URL
    ? hrefProps(primaryHref, trackLocation)
    : { href: primaryHref, "data-track": "trial", "data-track-location": trackLocation };
  return (
    <div className="home-final-actions">
      <Link {...primaryProps} className="marketing-button home-final-primary">
        {primaryLabel} <ArrowRight size={16} aria-hidden="true" />
      </Link>
      <Link {...hrefProps(secondary.href, trackLocation)} className="marketing-button home-final-secondary">
        {secondary.label}
      </Link>
    </div>
  );
}
