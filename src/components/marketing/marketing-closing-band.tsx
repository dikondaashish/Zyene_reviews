import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";

interface MarketingClosingBandProps {
  title: string;
  text: string;
  primaryLabel: string;
  /** Defaults to SIGNUP_URL; pass the page's tracked signup URL when it has one. */
  primaryHref?: string;
  secondary: { label: string; href: string };
  /** A photo, or any other right-hand content (for example a list of next links). */
  image?: { src: string; alt: string };
  aside?: ReactNode;
  trackLocation: string;
}

/** Closing CTA band: the one place orange carries the surface, matching the homepage. */
export function MarketingClosingBand({ title, text, primaryLabel, primaryHref = SIGNUP_URL, secondary, image, aside, trackLocation }: MarketingClosingBandProps) {
  return (
    <section className="home-final" aria-labelledby="ind-final-heading">
      <div className="marketing-container">
        <div className="home-final-band">
          <div className="home-final-copy">
            <h2 id="ind-final-heading">{title}</h2>
            <p>{text}</p>
            <div className="home-final-actions">
              <Link href={primaryHref} className="marketing-button home-final-primary" data-track="trial" data-track-location={trackLocation}>
                {primaryLabel} <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href={secondary.href} className="marketing-button home-final-secondary">
                {secondary.label}
              </Link>
            </div>
          </div>
          {image ? (
            <div className="home-final-photo">
              <Image src={image.src} alt={image.alt} fill sizes="(max-width: 1023px) 100vw, 520px" />
            </div>
          ) : (
            aside
          )}
        </div>
      </div>
    </section>
  );
}
